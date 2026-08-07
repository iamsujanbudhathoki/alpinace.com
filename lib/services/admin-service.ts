import { CategoryItem, mockCategories, PackageItem, mockPackages, Booking, mockBookings, Inquiry, mockInquiries, Guide, mockGuides, BlogArticle, mockBlogArticles } from "@/lib/admin-data";
import { CategoryFormValues, TrekFormValues, TourFormValues, ExpeditionFormValues, BookingFormValues, InquiryFormValues } from "@/lib/admin-schemas";
import { initialTreksData, TrekItem } from "@/lib/trek-data";
import { apiClient, axiosInstance, ApiResponse } from "@/lib/services/api-client";

export const MediaService = {
  async getAllMedia(): Promise<any[]> {
    try {
      const data = await apiClient.get<any[]>("/media");
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn("Backend media server offline or unavailable:", e);
      return [];
    }
  },

  async uploadFile(file: File): Promise<{ id: string; url: string; name: string; title: string; category: string; description: string; altText: string }> {
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
    return response as unknown as any;
  },

  async update(id: string, data: { title?: string; category?: string; description?: string; altText?: string }): Promise<any> {
    return apiClient.put<any>(`/media/${id}`, data);
  },

  async delete(id: string): Promise<boolean> {
    return apiClient.delete<boolean>(`/media/${id}`);
  },
};

export const CategoryService = {
  async getAll(): Promise<CategoryItem[]> {
    try {
      const items = await apiClient.get<CategoryItem[]>("/categories");
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (e) {
      console.warn("Backend categories unavailable, fallback to mock data", e);
    }
    return [...mockCategories];
  },

  async getByType(type: CategoryItem["type"]): Promise<CategoryItem[]> {
    try {
      const items = await apiClient.get<CategoryItem[]>(`/categories?type=${type}`);
      if (Array.isArray(items)) return items;
    } catch (e) {
      console.warn("Backend categories by type error", e);
    }
    return mockCategories.filter((c) => c.type === type && c.status === "Active");
  },

  async getById(id: string): Promise<CategoryItem | null> {
    try {
      return await apiClient.get<CategoryItem>(`/categories/${id}`);
    } catch (e) {
      return mockCategories.find((c) => c.id === id) || null;
    }
  },

  async create(data: CategoryFormValues): Promise<CategoryItem> {
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
      return newCategory;
    }
  },

  async update(id: string, data: Partial<CategoryFormValues>): Promise<CategoryItem> {
    try {
      return await apiClient.put<CategoryItem>(`/categories/${id}`, data);
    } catch (e) {
      const existing = mockCategories.find((c) => c.id === id);
      if (!existing) throw new Error(`Category with ID ${id} not found.`);
      return {
        ...existing,
        ...data,
      };
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      return await apiClient.delete<boolean>(`/categories/${id}`);
    } catch (e) {
      return true;
    }
  },
};

