package queue

import (
	"context"
	"fmt"
	"sync"
	"time"

	"studioforge/pipeline-go/internal/events"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type Engine interface {
	Enqueue(ctx context.Context, msg *events.GenerationTaskMessage) error
	Consume(ctx context.Context, tier string, handler func(msg *events.GenerationTaskMessage) error) error
	EnqueueDLQ(ctx context.Context, msg *events.GenerationTaskMessage, reason string) error
	GetQueueDepths(ctx context.Context) (vip int64, batch int64, err error)
}

// MemoryEngine is a high-concurrency non-blocking queue for tests and local standalone runs
type MemoryEngine struct {
	vipChan      chan *events.GenerationTaskMessage
	standardChan chan *events.GenerationTaskMessage
	batchChan    chan *events.GenerationTaskMessage
	dlqChan      chan *events.GenerationTaskMessage
	mu           sync.RWMutex
	inFlight     map[uuid.UUID]*events.GenerationTaskMessage
}

func NewMemoryEngine(bufferSize int) *MemoryEngine {
	return &MemoryEngine{
		vipChan:      make(chan *events.GenerationTaskMessage, bufferSize),
		standardChan: make(chan *events.GenerationTaskMessage, bufferSize),
		batchChan:    make(chan *events.GenerationTaskMessage, bufferSize*2),
		dlqChan:      make(chan *events.GenerationTaskMessage, bufferSize),
		inFlight:     make(map[uuid.UUID]*events.GenerationTaskMessage),
	}
}

func (m *MemoryEngine) Enqueue(ctx context.Context, msg *events.GenerationTaskMessage) error {
	m.mu.Lock()
	m.inFlight[msg.TaskID] = msg
	m.mu.Unlock()

	switch msg.Priority {
	case "VIP":
		select {
		case m.vipChan <- msg:
			return nil
		default:
			return fmt.Errorf("vip queue saturated")
		}
	case "BATCH":
		select {
		case m.batchChan <- msg:
			return nil
		default:
			return fmt.Errorf("batch queue saturated")
		}
	default:
		select {
		case m.standardChan <- msg:
			return nil
		default:
			return fmt.Errorf("standard queue saturated")
		}
	}
}

func (m *MemoryEngine) Consume(ctx context.Context, tier string, handler func(msg *events.GenerationTaskMessage) error) error {
	var targetChan <-chan *events.GenerationTaskMessage
	switch tier {
	case "VIP":
		targetChan = m.vipChan
	case "BATCH":
		targetChan = m.batchChan
	default:
		targetChan = m.standardChan
	}

	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case msg, ok := <-targetChan:
				if !ok {
					return
				}
				if err := handler(msg); err != nil {
					if msg.RetryCount < 2 {
						msg.RetryCount++
						time.Sleep(time.Duration(msg.RetryCount*150) * time.Millisecond)
						_ = m.Enqueue(ctx, msg)
					} else {
						_ = m.EnqueueDLQ(ctx, msg, err.Error())
					}
				}
				m.mu.Lock()
				delete(m.inFlight, msg.TaskID)
				m.mu.Unlock()
			}
		}
	}()
	return nil
}

func (m *MemoryEngine) EnqueueDLQ(ctx context.Context, msg *events.GenerationTaskMessage, reason string) error {
	select {
	case m.dlqChan <- msg:
		return nil
	default:
		return fmt.Errorf("dlq saturated")
	}
}

func (m *MemoryEngine) GetQueueDepths(ctx context.Context) (vip int64, batch int64, err error) {
	return int64(len(m.vipChan)), int64(len(m.batchChan)), nil
}

// RedisEngine connects to Redis 7.4 Streams for distributed multi-pod worker scaling
type RedisEngine struct {
	client *redis.Client
}

func NewRedisEngine(rdb *redis.Client) *RedisEngine {
	return &RedisEngine{client: rdb}
}

func (r *RedisEngine) Enqueue(ctx context.Context, msg *events.GenerationTaskMessage) error {
	data, err := msg.ToJSON()
	if err != nil {
		return err
	}

	streamKey := fmt.Sprintf("stream:tasks:%s", msg.Priority)
	return r.client.XAdd(ctx, &redis.XAddArgs{
		Stream: streamKey,
		Values: map[string]interface{}{
			"payload": data,
			"taskId":  msg.TaskID.String(),
		},
	}).Err()
}

func (r *RedisEngine) Consume(ctx context.Context, tier string, handler func(msg *events.GenerationTaskMessage) error) error {
	streamKey := fmt.Sprintf("stream:tasks:%s", tier)
	groupName := "inference_workers_v1"
	consumerName := fmt.Sprintf("worker-%s", uuid.New().String()[:8])

	_ = r.client.XGroupCreateMkStream(ctx, streamKey, groupName, "0").Err()

	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			default:
				entries, err := r.client.XReadGroup(ctx, &redis.XReadGroupArgs{
					Group:    groupName,
					Consumer: consumerName,
					Streams:  []string{streamKey, ">"},
					Count:    10,
					Block:    1000 * time.Millisecond,
				}).Result()

				if err != nil || len(entries) == 0 {
					continue
				}

				for _, stream := range entries {
					for _, message := range stream.Messages {
						rawPayload, ok := message.Values["payload"].(string)
						if !ok {
							continue
						}

						msg, err := events.FromJSON([]byte(rawPayload))
						if err == nil {
							if handleErr := handler(msg); handleErr == nil {
								_ = r.client.XAck(ctx, streamKey, groupName, message.ID)
							}
						}
					}
				}
			}
		}
	}()

	return nil
}

func (r *RedisEngine) EnqueueDLQ(ctx context.Context, msg *events.GenerationTaskMessage, reason string) error {
	data, err := msg.ToJSON()
	if err != nil {
		return err
	}
	return r.client.XAdd(ctx, &redis.XAddArgs{
		Stream: "stream:tasks:dlq",
		Values: map[string]interface{}{
			"payload": data,
			"reason":  reason,
		},
	}).Err()
}

func (r *RedisEngine) GetQueueDepths(ctx context.Context) (vip int64, batch int64, err error) {
	vipLen, err1 := r.client.XLen(ctx, "stream:tasks:VIP").Result()
	batchLen, err2 := r.client.XLen(ctx, "stream:tasks:BATCH").Result()
	if err1 != nil {
		return 0, 0, err1
	}
	if err2 != nil {
		return 0, 0, err2
	}
	return vipLen, batchLen, nil
}
