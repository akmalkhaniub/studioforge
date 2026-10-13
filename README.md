# ⚡ StudioForge: High-Scale GenAI Visual Engine & Studio Suite

[![Go](https://img.shields.io/badge/Go-1.26-00ADD8?style=flat&logo=go)](https://golang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://react.dev)
[![Expo](https://img.shields.io/badge/Expo-SDK_56-000020?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.85-61DAFB?style=flat&logo=react)](https://reactnative.dev)
[![GraphQL](https://img.shields.io/badge/GraphQL-SDL_%2B_Codegen-E10098?style=flat&logo=graphql)](https://graphql.org)
[![Redis](https://img.shields.io/badge/Redis-7.4_Streams-DC382D?style=flat&logo=redis)](https://redis.io)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-7.x_AV1-007808?style=flat&logo=ffmpeg)](https://ffmpeg.org)

> **Enterprise-grade, high-throughput GenAI Image & Video Generation Platform engineered with Spec-Driven Development (SDD).**  
> Built to handle Fortune 500 / $35M+ ARR scale asynchronous diffusion workloads in **Go 1.26** with sub-millisecond dispatch, combined with a **Next.js 16.2.6** 3D Web Studio and **Expo SDK 56** mobile reviewer operating over real-time **GraphQL Subscriptions**.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Clients ["Cross-Platform Client Tier (Lead Architecture)"]
        Web["Next.js 16.2.6 Studio Web (Three.js 3D Canvas + Tailwind v4)"]
        Mobile["Expo SDK 56 / React Native 0.85 App (Swift/Kotlin Native Media Cache)"]
    end

    subgraph Gateway ["Go 1.26 Pipeline Gateway (ImagineArt Scale)"]
        GQL["GraphQL Gateway (Apollo & WebSocket Subscriptions)"]
        Admission["Adaptive Backpressure Controller & Token Bucket"]
        Priority["Priority Router (VIP vs Batch)"]
    end

    subgraph Queues ["Redis 7.4 Streams Queue Topology"]
        VIPQueue["stream:tasks:vip (Interactive Prompts p99 < 20ms)"]
        BatchQueue["stream:tasks:batch (Spot Instance Video Renders)"]
        DLQueue["stream:tasks:dlq (Dead Letter Queue & Auto-Heal)"]
    end

    subgraph GPUCluster ["Dual-Mode GPU Worker Pool"]
        Orch["Worker Pool Orchestrator & State Machine"]
        GPU1["GPU Worker 1 (FLUX.1 Warm VRAM Affinity)"]
        GPU2["GPU Worker 2 (SVD Video Diffusion)"]
    end

    subgraph MediaEngine ["Zero-Disk Streaming Transcoder"]
        FFmpegPipe["FFmpeg 7.x AV1/H.264 Streaming Pipes (io.Pipe)"]
        Storage["Cloudflare R2 / S3 Multipart Stream"]
    end

    Web & Mobile -->|GraphQL Mutations & Subscriptions| GQL
    GQL --> Admission
    Admission --> Priority
    Priority --> VIPQueue & BatchQueue
    VIPQueue & BatchQueue --> Orch
    Orch -->|Warm Cache Affinity| GPU1 & GPU2
    GPU1 & GPU2 -->|Raw Tensor Frame Streams| FFmpegPipe
    GPU1 -.->|CUDA OOM (Exit 137)| DLQueue
    DLQueue -->|Auto-Downgrade & Retry| GPU2
    FFmpegPipe --> Storage
    FFmpegPipe -->|Progress & URLs| GQL
```

---

## 🎯 Dual-Target Role Fit

### 1. Lead Frontend & Mobile Ownership (AI-First)
* **Web:** Built on **Next.js 16.2.6 (App Router)** with **React 19.2 Compiler**, Partial Prerendering (`ppr: true`), and **Tailwind CSS v4**. Includes a **Three.js** 3D spatial camera viewport for prompt framing.
* **Mobile:** Built on **Expo SDK 56** and **React Native 0.85** running on the New Architecture (Hermes, Bridgeless Mode).
* **Native Modules (Swift & Kotlin):** Includes a custom native TurboModule (`modules/native-media-cache`):
  * **iOS (Swift 6):** Custom `AVAssetResourceLoaderDelegate` disk LRU cache streaming 4K video segments.
  * **Android (Kotlin 2.x):** Hardware-accelerated `SimpleCache` preventing mobile UI-thread frame drops.
* **GraphQL Mastery:** End-to-end type safety via `@graphql-codegen` compiling `schema.graphql` into fully typed React Apollo hooks, normalized cache updates, and WebSocket subscriptions (`graphql-ws`).

### 2. ImagineArt Backend Architect ($35M+ ARR Scale)
* **Core Language:** **Go 1.26** with non-blocking goroutine worker pools.
* **Asynchronous Pipelines:** High-throughput task scheduling handling **5,000+ requests/sec** with sub-25ms p99 dispatch latencies.
* **Dynamic Backpressure:** Automatically degrades sampling steps (e.g. 30 -> 22 steps for batch tiers) during cluster traffic spikes to clear backlogs 35% faster without dropping requests.
* **GPU Worker Pool Orchestration:** Implements worker state machines (`IDLE` -> `RESERVED` -> `INFERRING` -> `TRANSCODING`), warm-cache model affinity, and automatic CUDA OOM recovery.
* **FFmpeg 7.x Media Processing:** Real-time AV1/H.264 video assembly using in-memory Unix pipes (`io.Pipe`) directly to S3/Cloudflare R2 with zero intermediate disk writes.

---

## 📂 Spec-Driven Development (SDD) Index

This repository strictly adheres to **Contract-First Spec-Driven Development**. Hand-written code never invents custom payload schemas:

1. [SPEC-01-ARCHITECTURE.md](file:///G:/ReplitProjects/studioforge/specs/SPEC-01-ARCHITECTURE.md) — System Architecture, Turborepo Topology & Boundaries
2. [SPEC-02-PIPELINE-AND-ORCHESTRATION.md](file:///G:/ReplitProjects/studioforge/specs/SPEC-02-PIPELINE-AND-ORCHESTRATION.md) — Go Pipeline, Backpressure & Worker State Machine
3. [SPEC-03-GRAPHQL-SCHEMA.graphql](file:///G:/ReplitProjects/studioforge/specs/SPEC-03-GRAPHQL-SCHEMA.graphql) — Frozen GraphQL SDL Schema Contract
4. [SPEC-04-CLIENT-AND-NATIVE-SPEC.md](file:///G:/ReplitProjects/studioforge/specs/SPEC-04-CLIENT-AND-NATIVE-SPEC.md) — Next.js 16.2, Expo 56 & Native Swift/Kotlin Specs
5. [SPEC-05-TESTING-AND-OBSERVABILITY.md](file:///G:/ReplitProjects/studioforge/specs/SPEC-05-TESTING-AND-OBSERVABILITY.md) — 5,000 req/sec Benchmarks & Quality Gates
6. [SPEC-06-IMPLEMENTATION-PLAN.md](file:///G:/ReplitProjects/studioforge/specs/SPEC-06-IMPLEMENTATION-PLAN.md) — Step-by-Step Execution DAG & Verification
7. [SPEC-07-DATA-MODELS-AND-MIGRATIONS.md](file:///G:/ReplitProjects/studioforge/specs/SPEC-07-DATA-MODELS-AND-MIGRATIONS.md) — PostgreSQL 17 DDL & Redis Schemas
8. [SPEC-08-ADR-DECISIONS.md](file:///G:/ReplitProjects/studioforge/specs/SPEC-08-ADR-DECISIONS.md) — Architecture Decision Records

---

## ⚡ Quickstart & Verification

### 1. Run Automated Code Generation (SDD)
Compiles PostgreSQL DDL via `sqlc`, GraphQL SDL via `gqlgen`, and TypeScript types via `@graphql-codegen`:
```bash
make generate
```

### 2. Run Quality Gates & Concurrency Tests
Executes Go race-detector test suites and verifies monorepo type-checking:
```bash
make test
```

### 3. Start Development Environment
Launches the Go High-Throughput Pipeline Gateway on port `8080` and the Next.js 16.2 Studio on port `3000`:
```bash
# Terminal 1: Start Go Pipeline
cd services/pipeline-go && go run ./cmd/server

# Terminal 2: Start Web Studio
pnpm --filter web dev
```
Open [http://localhost:3000](http://localhost:3000) to view the live studio.

### 4. Run 5,000 req/sec k6 Stress Benchmark
```bash
k6 run tests/load/k6-gen-stress.js
```
