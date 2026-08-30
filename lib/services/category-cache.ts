import { CategoryItem, CategoryType, CategoryStatus } from "@/lib/admin-data";
import { CategoryService } from "@/lib/services/admin-service";

interface CacheEntry {
  data: CategoryItem[];
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh cache

export function buildCategoryTree(items: CategoryItem[]): CategoryItem[] {
  if (!items || items.length === 0) return [];

  // Check if items already come with populated children from backend
  const hasPopulatedChildren = items.some((i) => i.children && i.children.length > 0);
  if (hasPopulatedChildren) {
    return items.filter((i) => !i.parentId);
  }

  const parents = items.filter((i) => !i.parentId);
  // If there are no parentId fields set at all, treat all as top-level
  const hasAnyParentId = items.some((i) => Boolean(i.parentId));
  if (!hasAnyParentId) {
    return items;
  }

  const childrenMap = new Map<string, CategoryItem[]>();
  items.forEach((i) => {
    if (i.parentId) {
      const list = childrenMap.get(i.parentId) || [];
      list.push(i);
      childrenMap.set(i.parentId, list);
    }
  });

  return parents.map((p) => ({
    ...p,
    children: childrenMap.get(p.id) || p.children || [],
  }));
}

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
        const structuredTree = buildCategoryTree(activeItems);
        this.cache.set(type, {
          data: structuredTree,
          timestamp: Date.now(),
        });
        return structuredTree;
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
   * Fetch menu-visible ordered category navigation tree for public navbar.
   */
  async getNavMenu(): Promise<CategoryItem[]> {
    const cacheKey = "PUBLIC_NAV_MENU";
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    if (this.inFlight.has(cacheKey)) {
      return this.inFlight.get(cacheKey)!;
    }

    const fetchPromise = (async () => {
      try {
        const data = await CategoryService.getNavMenu();
        const activeMenuTree = buildCategoryTree(data || []);
        this.cache.set(cacheKey, {
          data: activeMenuTree,
          timestamp: Date.now(),
        });
        return activeMenuTree;
      } catch (err) {
        console.warn("[CategoryCache] Failed to fetch nav menu:", err);
        return [];
      } finally {
        this.inFlight.delete(cacheKey);
      }
    })();

    this.inFlight.set(cacheKey, fetchPromise);
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
