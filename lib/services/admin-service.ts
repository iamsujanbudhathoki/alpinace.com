import {
  BlogArticle,
  BlogStatus,
  Booking,
  CategoryItem,
  CategoryStatus,
  CategoryType,
  FaqItem,
  FaqStatus,
  Inquiry,
  InquiryStatus,
  InquiryType,
  MenuCategoryDto,
  NotificationType,
  PackageItem,
} from "@/lib/admin-data";
import {
  BlogFormValues,
  BookingFormValues,
  CategoryFormValues,
  ExpeditionFormValues,
  FaqFormValues,
  InquiryFormValues,
  TourFormValues,
  TrekFormValues,
} from "@/lib/admin-schemas";
import { ApiResponse, PaginationMeta, apiClient, axiosInstance, responseFormatter } from "@/lib/services/api-client";
import { TrekItem } from "@/lib/trek-data";

export type PaginatedList<T> = T[] & { pagination?: PaginationMeta };

export function makePaginatedList<T>(data: T[], pagination?: PaginationMeta): PaginatedList<T> {
  const list = [...data] as PaginatedList<T>;
  if (pagination) {
    list.pagination = pagination;
  }
  return list;
}

export const MediaService = {
  async getAllMedia(params?: { categoryId?: string; category?: string; search?: string; limit?: number; page?: number }): Promise<PaginatedList<any>> {
    try {
      const query = new URLSearchParams();
      if (params?.categoryId && params.categoryId !== "All") query.set("categoryId", params.categoryId);
      if (params?.category && params.category !== "All") query.set("category", params.category);
      if (params?.search && params.search.trim()) query.set("search", params.search.trim());
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.page) query.set("page", String(params.page));
      const q = query.toString() ? `?${query.toString()}` : "";

      const res = await apiClient.get<any[]>(`/admin/media${q}`);
      const items = Array.isArray(res?.data) ? res.data : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend media fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async uploadFile(file: File, categoryId?: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append("file", file);

    const q = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : "";
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        `/admin/media/upload${q}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return responseFormatter(response);
    } catch (error: any) {
      return responseFormatter(error);
    }
  },

  async update(id: string, data: { title?: string; categoryId?: string; description?: string; altText?: string }): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/admin/media/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/admin/media/${id}`);
  },
};

