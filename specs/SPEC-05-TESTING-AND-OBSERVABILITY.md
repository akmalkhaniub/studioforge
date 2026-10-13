# SPEC-05: StudioForge — Testing, Benchmarking & Observability Strategy

## 1. Automated Testing Strategy
- **Go Pipeline Unit & Concurrency Tests:**
  `go test -race ./services/pipeline-go/...` verifying priority queue ordering, admission backpressure triggers, and FFmpeg error trap routines.
- **Client Component & Hook Tests:**
  Vitest 3.x testing Apollo Client cache updates when `generationProgress` subscription yields final media URLs.
- **End-to-End Flow Tests:**
  Playwright testing full prompt submission → WebSocket progress stream → video player completion.

---

## 2. Load Testing & High-Throughput Benchmarks (ImagineArt Target)

### 2.1 Benchmark Target
- The Go ingestion gateway must ingest and schedule **5,000 generation requests/sec** with zero packet loss.
- P99 latency through admission controller and Redis Stream publish must remain under **12ms**.

### 2.2 k6 Ingestion & Queue Stress Test (`tests/load/k6-gen-stress.js`)
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 500 },
    { duration: '1m', target: 2500 },
    { duration: '30s', target: 5000 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<20'], // 99% under 20ms
    http_req_failed: ['rate<0.0005'],
  },
};

export default function () {
  const payload = JSON.stringify({
    query: `
      mutation CreateGen($input: CreateGenerationInput!) {
        createGeneration(input: $input) {
          id
          status
          priorityTier
        }
      }
    `,
    variables: {
      input: {
        prompt: 'Cinematic cyberpunk city rendered in octane, 8k resolution',
        type: 'IMAGE_TEXT_TO_IMAGE',
        modelId: 'model_flux_dev',
        steps: 25,
      },
    },
  });

  const res = http.post('http://localhost:8080/graphql', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, { 'is status 200': (r) => r.status === 200 });
  sleep(0.005);
}
```

---

## 3. Observability, Cost & GPU Metrics
- **Prometheus Metrics:**
  - `studioforge_active_gpu_workers_gauge`
  - `studioforge_vram_model_cache_hit_ratio`
  - `studioforge_generation_seconds_bucket`
  - `studioforge_ffmpeg_transcode_duration_ms`
  - `studioforge_cost_per_generation_cents`
- **Distributed Tracing:** Jaeger / OpenTelemetry traces tying Next.js client request ID all the way to GPU worker inference and S3 CDN URL creation.
