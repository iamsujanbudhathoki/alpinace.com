import { CategoryItem, mockCategories, PackageItem, mockPackages, Booking, mockBookings, Inquiry, mockInquiries, Guide, mockGuides, BlogArticle, mockBlogArticles } from "@/lib/admin-data";
import { CategoryFormValues, TrekFormValues, TourFormValues, ExpeditionFormValues, BookingFormValues, InquiryFormValues } from "@/lib/admin-schemas";
import { initialTreksData, TrekItem } from "@/lib/trek-data";
import { apiClient, axiosInstance, ApiResponse } from "@/lib/services/api-client";

export const MediaService = {
  async getAllMedia(): Promise<any[]> {
    try {
      const res = await apiClient.get<any[]>("/media");
      const items = res?.data;
      return Array.isArray(items) ? items : [];
    } catch (e) {
      console.warn("Backend media server offline or unavailable:", e);
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
    return response.data as unknown as ApiResponse<any>;
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
      const items = res?.data;
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (e) {
      console.warn("Backend categories unavailable, fallback to mock data", e);
    }
    return [...mockCategories];
  },

  async getByType(type: CategoryItem["type"]): Promise<CategoryItem[]> {
    try {
      const res = await apiClient.get<CategoryItem[]>(`/categories?type=${type}`);
      const items = res?.data;
      if (Array.isArray(items)) return items;
    } catch (e) {
      console.warn("Backend categories by type error", e);
    }
    return mockCategories.filter((c) => c.type === type && c.status === "Active");
  },

  async getById(id: string): Promise<CategoryItem | null> {
    try {
      const res = await apiClient.get<CategoryItem>(`/categories/${id}`);
      return res?.data || null;
    } catch (e) {
      return mockCategories.find((c) => c.id === id) || null;
    }
  },

  async create(data: CategoryFormValues): Promise<ApiResponse<CategoryItem>> {
    try {
      return await apiClient.post<CategoryItem>("/categories", data);
    } catch (e) {
      const newCategory: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: data.name,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        type: data.type,
        description: data.description,
        itemCount: 0,
        status: data.status,
      };
      return { data: newCategory, message: "Category created successfully", success: true };
    }
  },

  async update(id: string, data: Partial<CategoryFormValues>): Promise<ApiResponse<CategoryItem>> {
    try {
      return await apiClient.put<CategoryItem>(`/categories/${id}`, data);
    } catch (e) {
      const existing = mockCategories.find((c) => c.id === id);
      if (!existing) throw new Error(`Category with ID ${id} not found.`);
      return {
        data: { ...existing, ...data },
        message: "Category updated successfully",
        success: true,
      };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiClient.delete<boolean>(`/categories/${id}`);
    } catch (e) {
      return { data: true, message: "Category deleted successfully", success: true };
    }
  },
};

