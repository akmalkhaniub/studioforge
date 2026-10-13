package admission

import (
	"sync"
	"sync/atomic"
	"time"
)

type ClusterHealth struct {
	P99QueueLatencyMs int64
	ActiveGPUWorkers  int32
	VRAMSaturationPct int32 // 0 - 100
	TotalQueuedTasks  int64
}

type Controller struct {
	mu           sync.RWMutex
	health       atomic.Pointer[ClusterHealth]
	tokens       atomic.Int64
	maxTokens    int64
	refillRate   int64 // tokens per second
	lastRefillAt atomic.Int64
}

func NewController(maxBurst int64, refillPerSec int64) *Controller {
	c := &Controller{
		maxTokens:  maxBurst,
		refillRate: refillPerSec,
	}
	c.tokens.Store(maxBurst)
	c.lastRefillAt.Store(time.Now().UnixNano())

	defaultHealth := &ClusterHealth{
		P99QueueLatencyMs: 45,
		ActiveGPUWorkers:  64,
		VRAMSaturationPct: 62,
		TotalQueuedTasks:  120,
	}
	c.health.Store(defaultHealth)
	return c
}

// UpdateHealth updates cluster telemetry used for backpressure decisions
func (c *Controller) UpdateHealth(h *ClusterHealth) {
	c.health.Store(h)
}

func (c *Controller) GetHealth() *ClusterHealth {
	return c.health.Load()
}

// CanAdmit evaluates admission based on client tier and cluster stress
func (c *Controller) CanAdmit(priorityTier string) bool {
	h := c.health.Load()
	if h == nil {
		return true
	}

	// Severity 1: Critical Overload (p99 > 2500ms or VRAM > 94%)
	if h.P99QueueLatencyMs > 2500 || h.VRAMSaturationPct > 94 {
		return priorityTier == "VIP"
	}

	// Severity 2: High Load (p99 > 1200ms or VRAM > 85%)
	if h.P99QueueLatencyMs > 1200 || h.VRAMSaturationPct > 85 {
		return priorityTier == "VIP" || priorityTier == "STANDARD"
	}

	return true
}

// OptimizeSamplingSteps dynamically degrades sampling steps during traffic spikes
// to preserve throughput without dropping customer requests (e.g. 30 -> 22 steps)
func (c *Controller) OptimizeSamplingSteps(requestedSteps int, priorityTier string) int {
	h := c.health.Load()
	if h == nil {
		return requestedSteps
	}

	if requestedSteps <= 10 {
		return requestedSteps
	}

	// Under severe queue load, reduce steps for batch/standard to clear backlog 35% faster
	if h.TotalQueuedTasks > 5000 || h.P99QueueLatencyMs > 1000 {
		if priorityTier == "BATCH" {
			return int(float64(requestedSteps) * 0.65) // 35% step reduction
		}
		if priorityTier == "STANDARD" {
			return int(float64(requestedSteps) * 0.80) // 20% step reduction
		}
	}

	return requestedSteps
}
