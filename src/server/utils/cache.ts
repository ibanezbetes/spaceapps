/**
 * LRU Cache simple para responses de APIs externas
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttlMs: number;

  constructor(maxSize: number = 256, ttlMs: number = 900000) { // 15 min default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  /**
   * Obtiene un valor del cache si existe y no ha expirado
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verifica si expiró
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    // Mover al final (LRU: most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.value;
  }

  /**
   * Almacena un valor en el cache
   */
  set(key: string, value: T): void {
    // Si ya existe, eliminar para reinsertar al final
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Si alcanzamos el límite, eliminar el más antiguo (primero en el Map)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Elimina una entrada específica
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtiene el tamaño actual del cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Obtiene estadísticas del cache
   */
  stats(): { size: number; maxSize: number; ttlMs: number; keys: string[] } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttlMs: this.ttlMs,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Limpia entradas expiradas
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

/**
 * Helper: genera una clave de cache consistente a partir de un objeto
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  const parts = sortedKeys.map(key => `${key}=${params[key]}`);
  return `${prefix}:${parts.join('&')}`;
}