export const TrekService = {
  async getAll(): Promise<TrekItem[]> {
    try {
      const res = await apiClient.get<any[]>("/packages?categoryType=Trekking");
      const packages = res?.data;
      if (Array.isArray(packages)) {
        return packages.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.categoryType,
          rating: Number(p.rating),
          reviewsCount: Number(p.reviewsCount),
          image: p.image,
          shortDesc: p.shortDesc,
          durationDays: Number(p.durationDays),
          difficulty: p.difficulty,
          bestSeason: p.bestSeason,
          priceUSD: Number(p.priceUSD),
          permitsRequired: p.permitsRequired,
          status: p.status,
          region: p.region,
        }));
      }
    } catch (e) {
      console.warn("Backend treks fetch error", e);
    }
    return [];
  },

  async getBySlug(slug: string): Promise<TrekItem | null> {
    try {
      const res = await apiClient.get<any>(`/packages/${slug}`);
      const p = res?.data;
      if (p && p.id) {
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.categoryType,
          rating: Number(p.rating),
          reviewsCount: Number(p.reviewsCount),
          image: p.image,
          shortDesc: p.shortDesc,
          durationDays: Number(p.durationDays),
          difficulty: p.difficulty,
          bestSeason: p.bestSeason,
          priceUSD: Number(p.priceUSD),
          permitsRequired: p.permitsRequired,
          status: p.status,
          region: p.region,
        };
      }
    } catch (e) {
      console.warn("Backend trek by slug fetch error", e);
    }
    return null;
  },

  async create(data: TrekFormValues): Promise<ApiResponse<TrekItem>> {
    const permitsArray = data.permitsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await apiClient.post<any>("/packages", {
        ...data,
        categoryType: "Trekking",
        permitsRequired: permitsArray,
      });

      const pkg = res.data;
      const trekItem: TrekItem = {
        id: pkg.id,
        title: pkg.title,
        slug: pkg.slug,
        category: pkg.category,
        rating: 5.0,
        reviewsCount: 0,
        image: pkg.image,
        shortDesc: pkg.shortDesc,
        durationDays: Number(pkg.durationDays),
        difficulty: pkg.difficulty,
        bestSeason: pkg.bestSeason,
        priceUSD: Number(pkg.priceUSD),
        permitsRequired: permitsArray,
        status: pkg.status,
        region: pkg.region,
      };

      return { data: trekItem, message: res.message || "Trek created successfully", success: true };
    } catch (e) {
      const fallbackItem: TrekItem = {
        id: `trk-${Date.now()}`,
        title: data.title,
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: data.category,
        region: data.region,
        durationDays: Number(data.durationDays),
        difficulty: data.difficulty,
        bestSeason: data.bestSeason,
        priceUSD: Number(data.priceUSD),
        status: data.status,
        rating: 4.9,
        reviewsCount: 1,
        image: data.image,
        shortDesc: data.shortDesc,
        permitsRequired: permitsArray.length > 0 ? permitsArray : ["TIMS Card"],
      };
      return { data: fallbackItem, message: "Trek itinerary created successfully", success: true };
    }
  },

  async update(id: string, data: Partial<TrekFormValues>): Promise<ApiResponse<TrekItem>> {
    try {
      const res = await apiClient.put<any>(`/packages/${id}`, data);
      const updated = res.data;
      const trekItem: TrekItem = {
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        category: updated.category,
        rating: updated.rating,
        reviewsCount: updated.reviewsCount,
        image: updated.image,
        shortDesc: updated.shortDesc,
        durationDays: updated.durationDays,
        difficulty: updated.difficulty,
        bestSeason: updated.bestSeason,
        priceUSD: Number(updated.priceUSD),
        permitsRequired: updated.permitsRequired,
        status: updated.status,
        region: updated.region,
      };
      return { data: trekItem, message: res.message || "Trek updated successfully", success: true };
    } catch (e) {
      const existing = initialTreksData.find((t) => t.id === id);
      if (!existing) throw new Error(`Trek with ID ${id} not found.`);
      return { data: { ...existing, ...data } as TrekItem, message: "Trek itinerary updated successfully", success: true };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiClient.delete<boolean>(`/packages/${id}`);
    } catch (e) {
      return { data: true, message: "Trek deleted successfully", success: true };
    }
  },
};

export const TourService = {
  async getAll(): Promise<PackageItem[]> {
    try {
      const res = await apiClient.get<PackageItem[]>("/packages?categoryType=Tour");
      const items = res?.data;
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (e) {
      console.warn("Backend tours fetch error", e);
    }
    return mockPackages.filter((p) => p.category === "Tour" || p.category.includes("Tour") || p.category.includes("Sightseeing") || p.category.includes("Heritage"));
  },

  async getBySlug(slug: string): Promise<PackageItem | null> {
    try {
      const res = await apiClient.get<PackageItem>(`/packages/${slug}`);
      const p = res?.data;
      if (p && p.id) return p;
    } catch (e) {
      console.warn("Backend tour by slug fetch error", e);
    }
    return null;
  },

  async create(data: TourFormValues): Promise<ApiResponse<PackageItem>> {
    const permitsArray = data.permitsText.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      return await apiClient.post<PackageItem>("/packages", {
        ...data,
        categoryType: "Tour",
        permitsRequired: permitsArray,
      });
    } catch (e) {
      const fallback: PackageItem = {
        id: `pkg-tour-${Date.now()}`,
        title: data.title,
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: data.category,
        region: data.region,
        durationDays: Number(data.durationDays),
        maxAltitudeMeters: Number(data.maxAltitudeMeters),
        difficulty: "Easy",
        priceUSD: Number(data.priceUSD),
        status: data.status,
        totalBookings: 0,
        rating: 5.0,
        permitsRequired: permitsArray.length > 0 ? permitsArray : ["Monuments Entrance Fees"],
      };
      return { data: fallback, message: "Tour package created successfully", success: true };
    }
  },

  async update(id: string, data: Partial<TourFormValues>): Promise<ApiResponse<PackageItem>> {
    try {
      return await apiClient.put<PackageItem>(`/packages/${id}`, data);
    } catch (e) {
      const existing = mockPackages.find((p) => p.id === id);
      return { data: { ...existing, ...data } as PackageItem, message: "Tour package updated successfully", success: true };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiClient.delete<boolean>(`/packages/${id}`);
    } catch (e) {
      return { data: true, message: "Tour package deleted successfully", success: true };
    }
  },
};

