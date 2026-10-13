# SPEC-08: StudioForge — Architecture Decision Records (ADRs)

## ADR-001: Go 1.25+ vs. Node.js/Python for the Pipeline Engine
* **Status:** Accepted
* **Context:** ImagineArt handles millions of async requests with low latency requirements. Python's GIL creates CPU bottlenecks in high-concurrency stream orchestration, and Node.js suffers from event loop lag under heavy JSON parsing and child-process IPC.
* **Decision:** Implement the pipeline gateway, queue consumers, and FFmpeg streaming coordinator in **Go 1.25+**.
* **Consequences:** 
  - Sub-millisecond dispatch times (< 12ms p99).
  - Native goroutines handle 10,000+ concurrent worker streams with negligible memory footprint.
  - Zero Python GIL locks when piping media to FFmpeg.

---

## ADR-002: Redis Streams vs. Apache Kafka for Ingestion Queues
* **Status:** Accepted
* **Context:** We require high-throughput queuing with sub-50ms dispatch latency for interactive VIP prompts, consumer groups, and atomic task claims (`XAUTOCLAIM`).
* **Decision:** Standardize on **Redis 7.4 Streams (Valkey)** with Kafka as an optional cold-storage archival tier.
* **Consequences:**
  - Redis Streams provide in-memory sub-millisecond task delivery ideal for real-time interactive user generation.
  - `XAUTOCLAIM` enables simple, reliable recovery of dropped jobs when GPU pods crash.
  - Minimal operational overhead compared to a multi-broker Kafka cluster for sub-100k msg/sec loads.

---

## ADR-003: GraphQL Subscriptions (graphql-ws) vs. Server-Sent Events (SSE)
* **Status:** Accepted
* **Context:** Web (Next.js) and Mobile (React Native) clients need bidirectional communication: submitting prompts, cancelling in-flight generations, and receiving frame-by-frame progress updates.
* **Decision:** Adopt **GraphQL Subscriptions over WebSockets (`graphql-ws`)** backed by Apollo Client 3.12 and Go `gqlgen`.
* **Consequences:**
  - Single unified schema for queries, mutations, and subscriptions.
  - Automatic code generation (`@graphql-codegen`) creates strongly-typed React hooks across both platforms.
  - Directly satisfies the GraphQL requirements of the Lead Frontend & Mobile JD.

---

## ADR-004: Custom Swift/Kotlin TurboModules vs. Community Media Libraries
* **Status:** Accepted
* **Context:** Playing consecutive 4K/60fps video generations on mobile causes memory thrashing and Out-Of-Memory (OOM) crashes in standard React Native video libraries without fine-grained disk LRU caching.
* **Decision:** Build a custom native module (`modules/native-media-cache`) using Swift (`AVAssetResourceLoaderDelegate`) and Kotlin (`SimpleCache`).
* **Consequences:**
  - Proves native iOS (Swift) and Android (Kotlin) competency to hiring managers.
  - Eliminates redundant downloads, dropping bandwidth costs and accelerating playback start time to < 80ms.