export const TrekService = {
  async getAll(): Promise<TrekItem[]> {
    try {
      const packages = await apiClient.get<any[]>("/packages?categoryType=Trekking");
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

  async create(data: TrekFormValues): Promise<TrekItem> {
    try {
      const permitsArray = data.permitsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const pkg = await apiClient.post<any>("/packages", {
        ...data,
        categoryType: "Trekking",
        permitsRequired: permitsArray,
      });

      return {
        id: pkg.id,
        title: pkg.title,
        slug: pkg.slug,
        category: pkg.category || "TREKKING",
        rating: 5.0,
        reviewsCount: 0,
        image: pkg.image,
        shortDesc: pkg.shortDesc,
        durationDays: Number(pkg.durationDays),
        difficulty: pkg.difficulty,
        bestSeason: pkg.bestSeason || "Spring / Autumn",
        priceUSD: Number(pkg.priceUSD),
        permitsRequired: permitsArray,
        status: pkg.status,
        region: pkg.region,
      };
    } catch (e) {
      const permitsArray = data.permitsText.split(",").map((s) => s.trim()).filter(Boolean);
      return {
        id: `trk-${Date.now()}`,
        title: data.title,
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: data.category || "Everest & Khumbu Region",
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
    }
  },

  async update(id: string, data: Partial<TrekFormValues>): Promise<TrekItem> {
    try {
      const updated = await apiClient.put<any>(`/packages/${id}`, data);
      return {
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
        permitsRequired: updated.permitsRequired || [],
        status: updated.status,
        region: updated.region,
      };
    } catch (e) {
      const existing = initialTreksData.find((t) => t.id === id);
      if (!existing) throw new Error(`Trek with ID ${id} not found.`);
      return { ...existing, ...data } as TrekItem;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      return await apiClient.delete<boolean>(`/packages/${id}`);
    } catch (e) {
      return true;
    }
  },
};

export const TourService = {
  async getAll(): Promise<PackageItem[]> {
    try {
      const items = await apiClient.get<PackageItem[]>("/packages?categoryType=Tour");
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (e) {
      console.warn("Backend tours fetch error", e);
    }
    return mockPackages.filter((p) => p.category === "Tour" || p.category.includes("Tour") || p.category.includes("Sightseeing") || p.category.includes("Heritage"));
  },

  async create(data: TourFormValues): Promise<PackageItem> {
    try {
      const permitsArray = data.permitsText.split(",").map((s) => s.trim()).filter(Boolean);
      return await apiClient.post<PackageItem>("/packages", {
        ...data,
        categoryType: "Tour",
        permitsRequired: permitsArray,
      });
    } catch (e) {
      const permitsArray = data.permitsText.split(",").map((s) => s.trim()).filter(Boolean);
      return {
        id: `pkg-tour-${Date.now()}`,
        title: data.title,
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: data.category || "Kathmandu Valley Heritage",
        region: data.region,
        durationDays: Number(data.durationDays),
        maxAltitudeMeters: Number(data.maxAltitudeMeters) || 1400,
        difficulty: "Easy",
        priceUSD: Number(data.priceUSD),
        status: data.status,
        totalBookings: 0,
        rating: 5.0,
        permitsRequired: permitsArray.length > 0 ? permitsArray : ["Monuments Entrance Fees"],
      };
    }
  },

  async update(id: string, data: Partial<TourFormValues>): Promise<PackageItem> {
    try {
      return await apiClient.put<PackageItem>(`/packages/${id}`, data);
    } catch (e) {
      const existing = mockPackages.find((p) => p.id === id);
      return { ...existing, ...data } as PackageItem;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      return await apiClient.delete<boolean>(`/packages/${id}`);
    } catch (e) {
      return true;
    }
  },
};

export const ExpeditionService = {
  async getAll(): Promise<PackageItem[]> {
    try {
      const items = await apiClient.get<PackageItem[]>("/packages?categoryType=Expedition");
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (e) {
      console.warn("Backend expeditions fetch error", e);
    }
    return mockPackages.filter((p) => p.category === "Expedition" || p.category.includes("Peaks") || p.category.includes("Climbing"));
  },

  async create(data: ExpeditionFormValues): Promise<PackageItem> {
    try {
      const permitsArray = data.permitsText.split(",").map((s) => s.trim()).filter(Boolean);
      return await apiClient.post<PackageItem>("/packages", {
        ...data,
        categoryType: "Expedition",
        permitsRequired: permitsArray,
      });
    } catch (e) {
      const permitsArray = data.permitsText.split(",").map((s) => s.trim()).filter(Boolean);
      return {
        id: `pkg-exp-${Date.now()}`,
        title: data.title,
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: data.category || "8000m+ Extreme Peaks",
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
    }
  },

  async update(id: string, data: Partial<ExpeditionFormValues>): Promise<PackageItem> {
    try {
      return await apiClient.put<PackageItem>(`/packages/${id}`, data);
    } catch (e) {
      const existing = mockPackages.find((p) => p.id === id);
      return { ...existing, ...data } as PackageItem;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      return await apiClient.delete<boolean>(`/packages/${id}`);
    } catch (e) {
      return true;
    }
  },
};

export const BookingService = {
  async getAll(): Promise<Booking[]> {
    try {
      const items = await apiClient.get<Booking[]>("/bookings");
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (e) {
      console.warn("Backend bookings fetch error", e);
    }
    return [...mockBookings];
  },

  async create(data: BookingFormValues): Promise<Booking> {
    try {
      return await apiClient.post<Booking>("/bookings", data);
    } catch (e) {
      return {
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
        assignedGuide: data.assignedGuide || "Unassigned",
        permitStatus: data.permitStatus,
        specialRequests: data.specialRequests,
      };
    }
  },

  async update(id: string, data: Partial<BookingFormValues>): Promise<Booking> {
    try {
      return await apiClient.put<Booking>(`/bookings/${id}`, data);
    } catch (e) {
      const existing = mockBookings.find((b) => b.id === id);
      if (!existing) throw new Error("Booking not found");
      return { ...existing, ...data } as Booking;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      return await apiClient.delete<boolean>(`/packages/${id}`);
    } catch (e) {
      return true;
    }
  },
};

export const InquiryService = {
  async getAll(): Promise<Inquiry[]> {
    try {
      const items = await apiClient.get<Inquiry[]>("/inquiries");
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (e) {
      console.warn("Backend inquiries fetch error", e);
    }
    return [...mockInquiries];
  },

  async create(data: InquiryFormValues): Promise<Inquiry> {
    try {
      return await apiClient.post<Inquiry>("/inquiries", data);
    } catch (e) {
      return {
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
    }
  },

  async update(id: string, data: { status?: Inquiry["status"]; notes?: string }): Promise<Inquiry> {
    try {
      return await apiClient.put<Inquiry>(`/inquiries/${id}`, data);
    } catch (e) {
      const existing = mockInquiries.find((i) => i.id === id);
      if (!existing) throw new Error("Inquiry not found");
      return { ...existing, ...data };
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      return await apiClient.delete<boolean>(`/inquiries/${id}`);
    } catch (e) {
      return true;
    }
  },
};

export const GuideService = {
  async getAll(): Promise<Guide[]> {
    try {
      const items = await apiClient.get<Guide[]>("/guides");
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (e) {
      console.warn("Backend guides fetch error", e);
    }
    return [...mockGuides];
  },

  async create(data: any): Promise<Guide> {
    try {
      return await apiClient.post<Guide>("/guides", data);
    } catch (e) {
      return { id: `gd-${Date.now()}`, ...data };
    }
  },

  async update(id: string, data: any): Promise<Guide> {
    try {
      return await apiClient.put<Guide>(`/guides/${id}`, data);
    } catch (e) {
      const existing = mockGuides.find((g) => g.id === id);
      return { ...existing, ...data } as Guide;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      return await apiClient.delete<boolean>(`/guides/${id}`);
    } catch (e) {
      return true;
    }
  },
};

export const BlogService = {
  async getAll(): Promise<BlogArticle[]> {
    try {
      const items = await apiClient.get<BlogArticle[]>("/blogs");
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (e) {
      console.warn("Backend blog articles fetch error", e);
    }
    return [...mockBlogArticles];
  },

  async create(data: any): Promise<BlogArticle> {
    try {
      return await apiClient.post<BlogArticle>("/blogs", data);
    } catch (e) {
      return { id: `blog-${Date.now()}`, views: 0, ...data };
    }
  },

  async update(id: string, data: any): Promise<BlogArticle> {
    try {
      return await apiClient.put<BlogArticle>(`/blogs/${id}`, data);
    } catch (e) {
      const existing = mockBlogArticles.find((b) => b.id === id);
      return { ...existing, ...data } as BlogArticle;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      return await apiClient.delete<boolean>(`/blogs/${id}`);
    } catch (e) {
      return true;
    }
  },
};

export const DashboardService = {
  async getMetrics(): Promise<any> {
    try {
      return await apiClient.get<any>("/admin/dashboard");
    } catch (e) {
      console.warn("Backend dashboard metrics fetch error", e);
      return null;
    }
  },
};

export const SettingService = {
  async getAll(): Promise<Record<string, string>> {
    try {
      return await apiClient.get<Record<string, string>>("/settings");
    } catch (e) {
      return {
        siteName: "Alpine Ace Expeditions",
        contactEmail: "expeditions@alpineace.com",
        contactPhone: "+977 1 4545890",
        companyAddress: "Thamel, Kathmandu, Nepal",
      };
    }
  },

  async update(data: any): Promise<Record<string, string>> {
    try {
      return await apiClient.put<Record<string, string>>("/settings", data);
    } catch (e) {
      return data;
    }
  },
};