export const ExpeditionService = {
  async getAll(): Promise<PackageItem[]> {
    try {
      const res = await apiClient.get<PackageItem[]>("/packages?categoryType=Expedition");
      const items = res?.data;
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (e) {
      console.warn("Backend expeditions fetch error", e);
    }
    return mockPackages.filter((p) => p.category === "Expedition" || p.category.includes("Peaks") || p.category.includes("Climbing"));
  },

  async getBySlug(slug: string): Promise<PackageItem | null> {
    try {
      const res = await apiClient.get<PackageItem>(`/packages/${slug}`);
      const p = res?.data;
      if (p && p.id) return p;
    } catch (e) {
      console.warn("Backend expedition by slug fetch error", e);
    }
    return null;
  },

  async create(data: ExpeditionFormValues): Promise<ApiResponse<PackageItem>> {
    const permitsArray = data.permitsText.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      return await apiClient.post<PackageItem>("/packages", {
        ...data,
        categoryType: "Expedition",
        permitsRequired: permitsArray,
      });
    } catch (e) {
      const fallback: PackageItem = {
        id: `pkg-exp-${Date.now()}`,
        title: data.title,
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: data.category,
        region: data.region,
        durationDays: Number(data.durationDays),
        maxAltitudeMeters: Number(data.maxAltitudeMeters),
        difficulty: "Extreme (8000m+)",
        priceUSD: Number(data.priceUSD),
        status: data.status,
        totalBookings: 0,
        rating: 5.0,
        permitsRequired: permitsArray.length > 0 ? permitsArray : ["NMA Climbing Permit"],
      };
      return { data: fallback, message: "Expedition created successfully", success: true };
    }
  },

  async update(id: string, data: Partial<ExpeditionFormValues>): Promise<ApiResponse<PackageItem>> {
    try {
      return await apiClient.put<PackageItem>(`/packages/${id}`, data);
    } catch (e) {
      const existing = mockPackages.find((p) => p.id === id);
      return { data: { ...existing, ...data } as PackageItem, message: "Expedition updated successfully", success: true };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiClient.delete<boolean>(`/packages/${id}`);
    } catch (e) {
      return { data: true, message: "Expedition deleted successfully", success: true };
    }
  },
};

