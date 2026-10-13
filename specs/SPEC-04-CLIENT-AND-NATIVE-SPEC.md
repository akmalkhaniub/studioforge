# SPEC-04: StudioForge — Web, Mobile & Native Platform Architecture

## 1. Web Studio Architecture (Next.js 16.2.6 & React 19.2)

### 1.1 Visual Generation Studio Canvas
- **React 19.2 Compiler & Server Components:** Static shell loads instantly using PPR (Partial Prerendering).
- **Three.js / React Three Fiber Canvas:** Allows interactive 3D camera positioning and depth-map prompt framing before kicking off video diffusion.
- **Real-Time Generation Stream:** Uses Apollo Client 3.12 `useSubscription(GENERATION_PROGRESS_SUBSCRIPTION)` to render progressive denoising preview frames (latent decodes) at 60fps directly on the canvas.

### 1.2 State Architecture
- **Apollo Client Normalized Cache:** Caches task metadata, user generation history, and system metrics.
- **Zustand 5.x:** Manages ephemeral canvas brush strokes, mask layers, and active aspect ratios.

---

## 2. Mobile Architecture (Expo SDK 56 & React Native 0.85.3)

### 2.1 Executive Review & Pocket Studio
- **Expo Router 56:** Tab-based layout (`app/(tabs)/studio.tsx`, `app/(tabs)/queue.tsx`, `app/(tabs)/gallery.tsx`).
- **High-Performance Video Playback:** Uses `expo-video` with hardware acceleration for buttery smooth 60fps preview of newly generated video clips.
- **Shopify FlashList:** Handles infinite media grid feeds with zero frame drops during heavy image scrolling.

---

## 3. Native Platform Modules (Swift / Kotlin)

### 3.1 Custom Native Video Cache Engine (`modules/native-media-cache`)
Standard mobile browsers/wrappers suffer severe memory thrashing when downloading and rendering multiple high-resolution video streams. StudioForge builds a custom native TurboModule:

* **iOS (Swift 6):**
  Uses `AVAssetResourceLoaderDelegate` with a dedicated disk LRU cache in `CachesDirectory` to stream and buffer H.264/AV1 video chunks with zero UI-thread blocking.
* **Android (Kotlin 2.x):**
  Integrates with `androidx.media3.datasource.cache.SimpleCache` and `LeastRecentlyUsedCacheEvictor` to cap disk usage at 500MB and prevent Out-Of-Memory exceptions on low-end devices.
