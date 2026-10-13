-- PostgreSQL 17 DDL for StudioForge GenAI Pipeline
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    fps INT NOT NULL DEFAULT 30,
    preview_url TEXT,
    final_media_url TEXT,
    error_reason TEXT,
    duration_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_gen_tasks_user_created ON generation_tasks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gen_tasks_status ON generation_tasks (status);

CREATE TABLE IF NOT EXISTS worker_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    worker_id VARCHAR(64) NOT NULL,
    gpu_model VARCHAR(32) NOT NULL,
    vram_used_mb INT NOT NULL,
    vram_total_mb INT NOT NULL,
    gpu_utilization_pct NUMERIC(5,2) NOT NULL,
    temperature_c NUMERIC(5,2) NOT NULL,
    active_tasks INT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_worker_telemetry_worker_time ON worker_telemetry (worker_id, recorded_at DESC);