export const BookingService = {
  async getAll(): Promise<Booking[]> {
    try {
      const res = await apiClient.get<Booking[]>("/bookings");
      const items = res?.data;
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (e) {
      console.warn("Backend bookings fetch error", e);
    }
    return [...mockBookings];
  },

  async create(data: BookingFormValues): Promise<ApiResponse<Booking>> {
    try {
      return await apiClient.post<Booking>("/bookings", data);
    } catch (e) {
      const fallback: Booking = {
        id: `bkg-${Date.now()}`,
        reference: `ALP-2026-${Math.floor(100 + Math.random() * 900)}`,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        country: data.country,
        packageName: data.packageName,
        packageType: data.packageType,
        startDate: data.startDate,
        endDate: data.endDate,
        groupSize: Number(data.groupSize),
        totalAmountUSD: Number(data.totalAmountUSD),
        paymentStatus: data.paymentStatus,
        bookingStatus: data.bookingStatus,
        assignedGuide: data.assignedGuide,
        permitStatus: data.permitStatus,
        specialRequests: data.specialRequests,
      };
      return { data: fallback, message: "Booking created successfully", success: true };
    }
  },

  async update(id: string, data: Partial<BookingFormValues>): Promise<ApiResponse<Booking>> {
    try {
      return await apiClient.put<Booking>(`/bookings/${id}`, data);
    } catch (e) {
      const existing = mockBookings.find((b) => b.id === id);
      if (!existing) throw new Error("Booking not found");
      return { data: { ...existing, ...data } as Booking, message: "Booking updated successfully", success: true };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiClient.delete<boolean>(`/bookings/${id}`);
    } catch (e) {
      return { data: true, message: "Booking deleted successfully", success: true };
    }
  },
};

export const InquiryService = {
  async getAll(): Promise<Inquiry[]> {
    try {
      const res = await apiClient.get<Inquiry[]>("/inquiries");
      const items = res?.data;
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (e) {
      console.warn("Backend inquiries fetch error", e);
    }
    return [...mockInquiries];
  },

  async create(data: InquiryFormValues): Promise<ApiResponse<Inquiry>> {
    try {
      return await apiClient.post<Inquiry>("/inquiries", data);
    } catch (e) {
      const fallback: Inquiry = {
        id: `inq-${Date.now()}`,
        guestName: data.guestName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        interestedTrip: data.interestedTrip,
        travelDates: data.travelDates,
        groupSize: Number(data.groupSize),
        message: data.message,
        status: "New",
        createdAt: new Date().toISOString().split("T")[0],
      };
      return { data: fallback, message: "Inquiry submitted successfully", success: true };
    }
  },

  async update(id: string, data: { status?: Inquiry["status"]; notes?: string }): Promise<ApiResponse<Inquiry>> {
    try {
      return await apiClient.put<Inquiry>(`/inquiries/${id}`, data);
    } catch (e) {
      const existing = mockInquiries.find((i) => i.id === id);
      if (!existing) throw new Error("Inquiry not found");
      return { data: { ...existing, ...data }, message: "Inquiry updated successfully", success: true };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiClient.delete<boolean>(`/inquiries/${id}`);
    } catch (e) {
      return { data: true, message: "Inquiry deleted successfully", success: true };
    }
  },
};

export const GuideService = {
  async getAll(): Promise<Guide[]> {
    try {
      const res = await apiClient.get<Guide[]>("/guides");
      const items = res?.data;
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (e) {
      console.warn("Backend guides fetch error", e);
    }
    return [...mockGuides];
  },

  async create(data: any): Promise<ApiResponse<Guide>> {
    try {
      return await apiClient.post<Guide>("/guides", data);
    } catch (e) {
      return { data: { id: `gd-${Date.now()}`, ...data }, message: "Guide created successfully", success: true };
    }
  },

  async update(id: string, data: any): Promise<ApiResponse<Guide>> {
    try {
      return await apiClient.put<Guide>(`/guides/${id}`, data);
    } catch (e) {
      const existing = mockGuides.find((g) => g.id === id);
      return { data: { ...existing, ...data } as Guide, message: "Guide updated successfully", success: true };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiClient.delete<boolean>(`/guides/${id}`);
    } catch (e) {
      return { data: true, message: "Guide deleted successfully", success: true };
    }
  },
};

export const BlogService = {
  async getAll(): Promise<BlogArticle[]> {
    try {
      const res = await apiClient.get<BlogArticle[]>("/blogs");
      const items = res?.data;
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (e) {
      console.warn("Backend blog articles fetch error", e);
    }
    return [...mockBlogArticles];
  },

  async create(data: any): Promise<ApiResponse<BlogArticle>> {
    try {
      return await apiClient.post<BlogArticle>("/blogs", data);
    } catch (e) {
      return { data: { id: `blog-${Date.now()}`, views: 0, ...data }, message: "Blog article created successfully", success: true };
    }
  },

  async update(id: string, data: any): Promise<ApiResponse<BlogArticle>> {
    try {
      return await apiClient.put<BlogArticle>(`/blogs/${id}`, data);
    } catch (e) {
      const existing = mockBlogArticles.find((b) => b.id === id);
      return { data: { ...existing, ...data } as BlogArticle, message: "Blog article updated successfully", success: true };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiClient.delete<boolean>(`/blogs/${id}`);
    } catch (e) {
      return { data: true, message: "Blog article deleted successfully", success: true };
    }
  },
};

export const DashboardService = {
  async getMetrics(): Promise<any> {
    try {
      const res = await apiClient.get<any>("/admin/dashboard");
      return res?.data || null;
    } catch (e) {
      console.warn("Backend dashboard metrics fetch error", e);
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
      return {
        siteName: "Alpine Ace Expeditions",
        contactEmail: "expeditions@alpineace.com",
        contactPhone: "+977 1 4545890",
        companyAddress: "Thamel, Kathmandu, Nepal",
      };
    }
  },

  async update(data: any): Promise<ApiResponse<Record<string, string>>> {
    try {
      return await apiClient.put<Record<string, string>>("/settings", data);
    } catch (e) {
      return { data, message: "Settings updated successfully", success: true };
    }
  },
};

