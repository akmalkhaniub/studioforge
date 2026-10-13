package events

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// GenerationTaskMessage mirrors the AsyncAPI contract in packages/api-graphql/asyncapi.yaml
type GenerationTaskMessage struct {
	TaskID         uuid.UUID `json:"taskId"`
	UserID         uuid.UUID `json:"userId"`
	Prompt         string    `json:"prompt"`
	NegativePrompt string    `json:"negativePrompt,omitempty"`
	GenType        string    `json:"genType"`
	ModelID        string    `json:"modelId"`
	Steps          int       `json:"steps"`
	Width          int       `json:"width"`
	Height         int       `json:"height"`
	FPS            int       `json:"fps,omitempty"`
	Priority       string    `json:"priority"` // "VIP" | "STANDARD" | "BATCH"
	RetryCount     int       `json:"retryCount"`
	SubmittedAt    time.Time `json:"submittedAt"`
}

func (m *GenerationTaskMessage) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func FromJSON(data []byte) (*GenerationTaskMessage, error) {
	var m GenerationTaskMessage
	err := json.Unmarshal(data, &m)
	return &m, err
}
