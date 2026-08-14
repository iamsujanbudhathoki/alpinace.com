import {
  CategoryItem,
  CategoryType,
  PackageItem,
  Booking,
  Inquiry,
  Guide,
  BlogArticle,
  BlogStatus,
  AssociateItem,
  AssociateStatus,
  FaqItem,
  FaqStatus,
  NotificationType,
} from "@/lib/admin-data";
import {
  CategoryFormValues,
  TrekFormValues,
  TourFormValues,
  ExpeditionFormValues,
  BookingFormValues,
  InquiryFormValues,
  BlogFormValues,
  AssociateFormValues,
  FaqFormValues,
} from "@/lib/admin-schemas";
import { TrekItem } from "@/lib/trek-data";
import { apiClient, axiosInstance, ApiResponse } from "@/lib/services/api-client";

export const MediaService = {
  async getAllMedia(): Promise<any[]> {
    try {
      const res = await apiClient.get<any[]>("/media");
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Backend media fetch error:", e);
      return [];
    }
  },

  async uploadFile(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post<ApiResponse<any>>(
      "/media/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async update(id: string, data: { title?: string; category?: string; description?: string; altText?: string }): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/media/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/media/${id}`);
  },
};

export const CategoryService = {
  async getAll(): Promise<CategoryItem[]> {
    try {
      const res = await apiClient.get<CategoryItem[]>("/categories");
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Backend categories fetch error:", e);
      return [];
    }
  },

  async getByType(type: CategoryType | string): Promise<CategoryItem[]> {
    try {
      const res = await apiClient.get<CategoryItem[]>(`/categories?type=${type}`);
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Backend categories by type error:", e);
      return [];
    }
  },

  async getById(id: string): Promise<CategoryItem | null> {
    try {
      const res = await apiClient.get<CategoryItem>(`/categories/${id}`);
      return res?.data || null;
    } catch (e) {
      return null;
    }
  },

  async create(data: CategoryFormValues): Promise<ApiResponse<CategoryItem>> {
    return apiClient.post<CategoryItem>("/categories", data);
  },

  async update(id: string, data: Partial<CategoryFormValues>): Promise<ApiResponse<CategoryItem>> {
    return apiClient.put<CategoryItem>(`/categories/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/categories/${id}`);
  },
};

export interface PackageFilterParams {
  categoryType?: "Trekking" | "Expedition" | "Tour";
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
  if (params.categoryId && params.categoryId !== "All") query.set("categoryId", params.categoryId);
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
    permitsText,
    ...rest
  } = data;

  const permitsArray = permitsText
    ? permitsText.split(",").map((s: string) => s.trim()).filter(Boolean)
    : Array.isArray(rest.permitsRequired)
    ? rest.permitsRequired
    : [];

  const payload: any = {
    ...rest,
    permitsRequired: permitsArray,
    durationDays: Number(rest.durationDays || 0),
    priceUSD: Number(rest.priceUSD || 0),
  };

  if (rest.categoryId && typeof rest.categoryId === "string" && rest.categoryId.trim() !== "" && rest.categoryId !== "All") {
    payload.categoryId = rest.categoryId.trim();
  } else {
    delete payload.categoryId;
  }

  if (rest.maxAltitudeMeters !== undefined && rest.maxAltitudeMeters !== null && rest.maxAltitudeMeters !== "") {
    payload.maxAltitudeMeters = Number(rest.maxAltitudeMeters);
  } else {
    delete payload.maxAltitudeMeters;
  }

  if (rest.peakHeightM !== undefined && rest.peakHeightM !== null && rest.peakHeightM !== "") {
    payload.peakHeightM = Number(rest.peakHeightM);
  } else {
    delete payload.peakHeightM;
  }

  delete payload.totalBookings;
  delete payload.rating;
  delete payload.reviewsCount;
  delete payload.category;
  delete payload.categoryType;
  delete payload.permitsText;

  return payload;
}

