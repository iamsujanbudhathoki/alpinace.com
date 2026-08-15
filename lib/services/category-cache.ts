import { CategoryItem, CategoryType, CategoryStatus } from "@/lib/admin-data";
import { CategoryService } from "@/lib/services/admin-service";

interface CacheEntry {
  data: CategoryItem[];
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh cache

class CategoryCacheService {
  private cache = new Map<string, CacheEntry>();
  private inFlight = new Map<string, Promise<CategoryItem[]>>();

  /**
   * Get cached categories synchronously if available and not expired.
   */
  getCached(type: CategoryType | string): CategoryItem[] | null {
    const entry = this.cache.get(type);
    if (!entry) return null;

    const isFresh = Date.now() - entry.timestamp < CACHE_TTL_MS;
    if (isFresh) {
      return entry.data;
    }

    // Expired
    this.cache.delete(type);
    return null;
  }

  /**
   * Prefetch / fetch categories with deduplication and caching.
   * If fresh data exists in cache, returns immediately without network request.
   */
  async prefetch(type: CategoryType | string): Promise<CategoryItem[]> {
    const cached = this.getCached(type);
    if (cached) {
      return cached;
    }

    // Deduplicate in-flight requests for the same category type
    if (this.inFlight.has(type)) {
      return this.inFlight.get(type)!;
    }

    const fetchPromise = (async () => {
      try {
        const data = await CategoryService.getByType(type);
        const activeItems = (data || []).filter(
          (c) => c.status === CategoryStatus.ACTIVE
        );
        this.cache.set(type, {
          data: activeItems,
          timestamp: Date.now(),
        });
        return activeItems;
      } catch (err) {
        console.warn(`[CategoryCache] Failed to prefetch categories for "${type}":`, err);
        return [];
      } finally {
        this.inFlight.delete(type);
      }
    })();

    this.inFlight.set(type, fetchPromise);
    return fetchPromise;
  }

  /**
   * Clear cache for testing or on mutation
   */
  clear(type?: CategoryType | string) {
    if (type) {
      this.cache.delete(type);
      this.inFlight.delete(type);
    } else {
      this.cache.clear();
      this.inFlight.clear();
    }
  }
}

export const categoryCache = new CategoryCacheService();
