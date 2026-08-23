import {
  AssociateItem,
  AssociateStatus,
  BlogArticle,
  BlogStatus,
  Booking,
  CategoryItem,
  CategoryStatus,
  CategoryType,
  FaqItem,
  FaqStatus,
  Guide,
  Inquiry,
  NotificationType,
  PackageItem,
} from "@/lib/admin-data";
import {
  AssociateFormValues,
  BlogFormValues,
  BookingFormValues,
  CategoryFormValues,
  ExpeditionFormValues,
  FaqFormValues,
  InquiryFormValues,
  TourFormValues,
  TrekFormValues,
} from "@/lib/admin-schemas";
import { ApiResponse, PaginationMeta, apiClient, axiosInstance } from "@/lib/services/api-client";
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

      const res = await apiClient.get<any[]>(`/media${q}`);
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
    const response = await axiosInstance.post<ApiResponse<any>>(
      `/media/upload${q}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async update(id: string, data: { title?: string; categoryId?: string; description?: string; altText?: string }): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/media/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/media/${id}`);
  },
};

export const CategoryService = {
  async getAll(params?: { type?: CategoryType | string; search?: string; limit?: number; page?: number }): Promise<PaginatedList<CategoryItem>> {
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

  async create(data: Partial<CategoryFormValues> | Record<string, any>): Promise<ApiResponse<CategoryItem>> {
    const payload = {
      name: String(data.name || "").trim(),
      type: data.type,
      description: String(data.description || "").trim(),
      status: data.status || CategoryStatus.ACTIVE,
    };
    return apiClient.post<CategoryItem>("/categories", payload);
  },

  async update(id: string, data: Partial<CategoryFormValues> | Record<string, any>): Promise<ApiResponse<CategoryItem>> {
    const payload: Record<string, any> = {};
    if (data.name !== undefined) payload.name = String(data.name).trim();
    if (data.type !== undefined) payload.type = data.type;
    if (data.description !== undefined) payload.description = String(data.description).trim();
    if (data.status !== undefined) payload.status = data.status;

    return apiClient.put<CategoryItem>(`/categories/${id}`, payload);
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

  const payload: any = { ...rest };

  if (permitsText !== undefined) {
    payload.permitsRequired = permitsText
      ? permitsText.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];
  } else if (Array.isArray(rest.permitsRequired)) {
    payload.permitsRequired = rest.permitsRequired;
  }

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
  if (Array.isArray(rest.galleryImages)) payload.galleryImages = rest.galleryImages;
  if (Array.isArray(rest.galleryMediaIds)) payload.galleryMediaIds = rest.galleryMediaIds.filter(Boolean);

  if (rest.mapImage !== undefined) payload.mapImage = rest.mapImage;
  if (rest.mapMediaId !== undefined) payload.mapMediaId = rest.mapMediaId;

  if (rest.coverMediaId !== undefined) payload.coverMediaId = rest.coverMediaId;

  if (Array.isArray(rest.packageFiles)) payload.packageFiles = rest.packageFiles;

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
    permitsRequired: Array.isArray(p.permitsRequired) ? p.permitsRequired : [],
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
    permitsRequired: Array.isArray(p.permitsRequired) ? p.permitsRequired : [],
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

      const res = await apiClient.get<Booking[]>(`/bookings${q}`);
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
    return apiClient.put<Booking>(`/bookings/${id}`, payload);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/bookings/${id}`);
  },
};

export const InquiryService = {
  async getAll(params?: {
    status?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<PaginatedList<Inquiry>> {
    try {
      const query = new URLSearchParams();
      if (params?.status && params.status !== "All") query.set("status", params.status);
      if (params?.search && params.search.trim()) query.set("search", params.search.trim());
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.page) query.set("page", String(params.page));
      const q = query.toString() ? `?${query.toString()}` : "";

      const res = await apiClient.get<Inquiry[]>(`/inquiries${q}`);
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
    const payload = {
      title: String(data.title || "").trim(),
      category: String(data.category || "").trim(),
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      readTime: data.readTime || "5 min read",
      status: data.status || BlogStatus.PUBLISHED,
      publishedDate: data.publishedDate || new Date().toISOString().split("T")[0],
      excerpt: data.excerpt || "",
      content: data.content || "",
      image: data.image || "",
      ...(data.coverMediaId ? { coverMediaId: data.coverMediaId } : {}),
      ...(data.metaTitle ? { metaTitle: String(data.metaTitle).trim() } : {}),
      ...(data.metaDescription ? { metaDescription: String(data.metaDescription).trim() } : {}),
      ...(data.keywords ? { keywords: String(data.keywords).trim() } : {}),
    };
    return apiClient.post<BlogArticle>("/blogs", payload);
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
    if (data.image !== undefined) payload.image = data.image;
    if (data.coverMediaId !== undefined) payload.coverMediaId = data.coverMediaId;
    if (data.metaTitle !== undefined) payload.metaTitle = String(data.metaTitle).trim();
    if (data.metaDescription !== undefined) payload.metaDescription = String(data.metaDescription).trim();
    if (data.keywords !== undefined) payload.keywords = String(data.keywords).trim();
    return apiClient.put<BlogArticle>(`/blogs/${id}`, payload);
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
  unreadCount?: number;
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
  async getAll(
    statusOrParams?: FaqStatus | string | { status?: FaqStatus | string; category?: string; search?: string; limit?: number; page?: number }
  ): Promise<PaginatedList<FaqItem>> {
    try {
      const params = new URLSearchParams();
      if (statusOrParams && typeof statusOrParams === "object") {
        if (statusOrParams.status && statusOrParams.status !== "All") params.append("status", statusOrParams.status);
        if (statusOrParams.category && statusOrParams.category !== "All") params.append("category", statusOrParams.category);
        if (statusOrParams.search && statusOrParams.search.trim() !== "") params.append("search", statusOrParams.search.trim());
        if (statusOrParams.limit) params.append("limit", String(statusOrParams.limit));
        if (statusOrParams.page) params.append("page", String(statusOrParams.page));
      } else if (statusOrParams && statusOrParams !== "All") {
        params.append("status", statusOrParams);
      }
      const query = params.toString();
      const endpoint = query ? `/faqs?${query}` : "/faqs";
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


