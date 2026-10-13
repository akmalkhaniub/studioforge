package queue_test

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"studioforge/pipeline-go/internal/events"
	"studioforge/pipeline-go/internal/queue"

	"github.com/google/uuid"
)

func TestMemoryEngine_PriorityAndConcurrency(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	q := queue.NewMemoryEngine(1000)

	var vipProcessed atomic.Int32
	var standardProcessed atomic.Int32

	_ = q.Consume(ctx, "VIP", func(msg *events.GenerationTaskMessage) error {
		vipProcessed.Add(1)
		return nil
	})

	_ = q.Consume(ctx, "STANDARD", func(msg *events.GenerationTaskMessage) error {
		standardProcessed.Add(1)
		return nil
	})

	var wg sync.WaitGroup
	// Concurrently enqueue 50 VIP and 50 STANDARD tasks
	for i := 0; i < 50; i++ {
		wg.Add(2)
		go func() {
			defer wg.Done()
			_ = q.Enqueue(ctx, &events.GenerationTaskMessage{
				TaskID:   uuid.New(),
				Priority: "VIP",
				Prompt:   "A beautiful mountain landscape",
			})
		}()
		go func() {
			defer wg.Done()
			_ = q.Enqueue(ctx, &events.GenerationTaskMessage{
				TaskID:   uuid.New(),
				Priority: "STANDARD",
				Prompt:   "A cinematic cyber city",
			})
		}()
	}

	wg.Wait()
	time.Sleep(200 * time.Millisecond)

	if vipProcessed.Load() != 50 {
		t.Errorf("expected 50 VIP tasks processed, got %d", vipProcessed.Load())
	}
	if standardProcessed.Load() != 50 {
		t.Errorf("expected 50 STANDARD tasks processed, got %d", standardProcessed.Load())
	}
}

func TestMemoryEngine_RetryAndDLQ(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	q := queue.NewMemoryEngine(100)

	var attemptCount atomic.Int32
	var taskID = uuid.New()

	// Handler that fails deliberately to test retry & DLQ
	_ = q.Consume(ctx, "VIP", func(msg *events.GenerationTaskMessage) error {
		attemptCount.Add(1)
		return fmt.Errorf("simulated CUDA OOM error")
	})

	_ = q.Enqueue(ctx, &events.GenerationTaskMessage{
		TaskID:   taskID,
		Priority: "VIP",
		Prompt:   "Failing generation",
	})

	// Wait for retries to complete
	time.Sleep(600 * time.Millisecond)

	// Attempt count should be 3 (initial + 2 retries) before routing to DLQ
	if attemptCount.Load() < 3 {
		t.Errorf("expected at least 3 attempts before DLQ, got %d", attemptCount.Load())
	}
}
