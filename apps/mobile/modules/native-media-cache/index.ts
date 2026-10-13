import { NativeModules, Platform } from 'react-native';

export interface NativeMediaCacheSpec {
  preloadVideo(url: string, maxBytes?: number): Promise<string>;
  getDiskCacheSize(): Promise<number>;
  clearCache(): Promise<boolean>;
}

const NativeModule = NativeModules.NativeMediaCache;

export const NativeMediaCache: NativeMediaCacheSpec = {
  async preloadVideo(url: string, maxBytes = 50 * 1024 * 1024): Promise<string> {
    if (NativeModule && NativeModule.preloadVideo) {
      return NativeModule.preloadVideo(url, maxBytes);
    }
    // Web fallback or mock for non-native development
    return url;
  },

  async getDiskCacheSize(): Promise<number> {
    if (NativeModule && NativeModule.getDiskCacheSize) {
      return NativeModule.getDiskCacheSize();
    }
    return 0;
  },

  async clearCache(): Promise<boolean> {
    if (NativeModule && NativeModule.clearCache) {
      return NativeModule.clearCache();
    }
    return true;
  },
};