export function formatBackendTrek(p: any): TrekItem {
  if (!p) return null as any;
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.categoryType || p.category,
    categoryId: p.categoryId,
    rating: Number(p.rating),
    reviewsCount: Number(p.reviewsCount),
    image: p.image,
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
    permitsRequired: Array.isArray(p.permitsRequired) ? p.permitsRequired : [],
    inclusionsText: p.inclusionsText,
    exclusionsText: p.exclusionsText,
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
    rating: Number(p.rating),
    reviewsCount: Number(p.reviewsCount),
    image: p.image,
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
    permitsRequired: Array.isArray(p.permitsRequired) ? p.permitsRequired : [],
    inclusionsText: p.inclusionsText,
    exclusionsText: p.exclusionsText,
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
  async getAll(filters?: PackageFilterParams): Promise<TrekItem[]> {
    try {
      const q = buildPackageQuery(filters);
      const res = await apiClient.get<any[]>(`/treks${q}`);
      return Array.isArray(res?.data) ? res.data.map(formatBackendTrek) : [];
    } catch (e) {
      console.warn("Backend treks fetch error:", e);
      return [];
    }
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
    const res = await apiClient.post<any>("/treks", payload);
    return {
      ...res,
      data: res.data ? formatBackendTrek(res.data) : (null as any),
    };
  },

  async update(id: string, data: Partial<TrekFormValues>): Promise<ApiResponse<TrekItem>> {
    const payload = cleanPackagePayload(data);
    const res = await apiClient.put<any>(`/treks/${id}`, payload);
    return {
      ...res,
      data: res.data ? formatBackendTrek(res.data) : (null as any),
    };
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/treks/${id}`);
  },
};

export const TourService = {
  async getAll(filters?: PackageFilterParams): Promise<PackageItem[]> {
    try {
      const q = buildPackageQuery(filters);
      const res = await apiClient.get<any[]>(`/tours${q}`);
      return Array.isArray(res?.data) ? res.data.map(formatBackendPackage) : [];
    } catch (e) {
      console.warn("Backend tours fetch error:", e);
      return [];
    }
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
    const res = await apiClient.post<any>("/tours", payload);
    return {
      ...res,
      data: res.data ? formatBackendPackage(res.data) : (null as any),
    };
  },

  async update(id: string, data: Partial<TourFormValues>): Promise<ApiResponse<PackageItem>> {
    const payload = cleanPackagePayload(data);
    const res = await apiClient.put<any>(`/tours/${id}`, payload);
    return {
      ...res,
      data: res.data ? formatBackendPackage(res.data) : (null as any),
    };
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/tours/${id}`);
  },
};

