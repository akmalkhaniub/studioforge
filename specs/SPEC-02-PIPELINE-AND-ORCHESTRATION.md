# SPEC-02: StudioForge — High-Throughput Generation Pipeline & Worker Orchestration

## 1. Architectural Mandate (Addressing ImagineArt's Core Workload)
At ImagineArt scale, thousands of concurrent users request image and video generations simultaneously. This engine is written in **Go 1.25+** to maintain sub-millisecond dispatch times, zero garbage collector stalls, and resilient GPU allocation.

---

## 2. Ingestion & Priority Queuing (VIP vs Batch)

### 2.1 Multi-Tier Queuing
Incoming generation tasks are partitioned into priority streams:
1. **Tier 1 (`stream:vip`):** Interactive user prompts (Web & Mobile UI active users). Target dispatch latency: `< 50ms`.
2. **Tier 2 (`stream:standard`):** Standard API integrations.
3. **Tier 3 (`stream:batch`):** Bulk video rendering and background training jobs, dispatched exclusively to low-cost spot GPU instances.

### 2.2 Adaptive Backpressure & Dynamic Sampling Degradation
When GPU queues saturate (total queued tasks > 10,000 or p99 queue time > 3,000ms):
- Instead of dropping user requests, the Admission Controller dynamically reduces the default sampling steps (e.g. Euler 30 steps → 22 steps).
- This yields a **35% reduction in GPU compute time** per request, instantly restoring queue equilibrium without degrading user experience.

---

## 3. Worker State Machine & Warm-Cache Routing

### 3.1 Worker State Lifecycle
```text
[IDLE] ──(Job Assigned)──> [RESERVED] ──(VRAM Check)──> [INFERRING] ──(Frames Generated)──> [TRANSCODING] ──> [IDLE]
                               │
                       (Worker Crashed)
                               │
                               ▼
                       [DRAINING / RESTART]
```

### 3.2 VRAM Cache Affinity
- Loading a 24GB diffusion model (e.g. FLUX.1 or Stable Video Diffusion) over PCIe takes up to 20 seconds.
- The Go Orchestrator tracks the `ActiveModelID` loaded on each worker pod.
- Jobs requesting `model_flux_dev` are dispatched directly to workers where `ActiveModelID == "model_flux_dev"`, avoiding redundant model reloading.

---

## 4. Streaming Media Transcoding & Assembly (FFmpeg 7.x Pipes)

Video generation models output individual raw tensor frames. Assembling these into a streaming MP4/AV1 video file must happen asynchronously with zero disk bottleneck:

```go
package transcoder

import (
	"io"
	"os/exec"
)

// StreamVideoAssembly pipes raw frames directly into FFmpeg and streams MP4 out to S3
func StreamVideoAssembly(rawFramesReader io.Reader, width, height, fps int) (io.ReadCloser, error) {
	cmd := exec.Command("ffmpeg",
		"-f", "rawvideo",
		"-pix_fmt", "rgb24",
		"-s", fmt.Sprintf("%dx%d", width, height),
		"-r", fmt.Sprintf("%d", fps),
		"-i", "pipe:0",                     // Read raw frames from stdin
		"-c:v", "libsvtav1",                // High efficiency AV1 codec
		"-crf", "28",
		"-preset", "6",
		"-movflags", "+faststart+frag_keyframe+empty_moov",
		"-f", "mp4",
		"pipe:1",                            // Output streaming MP4 to stdout
	)

	cmd.Stdin = rawFramesReader
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}

	if err := cmd.Start(); err != nil {
		return nil, err
	}

	return stdout, nil
}
```

---

## 5. Dead-Letter Queue (DLQ) & Failure Recovery
1. **CUDA Out of Memory (OOM):** The orchestrator catches CUDA exit code 137. It downgrades generation resolution (e.g. 1024x1024 → 768x768) and re-enqueues the job to a retry queue with a max limit of 2 retries.
2. **Worker Disconnection:** Heartbeat monitor detects missing pings (> 3s). The unacknowledged job is reclaimed via `XAUTOCLAIM` and given to a healthy worker.
3. **Poison Pills:** Jobs failing repeatedly (> 3 times) are moved to `stream:dlq` and an engineering alert is emitted via the GraphQL subscription.
