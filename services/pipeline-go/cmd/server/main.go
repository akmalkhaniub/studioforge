package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"studioforge/pipeline-go/internal/admission"
	"studioforge/pipeline-go/internal/events"
	"studioforge/pipeline-go/internal/graphql"
	"studioforge/pipeline-go/internal/orchestrator"
	"studioforge/pipeline-go/internal/queue"
	"studioforge/pipeline-go/internal/transcoder"

	"github.com/google/uuid"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	log.Println("==> Starting StudioForge High-Throughput GenAI Pipeline (Go 1.26)...")

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 1. Initialize Admission Controller & Backpressure
	admController := admission.NewController(10000, 2000)

	// 2. Initialize Queue Engine (In-Memory buffer with Redis Streams parity)
	queueEngine := queue.NewMemoryEngine(50000)

	// 3. Initialize Transcoder (FFmpeg 7.x streaming pipe)
	_ = transcoder.NewTranscoder()

	// 4. Initialize GraphQL Server and pass progress handler
	var gqlServer *graphql.Server

	progressCallback := func(taskID uuid.UUID, status string, progressPct int, currentStep int, totalSteps int, previewURL string, etaSeconds float64) {
		if gqlServer != nil {
			gqlServer.OnTaskProgress(taskID, status, progressPct, currentStep, totalSteps, previewURL, etaSeconds)
		}
	}

	// 5. Initialize GPU Worker Pool (Dual-Mode: 32 GPU workers)
	workerPool := orchestrator.NewWorkerPool(32, progressCallback)

	gqlServer = graphql.NewServer(admController, queueEngine, workerPool)

	// 6. Start Asynchronous Queue Workers for VIP and BATCH streams
	for i := 0; i < 8; i++ {
		_ = queueEngine.Consume(ctx, "VIP", func(msg *events.GenerationTaskMessage) error {
			_, err := workerPool.ExecuteInference(ctx, msg)
			return err
		})
	}

	for i := 0; i < 4; i++ {
		_ = queueEngine.Consume(ctx, "BATCH", func(msg *events.GenerationTaskMessage) error {
			_, err := workerPool.ExecuteInference(ctx, msg)
			return err
		})
	}

	// 7. Route Handlers
	mux := http.NewServeMux()
	mux.HandleFunc("/graphql", gqlServer.HandleGraphQL)
	mux.HandleFunc("/graphql/ws", gqlServer.HandleSubscriptions)
	mux.Handle("/metrics", promhttp.Handler())
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"HEALTHY","service":"studioforge-pipeline"}`))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	go func() {
		log.Printf("🚀 StudioForge Pipeline Gateway listening on http://localhost:%s/graphql\n", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	log.Println("Shutting down pipeline gateway gracefully...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()
	_ = server.Shutdown(shutdownCtx)
	fmt.Println("Pipeline gateway stopped.")
}
