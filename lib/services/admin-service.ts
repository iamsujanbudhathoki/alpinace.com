import { CategoryItem, mockCategories, PackageItem, mockPackages, Booking, mockBookings, Inquiry, mockInquiries } from "@/lib/admin-data";
import { CategoryFormValues, TrekFormValues, TourFormValues, ExpeditionFormValues, BookingFormValues, InquiryFormValues } from "@/lib/admin-schemas";
import { initialTreksData, TrekItem } from "@/lib/trek-data";

/**
 * Flexible API Abstraction Layer for Admin Entities.
 * Currently backed by in-memory data store with mock async delay.
 * When integrating a real backend (Prisma, PostgreSQL, REST API, or Supabase),
 * simply update the internal fetch/database logic here without modifying UI components or forms.
 */

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let categoriesStore: CategoryItem[] = [...mockCategories];
let treksStore: TrekItem[] = [...initialTreksData];
let packagesStore: PackageItem[] = [...mockPackages];
let bookingsStore: Booking[] = [...mockBookings];
let inquiriesStore: Inquiry[] = [...mockInquiries];

export const CategoryService = {
  async getAll(): Promise<CategoryItem[]> {
    await delay();
    return [...categoriesStore];
  },

  async getByType(type: CategoryItem["type"]): Promise<CategoryItem[]> {
    await delay();
    return categoriesStore.filter((c) => c.type === type && c.status === "Active");
  },

  async getById(id: string): Promise<CategoryItem | null> {
    await delay();
    return categoriesStore.find((c) => c.id === id) || null;
  },

  async create(data: CategoryFormValues): Promise<CategoryItem> {
    await delay();
    const newCategory: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      type: data.type,
      description: data.description,
      itemCount: 0,
      status: data.status,
    };
    categoriesStore = [newCategory, ...categoriesStore];
    return newCategory;
  },

  async update(id: string, data: Partial<CategoryFormValues>): Promise<CategoryItem> {
    await delay();
    const existing = categoriesStore.find((c) => c.id === id);
    if (!existing) throw new Error(`Category with ID ${id} not found.`);

    const updated: CategoryItem = {
      ...existing,
      name: data.name ?? existing.name,
      slug: data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : existing.slug,
      type: data.type ?? existing.type,
      description: data.description ?? existing.description,
      status: data.status ?? existing.status,
    };
    categoriesStore = categoriesStore.map((c) => (c.id === id ? updated : c));
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    await delay();
    categoriesStore = categoriesStore.filter((c) => c.id !== id);
    return true;
  },
};

export const TrekService = {
  async getAll(): Promise<TrekItem[]> {
    await delay();
    return [...treksStore];
  },

  async create(data: TrekFormValues): Promise<TrekItem> {
    await delay();
    const permitsArray = data.permitsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newTrek: TrekItem = {
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
    treksStore = [newTrek, ...treksStore];
    return newTrek;
  },

  async update(id: string, data: Partial<TrekFormValues>): Promise<TrekItem> {
    await delay();
    const existing = treksStore.find((t) => t.id === id);
    if (!existing) throw new Error(`Trek with ID ${id} not found.`);

    const updated: TrekItem = {
      ...existing,
      title: data.title ?? existing.title,
      category: data.category ?? existing.category,
      region: data.region ?? existing.region,
      durationDays: data.durationDays ? Number(data.durationDays) : existing.durationDays,
      difficulty: data.difficulty ?? existing.difficulty,
      priceUSD: data.priceUSD ? Number(data.priceUSD) : existing.priceUSD,
      bestSeason: data.bestSeason ?? existing.bestSeason,
      status: data.status ?? existing.status,
      image: data.image ?? existing.image,
      shortDesc: data.shortDesc ?? existing.shortDesc,
    };
    treksStore = treksStore.map((t) => (t.id === id ? updated : t));
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    await delay();
    treksStore = treksStore.filter((t) => t.id !== id);
    return true;
  },
};

export const TourService = {
  async getAll(): Promise<PackageItem[]> {
    await delay();
    return packagesStore.filter((p) => p.category === "Tour" || p.category.includes("Tour") || p.category.includes("Sightseeing") || p.category.includes("Heritage"));
  },

  async create(data: TourFormValues): Promise<PackageItem> {
    await delay();
    const permitsArray = data.permitsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newTour: PackageItem = {
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
    packagesStore = [newTour, ...packagesStore];
    return newTour;
  },

  async delete(id: string): Promise<boolean> {
    await delay();
    packagesStore = packagesStore.filter((p) => p.id !== id);
    return true;
  },
};

export const ExpeditionService = {
  async getAll(): Promise<PackageItem[]> {
    await delay();
    return packagesStore.filter((p) => p.category === "Expedition" || p.category.includes("Peaks") || p.category.includes("Climbing"));
  },

  async create(data: ExpeditionFormValues): Promise<PackageItem> {
    await delay();
    const permitsArray = data.permitsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newExpedition: PackageItem = {
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
    packagesStore = [newExpedition, ...packagesStore];
    return newExpedition;
  },

  async delete(id: string): Promise<boolean> {
    await delay();
    packagesStore = packagesStore.filter((p) => p.id !== id);
    return true;
  },
};

export const BookingService = {
  async getAll(): Promise<Booking[]> {
    await delay();
    return [...bookingsStore];
  },

  async create(data: BookingFormValues): Promise<Booking> {
    await delay();
    const newBooking: Booking = {
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
    bookingsStore = [newBooking, ...bookingsStore];
    return newBooking;
  },

  async delete(id: string): Promise<boolean> {
    await delay();
    bookingsStore = bookingsStore.filter((b) => b.id !== id);
    return true;
  },
};

export const InquiryService = {
  async getAll(): Promise<Inquiry[]> {
    await delay();
    return [...inquiriesStore];
  },

  async create(data: InquiryFormValues): Promise<Inquiry> {
    await delay();
    const newInquiry: Inquiry = {
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
    inquiriesStore = [newInquiry, ...inquiriesStore];
    return newInquiry;
  },

  async delete(id: string): Promise<boolean> {
    await delay();
    inquiriesStore = inquiriesStore.filter((i) => i.id !== id);
    return true;
  },
};
