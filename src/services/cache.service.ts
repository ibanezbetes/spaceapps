import { LRUCache } from 'lru-cache';

const cacheStore = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5 // 5 minutes default TTL
});

export const cache = {
  get<T>(key: string): T | undefined {
    return cacheStore.get(key) as T | undefined;
  },
  set<T>(key: string, value: T, ttlMs?: number) {
    cacheStore.set(key, value as any, { ttl: ttlMs });
  },
  del(key: string) {
    cacheStore.delete(key);
  },
  clear() {
    cacheStore.clear();
  }
};
