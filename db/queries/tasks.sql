-- name: CreateGenerationTask :one
INSERT INTO generation_tasks (
    user_id, prompt, negative_prompt, gen_type, model_id, status, priority,
    sampling_steps, width, height, fps
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
) RETURNING *;

-- name: GetGenerationTask :one
SELECT * FROM generation_tasks
WHERE id = $1 LIMIT 1;

-- name: UpdateTaskProgress :one
UPDATE generation_tasks
SET 
    status = $2,
    preview_url = COALESCE($3, preview_url),
    final_media_url = COALESCE($4, final_media_url),
    error_reason = COALESCE($5, error_reason),
    duration_ms = COALESCE($6, duration_ms),
    updated_at = NOW(),
    completed_at = CASE WHEN $2 IN ('COMPLETED', 'FAILED') THEN NOW() ELSE completed_at END
WHERE id = $1
RETURNING *;

-- name: ListRecentTasks :many
SELECT * FROM generation_tasks
WHERE ($1::task_status IS NULL OR status = $1)
ORDER BY created_at DESC
LIMIT $2;

-- name: RecordWorkerTelemetry :one
INSERT INTO worker_telemetry (
    worker_id, gpu_model, vram_used_mb, vram_total_mb,
    gpu_utilization_pct, temperature_c, active_tasks
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING *;

-- name: GetLatestWorkerTelemetry :many
SELECT DISTINCT ON (worker_id) *
FROM worker_telemetry
ORDER BY worker_id, recorded_at DESC;
