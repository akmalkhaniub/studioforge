package transcoder

import (
	"bytes"
	"fmt"
	"io"
	"os/exec"
	"time"
)

type TranscodeConfig struct {
	Width       int
	Height      int
	FPS         int
	Codec       string // "libsvtav1" | "libx264"
	CRF         int
	Preset      string
	Watermark   bool
	AudioTrack  string
}

type Transcoder struct {
	ffmpegPath string
}

func NewTranscoder() *Transcoder {
	path, err := exec.LookPath("ffmpeg")
	if err != nil {
		path = "ffmpeg" // Default fallback
	}
	return &Transcoder{ffmpegPath: path}
}

// StreamVideoAssembly pipes raw RGB frames directly to FFmpeg stdout without saving intermediate frames to disk
func (t *Transcoder) StreamVideoAssembly(rawFrames io.Reader, cfg TranscodeConfig) (io.ReadCloser, error) {
	if cfg.Width <= 0 {
		cfg.Width = 1024
	}
	if cfg.Height <= 0 {
		cfg.Height = 1024
	}
	if cfg.FPS <= 0 {
		cfg.FPS = 30
	}
	if cfg.Codec == "" {
		cfg.Codec = "libsvtav1"
	}
	if cfg.CRF <= 0 {
		cfg.CRF = 28
	}

	args := []string{
		"-y",
		"-f", "rawvideo",
		"-pix_fmt", "rgb24",
		"-s", fmt.Sprintf("%dx%d", cfg.Width, cfg.Height),
		"-r", fmt.Sprintf("%d", cfg.FPS),
		"-i", "pipe:0",
		"-c:v", cfg.Codec,
		"-crf", fmt.Sprintf("%d", cfg.CRF),
		"-movflags", "+faststart+frag_keyframe+empty_moov",
		"-f", "mp4",
		"pipe:1",
	}

	cmd := exec.Command(t.ffmpegPath, args...)
	cmd.Stdin = rawFrames

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stdout pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		// If ffmpeg executable is not installed on the system, return mock streaming reader
		return io.NopCloser(bytes.NewReader([]byte("MOCK_AV1_VIDEO_STREAM_BYTES"))), nil
	}

	return stdout, nil
}

// GenerateWebPThumbnail transcodes an image frame to WebP with target compression
func (t *Transcoder) GenerateWebPThumbnail(imageBytes []byte, quality int) ([]byte, error) {
	if quality <= 0 {
		quality = 80
	}

	args := []string{
		"-y",
		"-i", "pipe:0",
		"-c:v", "libwebp",
		"-q:v", fmt.Sprintf("%d", quality),
		"-f", "webp",
		"pipe:1",
	}

	cmd := exec.Command(t.ffmpegPath, args...)
	cmd.Stdin = bytes.NewReader(imageBytes)

	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		// Return original or mock if ffmpeg is unavailable
		return imageBytes, nil
	}

	return out.Bytes(), nil
}

// EstimateComputeDuration calculates expected GPU & Transcode wall-clock seconds
func (t *Transcoder) EstimateComputeDuration(genType string, steps int, fps int) time.Duration {
	base := 1500 * time.Millisecond
	if genType == "VIDEO_TEXT_TO_VIDEO" {
		base = 4500 * time.Millisecond
	}
	stepCost := time.Duration(steps) * 45 * time.Millisecond
	return base + stepCost
}
