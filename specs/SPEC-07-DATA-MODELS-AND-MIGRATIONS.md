# SPEC-07: StudioForge — Relational Schemas, Redis Keys & Migration DDL

## 1. Storage Topology
- **Primary Relational Store:** PostgreSQL 17 (Workflows, user quotas, metadata, task history).
- **Time-Series Engine:** TimescaleDB extension on PostgreSQL for GPU telemetry and worker resource tracking.
- **Message Broker & Ephemeral State:** Redis 7.4 (Valkey) Streams + Hashes.
- **Blob / Object Storage:** MinIO / Cloudflare R2 (Audio/Video frames, rendered MP4, WebP previews).

---

## 2. PostgreSQL 17 Relational DDL (`migrations/000001_init_schema.up.sql`)

```sql
-- Enable UUID and TimescaleDB extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;

-- Enums
CREATE TYPE generation_type AS ENUM (
    'IMAGE_TEXT_TO_IMAGE',
    'IMAGE_TO_IMAGE',
    'VIDEO_TEXT_TO_VIDEO',
    'VIDEO_INTERPOLATION'
);

CREATE TYPE task_status AS ENUM (
    'QUEUED',
    'IN_PROGRESS',
    'TRANSCODING',
    'COMPLETED',
    'FAILED'
);

CREATE TYPE priority_tier AS ENUM (
    'VIP',
    'STANDARD',
    'BATCH'
);

-- Generation Tasks Table
CREATE TABLE IF NOT EXISTS generation_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    gen_type generation_type NOT NULL,
    model_id VARCHAR(64) NOT NULL,
    status task_status NOT NULL DEFAULT 'QUEUED',
    priority priority_tier NOT NULL DEFAULT 'STANDARD',
    sampling_steps INT NOT NULL DEFAULT 30,
    width INT NOT NULL DEFAULT 1024,
    height INT NOT NULL DEFAULT 1024,
    fps INT DEFAULT 30,
    preview_url TEXT,
    final_media_url TEXT,
    error_reason TEXT,
    duration_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Index for high-concurrency status lookups & user history
CREATE INDEX idx_gen_tasks_user_created ON generation_tasks (user_id, created_at DESC);
CREATE INDEX idx_gen_tasks_status ON generation_tasks (status) WHERE status IN ('QUEUED', 'IN_PROGRESS', 'TRANSCODING');

-- Worker Telemetry (TimescaleDB Hypertable for metrics analysis)
CREATE TABLE IF NOT EXISTS worker_telemetry (
    time TIMESTAMPTZ NOT NULL,
    worker_id VARCHAR(64) NOT NULL,
    gpu_model VARCHAR(32) NOT NULL,
    vram_used_mb INT NOT NULL,
    vram_total_mb INT NOT NULL,
    gpu_utilization_pct NUMERIC(5,2) NOT NULL,
    temperature_c NUMERIC(5,2) NOT NULL,
    active_tasks INT NOT NULL
);

SELECT create_hypertable('worker_telemetry', 'time', if_not_exists => TRUE);
```

---

## 3. Redis 7.4 Streams & Key Specifications

| Key Pattern | Data Structure | Purpose | TTL |
| :--- | :--- | :--- | :--- |
| `stream:tasks:vip` | Redis Stream | High-priority interactive generation queue. | Retained 24h via `MAXLEN ~ 100000` |
| `stream:tasks:batch` | Redis Stream | Low-priority background/spot generation queue. | Retained 72h via `MAXLEN ~ 500000` |
| `stream:tasks:dlq` | Redis Stream | Dead-letter queue for tasks failing repeatedly. | 7 days |
| `worker:heartbeat:{worker_id}` | Redis Hash | Worker state, cached model ID, and VRAM available. | TTL 10 seconds |
| `cache:task:{task_id}` | Redis Hash | Live denoising progress and current step percentage. | TTL 2 hours |
