package orchestrator_test

import (
	"context"
	"sync/atomic"
	"testing"
	"time"

	"studioforge/pipeline-go/internal/events"
	"studioforge/pipeline-go/internal/orchestrator"

	"github.com/google/uuid"
)

func TestWorkerPool_WarmCacheAffinity(t *testing.T) {
	pool := orchestrator.NewWorkerPool(8, nil)

	// Worker 1 has "model_flux_dev" cached by default
	w1, err := pool.SelectWorkerWithAffinity("model_flux_dev")
	if err != nil {
		t.Fatalf("failed to select worker: %v", err)
	}
	if w1.CachedModelID != "model_flux_dev" {
		t.Errorf("expected worker to have cached model_flux_dev, got %s", w1.CachedModelID)
	}

	pool.ReleaseWorker(w1.ID)

	// Selecting an uncached model should allocate an idle worker and update its cache
	w2, err := pool.SelectWorkerWithAffinity("model_svd_xt")
	if err != nil {
		t.Fatalf("failed to select worker: %v", err)
	}
	if w2.CachedModelID != "model_svd_xt" {
		t.Errorf("expected worker cache to be updated to model_svd_xt, got %s", w2.CachedModelID)
	}
	pool.ReleaseWorker(w2.ID)
}

func TestWorkerPool_ProgressStreaming(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	var progressTicks atomic.Int32
	var finalURLReceived atomic.Bool

	onProgress := func(taskID uuid.UUID, status string, progressPct int, currentStep int, totalSteps int, previewURL string, etaSeconds float64) {
		progressTicks.Add(1)
		if status == "COMPLETED" && previewURL != "" {
			finalURLReceived.Store(true)
		}
	}

	pool := orchestrator.NewWorkerPool(4, onProgress)

	task := &events.GenerationTaskMessage{
		TaskID:   uuid.New(),
		Prompt:   "A beautiful futuristic architecture in 8k",
		GenType:  "IMAGE_TEXT_TO_IMAGE",
		ModelID:  "model_flux_dev",
		Steps:    5, // 5 fast steps for unit testing
		Priority: "VIP",
	}

	finalURL, err := pool.ExecuteInference(ctx, task)
	if err != nil {
		t.Fatalf("expected inference to succeed, got error: %v", err)
	}
	if finalURL == "" {
		t.Errorf("expected valid final URL")
	}
	if progressTicks.Load() < 5 {
		t.Errorf("expected at least 5 progress ticks, got %d", progressTicks.Load())
	}
	if !finalURLReceived.Load() {
		t.Errorf("expected final URL to be broadcast in completed progress event")
	}
}