export const CategoryService = {
  async getPublicAll(params?: { type?: CategoryType | string; search?: string; limit?: number; page?: number }): Promise<PaginatedList<CategoryItem>> {
    try {
      const query = new URLSearchParams();
      if (params?.type && params.type !== "All") query.set("type", params.type);
      if (params?.search && params.search.trim()) query.set("search", params.search.trim());
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.page) query.set("page", String(params.page));
      const q = query.toString() ? `?${query.toString()}` : "";

      const res = await apiClient.get<CategoryItem[]>(`/categories${q}`);
      const items = Array.isArray(res?.data) ? res.data : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend categories fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getAll(params?: {
    status?: CategoryStatus | string;
    showInMenu?: boolean;
    type?: CategoryType | string;
    search?: string;
    limit?: number;
    page?: number;
    parentsOnly?: boolean;
  }): Promise<PaginatedList<CategoryItem>> {
    try {
      const query = new URLSearchParams();
      if (params?.status && params.status !== "All") query.set("status", params.status);
      if (params?.showInMenu !== undefined) query.set("showInMenu", String(params.showInMenu));
      if (params?.type && params.type !== "All") query.set("type", params.type);
      if (params?.search && params.search.trim()) query.set("search", params.search.trim());
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.page) query.set("page", String(params.page));
      if (params?.parentsOnly) query.set("parentsOnly", "true");
      const q = query.toString() ? `?${query.toString()}` : "";

      const res = await apiClient.get<CategoryItem[]>(`/admin/categories${q}`);
      const items = Array.isArray(res?.data) ? res.data : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend categories fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getByType(type: CategoryType | string, parentsOnly = true): Promise<CategoryItem[]> {
    try {
      const q = parentsOnly ? `?type=${type}&parentsOnly=true` : `?type=${type}`;
      const res = await apiClient.get<CategoryItem[]>(`/categories${q}`);
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Backend categories by type error:", e);
      return [];
    }
  },

  async getAdminParents(type: CategoryType | string): Promise<CategoryItem[]> {
    try {
      const res = await apiClient.get<CategoryItem[]>(`/admin/categories?type=${type}&parentsOnly=true&limit=100`);
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Backend admin parent categories fetch error:", e);
      return [];
    }
  },

  async getAdminSubcategories(parentId: string): Promise<CategoryItem[]> {
    if (!parentId) return [];
    try {
      const res = await apiClient.get<CategoryItem[]>(`/admin/categories?parentId=${parentId}&limit=100`);
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Backend admin subcategories fetch error:", e);
      return [];
    }
  },

  async getNavMenu(): Promise<CategoryItem[]> {
    try {
      const res = await apiClient.get<CategoryItem[]>("/categories/nav");
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Backend categories getNavMenu error:", e);
      return [];
    }
  },

  async getMenuOrderingStructure(domain: CategoryType): Promise<MenuCategoryDto[]> {
    try {
      const res = await apiClient.get<MenuCategoryDto[]>(`/admin/categories/menu-structure?domain=${domain}`);
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Backend categories getMenuOrderingStructure error:", e);
      return [];
    }
  },

  async reorder(items: { id: string; menuOrder: number }[], domain?: CategoryType): Promise<ApiResponse<boolean>> {
    return apiClient.put<boolean>("/admin/categories/reorder", { items, domain });
  },

  async getById(id: string): Promise<CategoryItem | null> {
    try {
      const res = await apiClient.get<CategoryItem>(`/admin/categories/${id}`);
      return res?.data || null;
    } catch (e) {
      return null;
    }
  },

  async create(data: Partial<CategoryFormValues> | Record<string, any>): Promise<ApiResponse<CategoryItem>> {
    const payload: any = {
      name: String(data.name || "").trim(),
      slug: data.slug
        ? String(data.slug).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        : String(data.name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      type: data.type,
      description: String(data.description || "").trim(),
      status: data.status || CategoryStatus.ACTIVE,
      showInMenu: data.showInMenu !== undefined ? Boolean(data.showInMenu) : true,
      menuOrder: data.menuOrder !== undefined ? Number(data.menuOrder) : 0,
      parentId: data.parentId || null,
    };
    if (data.mediaId && typeof data.mediaId === "string" && data.mediaId.trim()) {
      payload.mediaId = data.mediaId.trim();
    }
    return apiClient.post<CategoryItem>("/admin/categories", payload);
  },

  async update(id: string, data: Partial<CategoryFormValues> | Record<string, any>): Promise<ApiResponse<CategoryItem>> {
    const payload: Record<string, any> = {};
    if (data.name !== undefined) payload.name = String(data.name).trim();
    if (data.slug !== undefined) payload.slug = String(data.slug).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (data.type !== undefined) payload.type = data.type;
    if (data.description !== undefined) payload.description = String(data.description).trim();
    if (data.status !== undefined) payload.status = data.status;
    if (data.showInMenu !== undefined) payload.showInMenu = Boolean(data.showInMenu);
    if (data.isFeatured !== undefined) payload.isFeatured = Boolean(data.isFeatured);
    if (data.menuOrder !== undefined) payload.menuOrder = Number(data.menuOrder);
    if (data.mediaId !== undefined) {
      if (typeof data.mediaId === "string" && data.mediaId.trim()) payload.mediaId = data.mediaId.trim();
      else delete payload.mediaId;
    }
    if (data.parentId !== undefined) payload.parentId = data.parentId || null;

    return apiClient.put<CategoryItem>(`/admin/categories/${id}`, payload);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/admin/categories/${id}`);
  },
};

export interface PackageFilterParams {
  categoryType?: "Trekking" | "Expedition" | "Tour";
  category?: string;
  categoryId?: string;
  region?: string;
  difficulty?: string;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  sortBy?: string;
  limit?: number;
  page?: number;
}

export function buildPackageQuery(params?: PackageFilterParams): string {
  if (!params) return "";
  const query = new URLSearchParams();
  if (params.categoryType) query.set("categoryType", params.categoryType);
  const cat = params.category || params.categoryId;
  if (cat && cat !== "All") query.set("category", cat);
  if (params.region && params.region !== "All") query.set("region", params.region);
  if (params.difficulty && params.difficulty !== "All") query.set("difficulty", params.difficulty);
  if (params.status) query.set("status", params.status);
  if (params.search && params.search.trim()) query.set("search", params.search.trim());
  if (params.minPrice !== undefined && params.minPrice > 0) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined && params.maxPrice > 0) query.set("maxPrice", String(params.maxPrice));
  if (params.minDuration !== undefined && params.minDuration > 0) query.set("minDuration", String(params.minDuration));
  if (params.maxDuration !== undefined && params.maxDuration > 0) query.set("maxDuration", String(params.maxDuration));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.page) query.set("page", String(params.page));

  const str = query.toString();
  return str ? `?${str}` : "";
}

export interface FilterOptionItem {
  label: string;
  value: string;
  id?: string;
  name?: string;
  slug?: string;
}

export interface PackageFilterOptions {
  categoryType?: string;
  categories?: FilterOptionItem[];
  styles: FilterOptionItem[];
  difficulties: FilterOptionItem[];
  regions: FilterOptionItem[];
  sortOptions: FilterOptionItem[];
  minDuration: number;
  maxDuration: number;
  minPrice: number;
  maxPrice: number;
  minAltitude: number;
  maxAltitude: number;
}

export const PackageFilterService = {
  async getOptions(categoryType?: "Trekking" | "Tour" | "Expedition"): Promise<PackageFilterOptions | null> {
    try {
      let endpoint = "/packages/filter-options";
      if (categoryType === "Trekking") endpoint = "/treks/filter-options";
      else if (categoryType === "Tour") endpoint = "/tours/filter-options";
      else if (categoryType === "Expedition") endpoint = "/expeditions/filter-options";
      else if (categoryType) endpoint = `/packages/filter-options?categoryType=${categoryType}`;

      const res = await apiClient.get<PackageFilterOptions>(endpoint);
      return res?.data || null;
    } catch (e) {
      console.warn("Backend package filter-options fetch error:", e);
      return null;
    }
  },
};

function cleanPackagePayload(data: any) {
  if (!data) return {};
  const {
    id,
    slug,
    category,
    categoryType,
    rating,
    reviewsCount,
    totalBookings,
    createdAt,
    updatedAt,
    image,
    mapImage,
    galleryImages,
    ...rest
  } = data;

  const payload: any = { ...rest };

  if (rest.durationDays !== undefined && rest.durationDays !== null && rest.durationDays !== "") {
    payload.durationDays = Number(rest.durationDays);
  }

  if (rest.priceUSD !== undefined && rest.priceUSD !== null && rest.priceUSD !== "") {
    payload.priceUSD = Number(rest.priceUSD);
  }

  if (rest.categoryId !== undefined) {
    if (typeof rest.categoryId === "string" && rest.categoryId.trim() !== "" && rest.categoryId !== "All") {
      payload.categoryId = rest.categoryId.trim();
    } else {
      delete payload.categoryId;
    }
  }

  if (rest.subcategoryId !== undefined) {
    if (typeof rest.subcategoryId === "string" && rest.subcategoryId.trim() !== "" && rest.subcategoryId !== "All") {
      payload.subcategoryId = rest.subcategoryId.trim();
    } else {
      payload.subcategoryId = null;
    }
  }

  if (rest.maxAltitudeMeters !== undefined && rest.maxAltitudeMeters !== null && rest.maxAltitudeMeters !== "") {
    payload.maxAltitudeMeters = Number(rest.maxAltitudeMeters);
  } else if (rest.maxAltitudeMeters !== undefined) {
    delete payload.maxAltitudeMeters;
  }

  if (rest.peakHeightM !== undefined && rest.peakHeightM !== null && rest.peakHeightM !== "") {
    payload.peakHeightM = Number(rest.peakHeightM);
  } else if (rest.peakHeightM !== undefined) {
    delete payload.peakHeightM;
  }

  if (Array.isArray(rest.itinerary)) {
    payload.itinerary = rest.itinerary
      .filter((day: any) => day && (typeof day.title === "string" ? day.title.trim() : true))
      .map((day: any, idx: number) => {
        const cleanDetails = Array.isArray(day.details)
          ? day.details
              .filter((d: any) => d && typeof d === "object" && (d.label?.trim() || d.value?.trim()))
              .map((d: any) => ({
                label: (d.label || "Detail").trim(),
                value: (d.value || "").trim(),
              }))
              .filter((d: any) => d.label && d.value)
          : undefined;

        return {
          day: Number(day.day) || idx + 1,
          title: (day.title || `Day ${idx + 1}`).trim(),
          description: (day.description || "").trim(),
          maxAltitude: day.maxAltitude && typeof day.maxAltitude === "string" && day.maxAltitude.trim() ? day.maxAltitude.trim() : undefined,
          accommodation: day.accommodation && typeof day.accommodation === "string" && day.accommodation.trim() ? day.accommodation.trim() : undefined,
          meals: day.meals && typeof day.meals === "string" && day.meals.trim() ? day.meals.trim() : undefined,
          ...(cleanDetails && cleanDetails.length > 0 ? { details: cleanDetails } : {}),
        };
      });
  }

  if (Array.isArray(rest.faqs)) {
    payload.faqs = rest.faqs
      .filter((f: any) => f && f.question?.trim() && f.answer?.trim())
      .map((f: any) => ({
        id: f.id,
        question: f.question.trim(),
        answer: f.answer.trim(),
      }));
  }

  if (Array.isArray(rest.reviews)) {
    payload.reviews = rest.reviews
      .filter((r: any) => r && r.author?.trim() && r.content?.trim())
      .map((r: any) => ({
        id: r.id,
        author: r.author.trim(),
        country: (r.country || "Traveler").trim(),
        rating: Number(r.rating) || 5,
        content: r.content.trim(),
        date: r.date || new Date().toISOString().split("T")[0],
        avatar: r.avatar || undefined,
      }));
  }

  if (rest.addonsText !== undefined) payload.addonsText = rest.addonsText;
  if (rest.usefulInfoText !== undefined) payload.usefulInfoText = rest.usefulInfoText;
  if (Array.isArray(rest.departureDates)) payload.departureDates = rest.departureDates;

  // Strict Media IDs handling (omits empty strings to avoid null type errors)
  if (Array.isArray(rest.galleryMediaIds)) {
    const validIds = rest.galleryMediaIds.filter((id: any) => typeof id === "string" && id.trim() !== "");
    if (validIds.length > 0) payload.galleryMediaIds = validIds;
    else delete payload.galleryMediaIds;
  } else {
    delete payload.galleryMediaIds;
  }

  if (rest.coverMediaId !== undefined && typeof rest.coverMediaId === "string" && rest.coverMediaId.trim()) {
    payload.coverMediaId = rest.coverMediaId.trim();
  } else {
    delete payload.coverMediaId;
  }

  if (rest.mapMediaId !== undefined && typeof rest.mapMediaId === "string" && rest.mapMediaId.trim()) {
    payload.mapMediaId = rest.mapMediaId.trim();
  } else {
    delete payload.mapMediaId;
  }

  if (Array.isArray(rest.packageFiles)) payload.packageFiles = rest.packageFiles;

  delete payload.totalBookings;
  delete payload.rating;
  delete payload.reviewsCount;
  delete payload.category;
  delete payload.categoryType;
  delete payload.permitsText;

  // Never submit display-only URL fields in write API requests
  delete payload.image;
  delete payload.mapImage;
  delete payload.galleryImages;

  return payload;
}

export function formatBackendTrek(p: any): TrekItem {
  if (!p) return null as any;
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    categoryId: p.categoryId,
    subcategoryId: p.subcategoryId,
    rating: Number(p.rating),
    reviewsCount: Number(p.reviewsCount),
    image: p.image,
    coverMediaId: p.coverMediaId,
    country: p.country,
    activity: p.activity,
    shortDesc: p.shortDesc,
    durationDays: Number(p.durationDays),
    maxAltitudeMeters: p.maxAltitudeMeters !== undefined && p.maxAltitudeMeters !== null ? Number(p.maxAltitudeMeters) : undefined,
    difficulty: p.difficulty,
    bestSeason: p.bestSeason,
    priceUSD: Number(p.priceUSD),
    startEndLocation: p.startEndLocation,
    accommodation: p.accommodation,
    meals: p.meals,
    groupSizeRange: p.groupSizeRange,
    inclusionsText: p.inclusionsText,
    exclusionsText: p.exclusionsText,
    addonsText: p.addonsText,
    usefulInfoText: p.usefulInfoText,
    departureDates: Array.isArray(p.departureDates) ? p.departureDates : [],
    galleryImages: Array.isArray(p.galleryImages) ? p.galleryImages : [],
    galleryMediaIds: Array.isArray(p.galleryMediaIds) ? p.galleryMediaIds : [],
    mapImage: p.mapImage,
    mapMediaId: p.mapMediaId,
    packageFiles: Array.isArray(p.packageFiles) ? p.packageFiles : [],
    itinerary: Array.isArray(p.itinerary) ? p.itinerary : [],
    faqs: Array.isArray(p.faqs) ? p.faqs : [],
    reviews: Array.isArray(p.reviews) ? p.reviews : [],
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    keywords: p.keywords,
    status: p.status,
    region: p.region,
  };
}

export function formatBackendPackage(p: any): PackageItem {
  if (!p) return null as any;
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.categoryType || p.category,
    categoryId: p.categoryId,
    subcategoryId: p.subcategoryId,
    rating: Number(p.rating),
    reviewsCount: Number(p.reviewsCount),
    image: p.image,
    coverMediaId: p.coverMediaId,
    country: p.country,
    activity: p.activity,
    shortDesc: p.shortDesc,
    durationDays: Number(p.durationDays),
    maxAltitudeMeters: Number(p.maxAltitudeMeters || p.peakHeightM || 0),
    difficulty: p.difficulty,
    priceUSD: Number(p.priceUSD),
    status: p.status,
    totalBookings: Number(p.totalBookings || 0),
    bestSeason: p.bestSeason,
    startEndLocation: p.startEndLocation,
    accommodation: p.accommodation,
    meals: p.meals,
    groupSizeRange: p.groupSizeRange,
    inclusionsText: p.inclusionsText,
    exclusionsText: p.exclusionsText,
    addonsText: p.addonsText,
    usefulInfoText: p.usefulInfoText,
    departureDates: Array.isArray(p.departureDates) ? p.departureDates : [],
    galleryImages: Array.isArray(p.galleryImages) ? p.galleryImages : [],
    galleryMediaIds: Array.isArray(p.galleryMediaIds) ? p.galleryMediaIds : [],
    mapImage: p.mapImage,
    mapMediaId: p.mapMediaId,
    packageFiles: Array.isArray(p.packageFiles) ? p.packageFiles : [],
    itinerary: Array.isArray(p.itinerary) ? p.itinerary : [],
    tourType: p.tourType,
    transportation: p.transportation,
    peakHeightM: p.peakHeightM !== undefined && p.peakHeightM !== null ? Number(p.peakHeightM) : undefined,
    climbingGrade: p.climbingGrade,
    sherpaGuideRatio: p.sherpaGuideRatio,
    oxygenRequired: p.oxygenRequired !== undefined ? Boolean(p.oxygenRequired) : undefined,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    keywords: p.keywords,
    faqs: Array.isArray(p.faqs) ? p.faqs : [],
    reviews: Array.isArray(p.reviews) ? p.reviews : [],
    region: p.region,
  };
}

export const TrekService = {
  async getPublicAll(filters?: PackageFilterParams): Promise<PaginatedList<TrekItem>> {
    try {
      const q = buildPackageQuery(filters);
      const res = await apiClient.get<any[]>(`/treks${q}`);
      const items = Array.isArray(res?.data) ? res.data.map(formatBackendTrek) : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend public treks fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getAdminAll(filters?: PackageFilterParams): Promise<PaginatedList<TrekItem>> {
    try {
      const q = buildPackageQuery(filters);
      const res = await apiClient.get<any[]>(`/admin/treks${q}`);
      const items = Array.isArray(res?.data) ? res.data.map(formatBackendTrek) : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend admin treks fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getAll(filters?: PackageFilterParams): Promise<PaginatedList<TrekItem>> {
    return this.getPublicAll(filters);
  },

  async getBySlug(slug: string): Promise<TrekItem | null> {
    try {
      const res = await apiClient.get<any>(`/treks/${slug}`);
      return res?.data ? formatBackendTrek(res.data) : null;
    } catch (e) {
      console.warn("Backend trek by slug fetch error:", e);
      return null;
    }
  },

  async create(data: TrekFormValues): Promise<ApiResponse<TrekItem>> {
    const payload = cleanPackagePayload(data);
    const res = await apiClient.post<any>("/admin/treks", payload);
    return {
      ...res,
      data: res.data ? formatBackendTrek(res.data) : (null as any),
    };
  },

  async update(id: string, data: Partial<TrekFormValues>): Promise<ApiResponse<TrekItem>> {
    const payload = cleanPackagePayload(data);
    const res = await apiClient.put<any>(`/admin/treks/${id}`, payload);
    return {
      ...res,
      data: res.data ? formatBackendTrek(res.data) : (null as any),
    };
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/admin/treks/${id}`);
  },
};

export const TourService = {
  async getPublicAll(filters?: PackageFilterParams): Promise<PaginatedList<PackageItem>> {
    try {
      const q = buildPackageQuery(filters);
      const res = await apiClient.get<any[]>(`/tours${q}`);
      const items = Array.isArray(res?.data) ? res.data.map(formatBackendPackage) : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend public tours fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getAdminAll(filters?: PackageFilterParams): Promise<PaginatedList<PackageItem>> {
    try {
      const q = buildPackageQuery(filters);
      const res = await apiClient.get<any[]>(`/admin/tours${q}`);
      const items = Array.isArray(res?.data) ? res.data.map(formatBackendPackage) : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend admin tours fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getAll(filters?: PackageFilterParams): Promise<PaginatedList<PackageItem>> {
    return this.getPublicAll(filters);
  },

  async getBySlug(slug: string): Promise<PackageItem | null> {
    try {
      const res = await apiClient.get<any>(`/tours/${slug}`);
      return res?.data ? formatBackendPackage(res.data) : null;
    } catch (e) {
      console.warn("Backend tour by slug fetch error:", e);
      return null;
    }
  },

  async create(data: TourFormValues): Promise<ApiResponse<PackageItem>> {
    const payload = cleanPackagePayload(data);
    const res = await apiClient.post<any>("/admin/tours", payload);
    return {
      ...res,
      data: res.data ? formatBackendPackage(res.data) : (null as any),
    };
  },

  async update(id: string, data: Partial<TourFormValues>): Promise<ApiResponse<PackageItem>> {
    const payload = cleanPackagePayload(data);
    const res = await apiClient.put<any>(`/admin/tours/${id}`, payload);
    return {
      ...res,
      data: res.data ? formatBackendPackage(res.data) : (null as any),
    };
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/admin/tours/${id}`);
  },
};

export const ExpeditionService = {
  async getPublicAll(filters?: PackageFilterParams): Promise<PaginatedList<PackageItem>> {
    try {
      const q = buildPackageQuery(filters);
      const res = await apiClient.get<any[]>(`/expeditions${q}`);
      const items = Array.isArray(res?.data) ? res.data.map(formatBackendPackage) : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend public expeditions fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getAdminAll(filters?: PackageFilterParams): Promise<PaginatedList<PackageItem>> {
    try {
      const q = buildPackageQuery(filters);
      const res = await apiClient.get<any[]>(`/admin/expeditions${q}`);
      const items = Array.isArray(res?.data) ? res.data.map(formatBackendPackage) : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend admin expeditions fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getAll(filters?: PackageFilterParams): Promise<PaginatedList<PackageItem>> {
    return this.getPublicAll(filters);
  },

  async getBySlug(slug: string): Promise<PackageItem | null> {
    try {
      const res = await apiClient.get<any>(`/expeditions/${slug}`);
      return res?.data ? formatBackendPackage(res.data) : null;
    } catch (e) {
      console.warn("Backend expedition by slug fetch error:", e);
      return null;
    }
  },

  async create(data: ExpeditionFormValues): Promise<ApiResponse<PackageItem>> {
    const payload = cleanPackagePayload(data);
    const res = await apiClient.post<any>("/admin/expeditions", payload);
    return {
      ...res,
      data: res.data ? formatBackendPackage(res.data) : (null as any),
    };
  },

  async update(id: string, data: Partial<ExpeditionFormValues>): Promise<ApiResponse<PackageItem>> {
    const payload = cleanPackagePayload(data);
    const res = await apiClient.put<any>(`/admin/expeditions/${id}`, payload);
    return {
      ...res,
      data: res.data ? formatBackendPackage(res.data) : (null as any),
    };
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/admin/expeditions/${id}`);
  },
};

function cleanBookingPayload(data: any) {
  if (!data) return {};
  const {
    id,
    reference,
    propertyId,
    propertyReference,
    createdAt,
    updatedAt,
    ...rest
  } = data;

  const payload: any = {};
  if (rest.guestName !== undefined) payload.guestName = String(rest.guestName).trim();
  if (rest.guestEmail !== undefined) payload.guestEmail = String(rest.guestEmail).trim();
  if (rest.guestPhone !== undefined) payload.guestPhone = String(rest.guestPhone).trim();
  if (rest.country !== undefined) payload.country = String(rest.country).trim();
  if (rest.packageName !== undefined) payload.packageName = String(rest.packageName).trim();
  if (rest.packageType !== undefined) payload.packageType = rest.packageType;
  if (rest.startDate !== undefined) payload.startDate = String(rest.startDate).trim();
  if (rest.endDate !== undefined) payload.endDate = String(rest.endDate).trim();
  if (rest.groupSize !== undefined && rest.groupSize !== null && rest.groupSize !== "") {
    payload.groupSize = Number(rest.groupSize);
  }
  if (rest.totalAmountUSD !== undefined && rest.totalAmountUSD !== null && rest.totalAmountUSD !== "") {
    payload.totalAmountUSD = Number(rest.totalAmountUSD);
  }
  if (rest.paymentStatus !== undefined) payload.paymentStatus = rest.paymentStatus;
  if (rest.bookingStatus !== undefined) payload.bookingStatus = rest.bookingStatus;
  if (rest.assignedGuide !== undefined) {
    if (typeof rest.assignedGuide === "string" && rest.assignedGuide.trim() !== "") {
      payload.assignedGuide = rest.assignedGuide.trim();
    } else {
      payload.assignedGuide = undefined;
    }
  }
  if (rest.permitStatus !== undefined) payload.permitStatus = rest.permitStatus;
  if (rest.specialRequests !== undefined) {
    if (typeof rest.specialRequests === "string" && rest.specialRequests.trim() !== "") {
      payload.specialRequests = rest.specialRequests.trim();
    } else {
      payload.specialRequests = undefined;
    }
  }

  return payload;
}

export const BookingService = {
  async getAll(params?: {
    search?: string;
    status?: string;
    packageType?: string;
    paymentStatus?: string;
    limit?: number;
    page?: number;
  }): Promise<PaginatedList<Booking>> {
    try {
      const query = new URLSearchParams();
      if (params?.search && params.search.trim()) query.set("search", params.search.trim());
      if (params?.status && params.status !== "All") query.set("status", params.status);
      if (params?.packageType && params.packageType !== "All") query.set("packageType", params.packageType);
      if (params?.paymentStatus && params.paymentStatus !== "All") query.set("paymentStatus", params.paymentStatus);
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.page) query.set("page", String(params.page));
      const q = query.toString() ? `?${query.toString()}` : "";

      const res = await apiClient.get<Booking[]>(`/admin/bookings${q}`);
      const items = Array.isArray(res?.data) ? res.data : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend bookings fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async create(data: BookingFormValues): Promise<ApiResponse<Booking>> {
    const payload = cleanBookingPayload(data);
    return apiClient.post<Booking>("/bookings", payload);
  },

  async update(id: string, data: Partial<BookingFormValues>): Promise<ApiResponse<Booking>> {
    const payload = cleanBookingPayload(data);
    return apiClient.put<Booking>(`/admin/bookings/${id}`, payload);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/admin/bookings/${id}`);
  },
};

export const InquiryService = {
  async getAll(params?: {
    status?: InquiryStatus | "All";
    type?: InquiryType | "All";
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<PaginatedList<Inquiry>> {
    try {
      const query = new URLSearchParams();
      if (params?.status && params.status !== "All") query.set("status", params.status);
      if (params?.type && params.type !== "All") query.set("type", params.type);
      if (params?.search && params.search.trim()) query.set("search", params.search.trim());
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.page) query.set("page", String(params.page));
      const q = query.toString() ? `?${query.toString()}` : "";

      const res = await apiClient.get<Inquiry[]>(`/admin/inquiries${q}`);
      const items = Array.isArray(res?.data) ? res.data : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend inquiries fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async create(data: Partial<InquiryFormValues> | Record<string, any>): Promise<ApiResponse<Inquiry>> {
    const payload = {
      guestName: String(data.guestName || "").trim(),
      email: String(data.email || "").trim(),
      phone: String(data.phone || "").trim(),
      country: String(data.country || "").trim(),
      interestedTrip: String(data.interestedTrip || "").trim(),
      travelDates: String(data.travelDates || "").trim(),
      groupSize: Number(data.groupSize) || 1,
      message: String(data.message || "").trim(),
      ...(data.type ? { type: data.type } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.notes ? { notes: data.notes } : {}),
    };
    return apiClient.post<Inquiry>("/inquiries", payload);
  },

  async update(id: string, data: { status?: Inquiry["status"]; notes?: string }): Promise<ApiResponse<Inquiry>> {
    return apiClient.put<Inquiry>(`/admin/inquiries/${id}`, data);
  },

  async sendQuote(id: string, data: { message: string }): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/admin/inquiries/${id}/quote`, { message: data.message });
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/admin/inquiries/${id}`);
  },
};

export const BlogService = {
  async getPublicAll(
    statusOrParams?: BlogStatus | string | { status?: BlogStatus | string; categoryId?: string; category?: string; search?: string; limit?: number; page?: number },
    categoryId?: string,
    search?: string,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<BlogArticle>> {
    try {
      const params = new URLSearchParams();
      if (statusOrParams && typeof statusOrParams === "object") {
        if (statusOrParams.status && statusOrParams.status !== "All") params.append("status", statusOrParams.status);
        if (statusOrParams.categoryId && statusOrParams.categoryId !== "All") params.append("categoryId", statusOrParams.categoryId);
        if (statusOrParams.category && statusOrParams.category !== "All") params.append("category", statusOrParams.category);
        if (statusOrParams.search && statusOrParams.search.trim() !== "") params.append("search", statusOrParams.search.trim());
        if (statusOrParams.limit) params.append("limit", String(statusOrParams.limit));
        if (statusOrParams.page) params.append("page", String(statusOrParams.page));
      } else {
        if (statusOrParams && statusOrParams !== "All") params.append("status", statusOrParams);
        if (categoryId && categoryId !== "All") params.append("categoryId", categoryId);
        if (search && search.trim() !== "") params.append("search", search.trim());
        if (limit) params.append("limit", String(limit));
        if (page) params.append("page", String(page));
      }
      const query = params.toString();
      const endpoint = query ? `/blogs?${query}` : "/blogs";
      const res = await apiClient.get<BlogArticle[]>(endpoint);
      const items = Array.isArray(res?.data) ? res.data : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend public blog articles fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getAdminAll(
    statusOrParams?: BlogStatus | string | { status?: BlogStatus | string; categoryId?: string; category?: string; search?: string; limit?: number; page?: number },
    categoryId?: string,
    search?: string,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<BlogArticle>> {
    try {
      const params = new URLSearchParams();
      if (statusOrParams && typeof statusOrParams === "object") {
        if (statusOrParams.status && statusOrParams.status !== "All") params.append("status", statusOrParams.status);
        if (statusOrParams.categoryId && statusOrParams.categoryId !== "All") params.append("categoryId", statusOrParams.categoryId);
        if (statusOrParams.category && statusOrParams.category !== "All") params.append("category", statusOrParams.category);
        if (statusOrParams.search && statusOrParams.search.trim() !== "") params.append("search", statusOrParams.search.trim());
        if (statusOrParams.limit) params.append("limit", String(statusOrParams.limit));
        if (statusOrParams.page) params.append("page", String(statusOrParams.page));
      } else {
        if (statusOrParams && statusOrParams !== "All") params.append("status", statusOrParams);
        if (categoryId && categoryId !== "All") params.append("categoryId", categoryId);
        if (search && search.trim() !== "") params.append("search", search.trim());
        if (limit) params.append("limit", String(limit));
        if (page) params.append("page", String(page));
      }
      const query = params.toString();
      const endpoint = query ? `/admin/blogs?${query}` : "/admin/blogs";
      const res = await apiClient.get<BlogArticle[]>(endpoint);
      const items = Array.isArray(res?.data) ? res.data : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend admin blog articles fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getAll(
    statusOrParams?: BlogStatus | string | { status?: BlogStatus | string; categoryId?: string; category?: string; search?: string; limit?: number; page?: number },
    categoryId?: string,
    search?: string,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<BlogArticle>> {
    return this.getPublicAll(statusOrParams, categoryId, search, limit, page);
  },

  async getById(idOrSlug: string): Promise<BlogArticle | null> {
    try {
      const res = await apiClient.get<BlogArticle>(`/blogs/${idOrSlug}`);
      return res?.data || null;
    } catch (e) {
      console.warn("Backend blog by id fetch error:", e);
      return null;
    }
  },

  async create(data: Partial<BlogFormValues> | Record<string, any>): Promise<ApiResponse<BlogArticle>> {
    const payload: any = {
      title: String(data.title || "").trim(),
      category: String(data.category || "").trim(),
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      readTime: data.readTime || "5 min read",
      status: data.status || BlogStatus.PUBLISHED,
      publishedDate: data.publishedDate || new Date().toISOString().split("T")[0],
      excerpt: data.excerpt || "",
      content: data.content || "",
      ...(data.coverMediaId && typeof data.coverMediaId === "string" && data.coverMediaId.trim() ? { coverMediaId: data.coverMediaId.trim() } : {}),
      ...(data.metaTitle ? { metaTitle: String(data.metaTitle).trim() } : {}),
      ...(data.metaDescription ? { metaDescription: String(data.metaDescription).trim() } : {}),
      ...(data.keywords ? { keywords: String(data.keywords).trim() } : {}),
    };
    return apiClient.post<BlogArticle>("/admin/blogs", payload);
  },

  async update(id: string, data: Partial<BlogFormValues> | Record<string, any>): Promise<ApiResponse<BlogArticle>> {
    const payload: Record<string, any> = {};
    if (data.title !== undefined) payload.title = String(data.title).trim();
    if (data.category !== undefined) payload.category = String(data.category).trim();
    if (data.categoryId !== undefined) payload.categoryId = data.categoryId;
    if (data.readTime !== undefined) payload.readTime = data.readTime;
    if (data.status !== undefined) payload.status = data.status;
    if (data.publishedDate !== undefined) payload.publishedDate = data.publishedDate;
    if (data.excerpt !== undefined) payload.excerpt = data.excerpt;
    if (data.content !== undefined) payload.content = data.content;
    if (data.coverMediaId !== undefined) {
      if (typeof data.coverMediaId === "string" && data.coverMediaId.trim()) payload.coverMediaId = data.coverMediaId.trim();
      else delete payload.coverMediaId;
    }
    if (data.metaTitle !== undefined) payload.metaTitle = String(data.metaTitle).trim();
    if (data.metaDescription !== undefined) payload.metaDescription = String(data.metaDescription).trim();
    if (data.keywords !== undefined) payload.keywords = String(data.keywords).trim();
    return apiClient.put<BlogArticle>(`/admin/blogs/${id}`, payload);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/admin/blogs/${id}`);
  },
};

export const DashboardService = {
  async getMetrics(): Promise<any> {
    try {
      const res = await apiClient.get<any>("/admin/dashboard");
      return res?.data || null;
    } catch (e) {
      console.warn("Backend dashboard metrics fetch error:", e);
      return null;
    }
  },
};

export const SettingService = {
  async getPublicAll(): Promise<Record<string, string>> {
    try {
      const res = await apiClient.get<Record<string, string>>("/settings");
      return res?.data || {};
    } catch (e) {
      console.warn("Backend public settings fetch error:", e);
      return {};
    }
  },

  async getAll(): Promise<Record<string, string>> {
    try {
      const res = await apiClient.get<Record<string, string>>("/admin/settings");
      return res?.data || {};
    } catch (e) {
      console.warn("Backend settings fetch error:", e);
      return {};
    }
  },

  async update(data: any): Promise<ApiResponse<Record<string, string>>> {
    return apiClient.put<Record<string, string>>("/admin/settings", data);
  },
};

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  refId?: string;
  createdAt: string;
}

export interface PaginatedNotificationResponse {
  items: AppNotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedNotifications {
  items: AppNotification[];
  total: number;
  unreadCount?: number;
  limit: number;
  offset: number;
}

export const NotificationService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }): Promise<PaginatedNotificationResponse> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.isRead !== undefined) query.set("isRead", String(params.isRead));
      const q = query.toString() ? `?${query.toString()}` : "";

      const res = await apiClient.get<PaginatedNotificationResponse>(`/notifications${q}`);
      if (res?.data && Array.isArray(res.data.items)) {
        return res.data;
      }
      return { items: [], total: 0, unreadCount: 0, page: 1, limit: 10, totalPages: 1 };
    } catch (e) {
      console.warn("Notifications fetch error:", e);
      return { items: [], total: 0, unreadCount: 0, page: 1, limit: 10, totalPages: 1 };
    }
  },

  async getPaged(limit: number, offset: number): Promise<PaginatedNotifications> {
    try {
      const res = await apiClient.get<PaginatedNotifications>(
        `/notifications/paged?limit=${limit}&offset=${offset}`
      );
      return res?.data ?? { items: [], total: 0, unreadCount: 0, limit, offset };
    } catch (e) {
      console.warn("Notifications paged fetch error:", e);
      return { items: [], total: 0, unreadCount: 0, limit, offset };
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiClient.get<number>("/notifications/unread-count");
      return typeof res?.data === "number" ? res.data : 0;
    } catch (e) {
      console.warn("Unread count fetch error:", e);
      return 0;
    }
  },

  async markAllRead(): Promise<ApiResponse<boolean>> {
    return apiClient.put<boolean>("/notifications/read-all", {});
  },

  async markRead(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.put<boolean>(`/notifications/${id}/read`, {});
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/notifications/${id}`);
  },
};

export interface BaseQueryParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC" | "asc" | "desc";
}

export interface FaqQueryParams extends BaseQueryParams {
  category?: string;
}

export interface TeamQueryParams extends BaseQueryParams { }

export function buildQueryParams(params?: string | BaseQueryParams | Record<string, any>): string {
  if (!params) return "";
  if (typeof params === "string") {
    return params !== "All" ? `status=${encodeURIComponent(params)}` : "";
  }
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      query.append(key, String(value).trim());
    }
  });
  return query.toString();
}

export const FaqService = {
  async getPublicAll(statusOrParams?: FaqStatus | string | FaqQueryParams): Promise<PaginatedList<FaqItem>> {
    try {
      const query = buildQueryParams(statusOrParams);
      const endpoint = query ? `/faqs?${query}` : "/faqs";
      const res = await apiClient.get<FaqItem[]>(endpoint);
      const items = Array.isArray(res?.data) ? res.data : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend faqs fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getAll(statusOrParams?: FaqStatus | string | FaqQueryParams): Promise<PaginatedList<FaqItem>> {
    try {
      const query = buildQueryParams(statusOrParams);
      const endpoint = query ? `/admin/faqs?${query}` : "/admin/faqs";
      const res = await apiClient.get<FaqItem[]>(endpoint);
      const items = Array.isArray(res?.data) ? res.data : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend faqs fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getById(id: string): Promise<FaqItem | null> {
    try {
      const res = await apiClient.get<FaqItem>(`/admin/faqs/${id}`);
      return res?.data || null;
    } catch (e) {
      console.warn("Backend faq by id fetch error:", e);
      return null;
    }
  },

  async create(data: FaqFormValues): Promise<ApiResponse<FaqItem>> {
    return apiClient.post<FaqItem>("/admin/faqs", data);
  },

  async update(id: string, data: Partial<FaqFormValues>): Promise<ApiResponse<FaqItem>> {
    return apiClient.put<FaqItem>(`/admin/faqs/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/admin/faqs/${id}`);
  },

  async reorder(items: { id: string; order: number }[]): Promise<ApiResponse<boolean>> {
    return apiClient.put<boolean>("/admin/faqs/reorder", { items });
  },
};

export interface TeamMemberItem {
  id: string;
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  avatarMediaId?: string;
  experience?: string;
  status: "active" | "inactive";
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMemberFormValues {
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  avatarMediaId?: string;
  experience?: string;
  status?: "active" | "inactive";
  order?: number;
}

export const adminTeamsApi = {
  async getPublicAll(statusOrParams?: string | TeamQueryParams): Promise<PaginatedList<TeamMemberItem>> {
    try {
      const query = buildQueryParams(statusOrParams);
      const endpoint = query ? `/teams?${query}` : "/teams";
      const res = await apiClient.get<TeamMemberItem[]>(endpoint);
      const items = Array.isArray(res?.data) ? res.data : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend public teams fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getAll(statusOrParams?: string | TeamQueryParams): Promise<PaginatedList<TeamMemberItem>> {
    try {
      const query = buildQueryParams(statusOrParams);
      const endpoint = query ? `/admin/teams?${query}` : "/admin/teams";
      const res = await apiClient.get<TeamMemberItem[]>(endpoint);
      const items = Array.isArray(res?.data) ? res.data : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend admin teams fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getById(id: string): Promise<TeamMemberItem | null> {
    try {
      const res = await apiClient.get<TeamMemberItem>(`/admin/teams/${id}`);
      return res?.data || null;
    } catch (e) {
      console.warn("Backend team member by id fetch error:", e);
      return null;
    }
  },

  async create(data: TeamMemberFormValues): Promise<ApiResponse<TeamMemberItem>> {
    const { avatar, ...payload } = data as any;
    if (payload.avatarMediaId && typeof payload.avatarMediaId === "string" && payload.avatarMediaId.trim()) {
      payload.avatarMediaId = payload.avatarMediaId.trim();
    } else {
      delete payload.avatarMediaId;
    }
    return apiClient.post<TeamMemberItem>("/admin/teams", payload);
  },

  async update(id: string, data: Partial<TeamMemberFormValues>): Promise<ApiResponse<TeamMemberItem>> {
    const { avatar, ...payload } = data as any;
    if (payload.avatarMediaId && typeof payload.avatarMediaId === "string" && payload.avatarMediaId.trim()) {
      payload.avatarMediaId = payload.avatarMediaId.trim();
    } else {
      delete payload.avatarMediaId;
    }
    return apiClient.put<TeamMemberItem>(`/admin/teams/${id}`, payload);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/admin/teams/${id}`);
  },

  async reorder(items: { id: string; order: number }[]): Promise<ApiResponse<boolean>> {
    return apiClient.put<boolean>("/admin/teams/reorder", { items });
  },
};

