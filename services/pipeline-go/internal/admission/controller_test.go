package admission_test

import (
	"testing"

	"studioforge/pipeline-go/internal/admission"
)

func TestAdmissionController_NormalLoad(t *testing.T) {
	c := admission.NewController(1000, 100)

	// Normal load should admit all tiers
	if !c.CanAdmit("VIP") {
		t.Errorf("expected VIP to be admitted under normal load")
	}
	if !c.CanAdmit("STANDARD") {
		t.Errorf("expected STANDARD to be admitted under normal load")
	}
	if !c.CanAdmit("BATCH") {
		t.Errorf("expected BATCH to be admitted under normal load")
	}
}

func TestAdmissionController_SevereLoadShedding(t *testing.T) {
	c := admission.NewController(1000, 100)

	// Inject severe cluster stress (p99 > 2500ms, VRAM > 94%)
	c.UpdateHealth(&admission.ClusterHealth{
		P99QueueLatencyMs: 2800,
		ActiveGPUWorkers:  64,
		VRAMSaturationPct: 96,
		TotalQueuedTasks:  8500,
	})

	if !c.CanAdmit("VIP") {
		t.Errorf("expected VIP to be admitted during severe load")
	}
	if c.CanAdmit("STANDARD") {
		t.Errorf("expected STANDARD to be shed during severe load")
	}
	if c.CanAdmit("BATCH") {
		t.Errorf("expected BATCH to be shed during severe load")
	}
}

func TestAdmissionController_SamplingDegradation(t *testing.T) {
	c := admission.NewController(1000, 100)

	// Moderate high load triggers step optimization (30 steps -> 22 steps for batch)
	c.UpdateHealth(&admission.ClusterHealth{
		P99QueueLatencyMs: 1250,
		ActiveGPUWorkers:  64,
		VRAMSaturationPct: 88,
		TotalQueuedTasks:  6200,
	})

	optimizedBatch := c.OptimizeSamplingSteps(30, "BATCH")
	if optimizedBatch >= 30 {
		t.Errorf("expected batch steps to be degraded, got %d", optimizedBatch)
	}

	optimizedStandard := c.OptimizeSamplingSteps(30, "STANDARD")
	if optimizedStandard >= 30 {
		t.Errorf("expected standard steps to be degraded, got %d", optimizedStandard)
	}

	// VIP steps should stay at full fidelity
	vipSteps := c.OptimizeSamplingSteps(30, "VIP")
	if vipSteps != 30 {
		t.Errorf("expected VIP steps to remain 30, got %d", vipSteps)
	}
}
