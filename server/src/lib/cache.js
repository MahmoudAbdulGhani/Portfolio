// High-performance in-memory TTL cache for public portfolio endpoints

class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttlMs = 60_000) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    return value;
  }

  invalidate(prefixOrKey) {
    if (!prefixOrKey) return;
    for (const key of this.store.keys()) {
      if (key === prefixOrKey || key.startsWith(prefixOrKey)) {
        this.store.delete(key);
      }
    }
  }

  invalidateAll() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}

export const apiCache = new MemoryCache();
