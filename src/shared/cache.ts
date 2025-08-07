import { logger } from "../settings/logger.js";
import { getCacheConfig } from "../settings/config.js";

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  maxSize?: number; // Maximum number of entries
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export class Cache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly defaultTtl: number;
  private readonly maxSize: number;
  private readonly name: string;

  constructor(name: string, options: CacheOptions = {}) {
    const config = getCacheConfig();
    this.name = name;
    this.defaultTtl = options.ttl ?? config.ttl;
    this.maxSize = options.maxSize ?? config.maxSize;
    
    // Start cleanup interval
    this.startCleanup();
  }

  set(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: (ttl ?? this.defaultTtl) * 1000, // Convert to milliseconds
    };

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
    logger.debug(`Cache set: ${this.name}:${key}`, "Cache");
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      logger.debug(`Cache miss: ${this.name}:${key}`, "Cache");
      return undefined;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      logger.debug(`Cache expired: ${this.name}:${key}`, "Cache");
      return undefined;
    }

    logger.debug(`Cache hit: ${this.name}:${key}`, "Cache");
    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug(`Cache deleted: ${this.name}:${key}`, "Cache");
    }
    return deleted;
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info(`Cache cleared: ${this.name} (${size} entries)`, "Cache");
  }

  size(): number {
    this.cleanup(); // Clean up expired entries before returning size
    return this.cache.size;
  }

  keys(): string[] {
    this.cleanup();
    return Array.from(this.cache.keys());
  }

  values(): T[] {
    this.cleanup();
    return Array.from(this.cache.values()).map(entry => entry.value);
  }

  entries(): [string, T][] {
    this.cleanup();
    return Array.from(this.cache.entries()).map(([key, entry]) => [key, entry.value]);
  }

  // Get with fallback function
  async getOrSet(key: string, fallback: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fallback();
    this.set(key, value, ttl);
    return value;
  }

  // Get with fallback function (synchronous)
  getOrSetSync(key: string, fallback: () => T, ttl?: number): T {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = fallback();
    this.set(key, value, ttl);
    return value;
  }

  // Batch operations
  mget(keys: string[]): (T | undefined)[] {
    return keys.map(key => this.get(key));
  }

  mset(entries: [string, T][], ttl?: number): void {
    for (const [key, value] of entries) {
      this.set(key, value, ttl);
    }
  }

  mdelete(keys: string[]): number {
    let deleted = 0;
    for (const key of keys) {
      if (this.delete(key)) {
        deleted++;
      }
    }
    return deleted;
  }

  // Statistics
  getStats() {
    this.cleanup();
    return {
      name: this.name,
      size: this.cache.size,
      maxSize: this.maxSize,
      defaultTtl: this.defaultTtl,
      utilization: (this.cache.size / this.maxSize) * 100,
    };
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug(`Cache evicted oldest entry: ${this.name}:${oldestKey}`, "Cache");
    }
  }

  private cleanup(): void {
    const beforeSize = this.cache.size;
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }

    const afterSize = this.cache.size;
    if (beforeSize !== afterSize) {
      logger.debug(`Cache cleanup: ${this.name} (${beforeSize - afterSize} expired entries removed)`, "Cache");
    }
  }

  private startCleanup(): void {
    // Run cleanup every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }
}

// Global cache instances
export const userCache = new Cache<any>("users");
export const guildCache = new Cache<any>("guilds");
export const commandCache = new Cache<any>("commands");

// Cache decorator for methods
export function Cached(ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = new Cache<any>(`${target.constructor.name}.${propertyName}`);

    descriptor.value = async function (...args: any[]) {
      const key = JSON.stringify(args);
      return cache.getOrSet(key, () => method.apply(this, args), ttl);
    };
  };
}

// Cache utilities
export class CacheManager {
  private caches = new Map<string, Cache>();

  createCache<T>(name: string, options?: CacheOptions): Cache<T> {
    const cache = new Cache<T>(name, options);
    this.caches.set(name, cache);
    return cache;
  }

  getCache<T>(name: string): Cache<T> | undefined {
    return this.caches.get(name) as Cache<T>;
  }

  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
    logger.info("All caches cleared", "CacheManager");
  }

  getStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats();
    }
    return stats;
  }
}

export const cacheManager = new CacheManager();