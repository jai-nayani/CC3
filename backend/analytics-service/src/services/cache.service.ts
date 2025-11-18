import NodeCache from 'node-cache';

/**
 * Cache Service using node-cache
 * Provides in-memory caching for KPI calculations and analytics data
 */
class CacheService {
  private cache: NodeCache;
  private readonly DEFAULT_TTL = 300; // 5 minutes in seconds

  constructor() {
    this.cache = new NodeCache({
      stdTTL: this.DEFAULT_TTL,
      checkperiod: 60, // Check for expired keys every 60 seconds
      useClones: false, // Don't clone values for better performance
      deleteOnExpire: true,
    });

    // Log cache statistics periodically in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        const stats = this.cache.getStats();
        console.log('Cache Stats:', {
          keys: stats.keys,
          hits: stats.hits,
          misses: stats.misses,
          hitRate: stats.hits / (stats.hits + stats.misses) || 0,
        });
      }, 300000); // Every 5 minutes
    }
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      console.log(`Cache HIT: ${key}`);
    } else {
      console.log(`Cache MISS: ${key}`);
    }
    return value;
  }

  /**
   * Set value in cache with optional TTL
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    const success = this.cache.set(key, value, ttl || this.DEFAULT_TTL);
    if (success) {
      console.log(`Cache SET: ${key} (TTL: ${ttl || this.DEFAULT_TTL}s)`);
    }
    return success;
  }

  /**
   * Delete specific key from cache
   */
  del(key: string): number {
    const deleted = this.cache.del(key);
    if (deleted > 0) {
      console.log(`Cache DEL: ${key}`);
    }
    return deleted;
  }

  /**
   * Delete multiple keys from cache
   */
  delMultiple(keys: string[]): number {
    const deleted = this.cache.del(keys);
    if (deleted > 0) {
      console.log(`Cache DEL: ${deleted} keys deleted`);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  flush(): void {
    this.cache.flushAll();
    console.log('Cache FLUSH: All entries cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return this.cache.keys();
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    // Not in cache, compute value
    const value = await factory();

    // Store in cache
    this.set(key, value, ttl);

    return value;
  }

  /**
   * Generate cache key from parameters
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): number {
    const keys = this.cache.keys();
    const matchingKeys = keys.filter((key) => key.includes(pattern));
    return this.delMultiple(matchingKeys);
  }
}

// Export singleton instance
export const cacheService = new CacheService();
