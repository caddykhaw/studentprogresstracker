// Cache service interface and implementation

// Cache interface
export interface CacheService {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, duration?: number): void;
  invalidate(keyPattern?: string): void;
}

// Cache item interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// In-memory cache implementation
export class MemoryCacheService implements CacheService {
  private cache: Record<string, CacheItem<any>> = {};
  private defaultDuration: number;

  constructor(defaultDuration = 30 * 1000) { // Default 30 seconds
    this.defaultDuration = defaultDuration;
  }

  get<T>(key: string): T | null {
    const item = this.cache[key];
    
    if (!item) return null;
    
    // Check if cache expired
    if (Date.now() > item.expiresAt) {
      console.log(`Cache expired for ${key}`);
      delete this.cache[key];
      return null;
    }
    
    console.log(`Cache hit for ${key}`);
    return item.data;
  }

  set<T>(key: string, data: T, duration = this.defaultDuration): void {
    const now = Date.now();
    this.cache[key] = {
      data,
      timestamp: now,
      expiresAt: now + duration
    };
    console.log(`Cache set for ${key}, expires in ${duration/1000}s`);
  }

  invalidate(keyPattern?: string): void {
    if (keyPattern) {
      const pattern = new RegExp(keyPattern);
      Object.keys(this.cache).forEach(key => {
        if (pattern.test(key)) {
          delete this.cache[key];
          console.log(`Cache invalidated for ${key}`);
        }
      });
    } else {
      Object.keys(this.cache).forEach(key => delete this.cache[key]);
      console.log('All cache invalidated');
    }
  }
}

// Factory for creating cache instances
export class CacheFactory {
  private static serverCache: CacheService | null = null;
  private static clientCache: CacheService | null = null;

  static getServerCache(): CacheService {
    if (!this.serverCache) {
      this.serverCache = new MemoryCacheService(30 * 1000); // 30 seconds for server
    }
    return this.serverCache;
  }

  static getClientCache(): CacheService {
    if (!this.clientCache) {
      // Use client-side cache in browser environment only
      if (typeof window !== 'undefined') {
        this.clientCache = new MemoryCacheService(5 * 1000); // 5 seconds for client
      } else {
        // Return a dummy cache for SSR
        this.clientCache = new MemoryCacheService(0);
      }
    }
    return this.clientCache;
  }
} 