export const ExpeditionService = {
  async getAll(filters?: PackageFilterParams): Promise<PackageItem[]> {
    try {
      const q = buildPackageQuery(filters);
      const res = await apiClient.get<any[]>(`/expeditions${q}`);
      return Array.isArray(res?.data) ? res.data.map(formatBackendPackage) : [];
    } catch (e) {
      console.warn("Backend expeditions fetch error:", e);
      return [];
    }
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
    const res = await apiClient.post<any>("/expeditions", payload);
    return {
      ...res,
      data: res.data ? formatBackendPackage(res.data) : (null as any),
    };
  },

  async update(id: string, data: Partial<ExpeditionFormValues>): Promise<ApiResponse<PackageItem>> {
    const payload = cleanPackagePayload(data);
    const res = await apiClient.put<any>(`/expeditions/${id}`, payload);
    return {
      ...res,
      data: res.data ? formatBackendPackage(res.data) : (null as any),
    };
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/expeditions/${id}`);
  },
};

export const BookingService = {
  async getAll(): Promise<Booking[]> {
    try {
      const res = await apiClient.get<Booking[]>("/bookings");
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Backend bookings fetch error:", e);
      return [];
    }
  },

  async create(data: BookingFormValues): Promise<ApiResponse<Booking>> {
    return apiClient.post<Booking>("/bookings", data);
  },

  async update(id: string, data: Partial<BookingFormValues>): Promise<ApiResponse<Booking>> {
    return apiClient.put<Booking>(`/bookings/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/bookings/${id}`);
  },
};

export const InquiryService = {
  async getAll(): Promise<Inquiry[]> {
    try {
      const res = await apiClient.get<Inquiry[]>("/inquiries");
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Backend inquiries fetch error:", e);
      return [];
    }
  },

  async create(data: InquiryFormValues): Promise<ApiResponse<Inquiry>> {
    return apiClient.post<Inquiry>("/inquiries", data);
  },

  async update(id: string, data: { status?: Inquiry["status"]; notes?: string }): Promise<ApiResponse<Inquiry>> {
    return apiClient.put<Inquiry>(`/inquiries/${id}`, data);
  },

  async sendQuote(id: string, data: { message: string }): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/inquiries/${id}/quote`, { message: data.message });
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/inquiries/${id}`);
  },
};

export const GuideService = {
  async getAll(): Promise<Guide[]> {
    try {
      const res = await apiClient.get<Guide[]>("/guides");
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Backend guides fetch error:", e);
      return [];
    }
  },

  async create(data: any): Promise<ApiResponse<Guide>> {
    return apiClient.post<Guide>("/guides", data);
  },

  async update(id: string, data: any): Promise<ApiResponse<Guide>> {
    return apiClient.put<Guide>(`/guides/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/guides/${id}`);
  },
};

export const BlogService = {
  async getAll(status?: BlogStatus, categoryId?: string, search?: string): Promise<BlogArticle[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (categoryId && categoryId !== "All") params.append("categoryId", categoryId);
      if (search && search.trim() !== "") params.append("search", search.trim());
      const query = params.toString();
      const endpoint = query ? `/blogs?${query}` : "/blogs";
      const res = await apiClient.get<BlogArticle[]>(endpoint);
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Backend blog articles fetch error:", e);
      return [];
    }
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

  async create(data: BlogFormValues): Promise<ApiResponse<BlogArticle>> {
    return apiClient.post<BlogArticle>("/blogs", data);
  },

  async update(id: string, data: Partial<BlogFormValues>): Promise<ApiResponse<BlogArticle>> {
    return apiClient.put<BlogArticle>(`/blogs/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/blogs/${id}`);
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
  async getAll(): Promise<Record<string, string>> {
    try {
      const res = await apiClient.get<Record<string, string>>("/settings");
      return res?.data || {};
    } catch (e) {
      console.warn("Backend settings fetch error:", e);
      return {};
    }
  },

  async update(data: any): Promise<ApiResponse<Record<string, string>>> {
    return apiClient.put<Record<string, string>>("/settings", data);
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

export interface PaginatedNotifications {
  items: AppNotification[];
  total: number;
  limit: number;
  offset: number;
}

export const NotificationService = {
  async getAll(): Promise<AppNotification[]> {
    try {
      const res = await apiClient.get<AppNotification[]>("/notifications");
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Notifications fetch error:", e);
      return [];
    }
  },

  async getPaged(limit: number, offset: number): Promise<PaginatedNotifications> {
    try {
      const res = await apiClient.get<PaginatedNotifications>(
        `/notifications/paged?limit=${limit}&offset=${offset}`
      );
      return res?.data ?? { items: [], total: 0, limit, offset };
    } catch (e) {
      console.warn("Notifications paged fetch error:", e);
      return { items: [], total: 0, limit, offset };
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

export const AssociateService = {
  async getAll(status?: AssociateStatus): Promise<AssociateItem[]> {
    try {
      const endpoint = status ? `/associates?status=${status}` : "/associates";
      const res = await apiClient.get<AssociateItem[]>(endpoint);
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Backend associates fetch error:", e);
      return [];
    }
  },

  async getById(id: string): Promise<AssociateItem | null> {
    try {
      const res = await apiClient.get<AssociateItem>(`/associates/${id}`);
      return res?.data || null;
    } catch (e) {
      console.warn("Backend associate by id fetch error:", e);
      return null;
    }
  },

  async create(data: AssociateFormValues): Promise<ApiResponse<AssociateItem>> {
    return apiClient.post<AssociateItem>("/associates", data);
  },

  async update(id: string, data: Partial<AssociateFormValues>): Promise<ApiResponse<AssociateItem>> {
    return apiClient.put<AssociateItem>(`/associates/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/associates/${id}`);
  },
};

export const FaqService = {
  async getAll(status?: FaqStatus): Promise<FaqItem[]> {
    try {
      const endpoint = status ? `/faqs?status=${status}` : "/faqs";
      const res = await apiClient.get<FaqItem[]>(endpoint);
      return Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      console.warn("Backend faqs fetch error:", e);
      return [];
    }
  },

  async getById(id: string): Promise<FaqItem | null> {
    try {
      const res = await apiClient.get<FaqItem>(`/faqs/${id}`);
      return res?.data || null;
    } catch (e) {
      console.warn("Backend faq by id fetch error:", e);
      return null;
    }
  },

  async create(data: FaqFormValues): Promise<ApiResponse<FaqItem>> {
    return apiClient.post<FaqItem>("/faqs", data);
  },

  async update(id: string, data: Partial<FaqFormValues>): Promise<ApiResponse<FaqItem>> {
    return apiClient.put<FaqItem>(`/faqs/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/faqs/${id}`);
  },

  async reorder(items: { id: string; order: number }[]): Promise<ApiResponse<boolean>> {
    return apiClient.put<boolean>("/faqs/reorder", { items });
  },
};