export interface TestimonialItem {
  id: string;
  author: string;
  role?: string;
  country?: string;
  tripName?: string;
  content: string;
  avatar?: string;
  avatarMediaId?: string;
  rating: number;
  status: "active" | "inactive";
  order: number;
}

export interface TestimonialFormValues {
  author: string;
  role?: string;
  country?: string;
  tripName?: string;
  content: string;
  avatar?: string;
  avatarMediaId?: string;
  rating?: number;
  status?: "active" | "inactive";
  order?: number;
}

export interface TestimonialQueryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const adminTestimonialsApi = {
  async getPublicAll(statusOrParams?: string | TestimonialQueryParams): Promise<PaginatedList<TestimonialItem>> {
    try {
      const query = buildQueryParams(statusOrParams);
      const endpoint = query ? `/testimonials?${query}` : "/testimonials";
      const res = await apiClient.get<TestimonialItem[]>(endpoint);
      const items = Array.isArray(res?.data) ? res.data : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend public testimonials fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getAll(statusOrParams?: string | TestimonialQueryParams): Promise<PaginatedList<TestimonialItem>> {
    try {
      const query = buildQueryParams(statusOrParams);
      const endpoint = query ? `/admin/testimonials?${query}` : "/admin/testimonials";
      const res = await apiClient.get<TestimonialItem[]>(endpoint);
      const items = Array.isArray(res?.data) ? res.data : [];
      return makePaginatedList(items, res?.pagination);
    } catch (e) {
      console.warn("Backend admin testimonials fetch error:", e);
      return makePaginatedList([]);
    }
  },

  async getById(id: string): Promise<TestimonialItem | null> {
    try {
      const res = await apiClient.get<TestimonialItem>(`/admin/testimonials/${id}`);
      return res?.data || null;
    } catch (e) {
      console.warn("Backend testimonial by id fetch error:", e);
      return null;
    }
  },

  async create(data: TestimonialFormValues): Promise<ApiResponse<TestimonialItem>> {
    const { avatar, ...payload } = data as any;
    if (payload.avatarMediaId && typeof payload.avatarMediaId === "string" && payload.avatarMediaId.trim()) {
      payload.avatarMediaId = payload.avatarMediaId.trim();
    } else {
      delete payload.avatarMediaId;
    }
    return apiClient.post<TestimonialItem>("/admin/testimonials", payload);
  },

  async update(id: string, data: Partial<TestimonialFormValues>): Promise<ApiResponse<TestimonialItem>> {
    const { avatar, ...payload } = data as any;
    if (payload.avatarMediaId && typeof payload.avatarMediaId === "string" && payload.avatarMediaId.trim()) {
      payload.avatarMediaId = payload.avatarMediaId.trim();
    } else {
      delete payload.avatarMediaId;
    }
    return apiClient.put<TestimonialItem>(`/admin/testimonials/${id}`, payload);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/admin/testimonials/${id}`);
  },

  async reorder(items: { id: string; order: number }[]): Promise<ApiResponse<boolean>> {
    return apiClient.put<boolean>("/admin/testimonials/reorder", { items });
  },
};

export interface AboutUsValueItem {
  title: string;
  desc: string;
}

export interface AboutUsStatItem {
  number: string;
  label: string;
}

export interface AboutUsData {
  id?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroMediaId?: string;
  storyTitle?: string;
  storyContent?: string;
  storyImage?: string;
  storyMediaId?: string;
  mission?: string;
  vision?: string;
  values?: AboutUsValueItem[];
  stats?: AboutUsStatItem[];
  status?: "published" | "draft";

  // Essential Core Meta SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;

  createdAt?: string;
  updatedAt?: string;
}

export const AboutUsService = {
  async getPublic(): Promise<AboutUsData | null> {
    try {
      const res = await apiClient.get<AboutUsData>("/about-us");
      return res?.data || null;
    } catch (e) {
      console.warn("Backend public about-us fetch error:", e);
      return null;
    }
  },

  async getAdmin(): Promise<AboutUsData | null> {
    try {
      const res = await apiClient.get<AboutUsData>("/admin/about-us");
      return res?.data || null;
    } catch (e) {
      console.warn("Backend admin about-us fetch error:", e);
      return null;
    }
  },

  async update(data: Partial<AboutUsData>): Promise<ApiResponse<AboutUsData>> {
    const { heroImage, storyImage, ...payload } = data as any;
    if (payload.heroMediaId && typeof payload.heroMediaId === "string" && payload.heroMediaId.trim()) {
      payload.heroMediaId = payload.heroMediaId.trim();
    } else {
      delete payload.heroMediaId;
    }
    if (payload.storyMediaId && typeof payload.storyMediaId === "string" && payload.storyMediaId.trim()) {
      payload.storyMediaId = payload.storyMediaId.trim();
    } else {
      delete payload.storyMediaId;
    }
    return apiClient.put<AboutUsData>("/admin/about-us", payload);
  },

  async create(data: Partial<AboutUsData>): Promise<ApiResponse<AboutUsData>> {
    const { heroImage, storyImage, ...payload } = data as any;
    if (payload.heroMediaId && typeof payload.heroMediaId === "string" && payload.heroMediaId.trim()) {
      payload.heroMediaId = payload.heroMediaId.trim();
    } else {
      delete payload.heroMediaId;
    }
    if (payload.storyMediaId && typeof payload.storyMediaId === "string" && payload.storyMediaId.trim()) {
      payload.storyMediaId = payload.storyMediaId.trim();
    } else {
      delete payload.storyMediaId;
    }
    return apiClient.post<AboutUsData>("/admin/about-us", payload);
  },
};

export interface AdminSearchResultItem {
  id: string;
  type: 'trek' | 'tour' | 'expedition' | 'category' | 'booking' | 'inquiry' | 'blog' | 'testimonial' | 'team' | 'faq' | 'media';
  typeLabel: string;
  title: string;
  subtitle: string;
  route: string;
}

export interface AdminSearchResponse {
  query: string;
  totalResults: number;
  results: AdminSearchResultItem[];
}

export const AdminSearchService = {
  async globalSearch(query: string): Promise<AdminSearchResponse> {
    if (!query || query.trim().length < 2) {
      return { query: "", totalResults: 0, results: [] };
    }
    try {
      const res = await apiClient.get<AdminSearchResponse>(
        `/admin/search?q=${encodeURIComponent(query.trim())}`
      );
      return res?.data || { query: query.trim(), totalResults: 0, results: [] };
    } catch (e) {
      console.warn("Global search error:", e);
      return { query: query.trim(), totalResults: 0, results: [] };
    }
  },
};



