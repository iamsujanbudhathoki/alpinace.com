export const PACKAGE_REGIONS = ["Everest", "Annapurna", "Langtang", "Manaslu", "Kathmandu & Pokhara", "Khumbu"] as const;
export const PACKAGE_STATUSES = ["Active", "Draft", "Featured"] as const;
export const PACKAGE_TYPES = ["Trekking", "Expedition", "Tour"] as const;
export const BOOKING_STATUSES = ["Confirmed", "In Review", "Active Trek", "Completed", "Cancelled"] as const;
export const PAYMENT_STATUSES = ["Paid", "Deposit Paid", "Pending", "Refunded"] as const;
export const PERMIT_STATUSES = ["Issued", "Processing", "Pending Document"] as const;

export enum BlogStatus {
  PUBLISHED = "Published",
  DRAFT = "Draft",
  ARCHIVED = "Archived",
}

export type PackageRegion = typeof PACKAGE_REGIONS[number];
export type PackageStatus = typeof PACKAGE_STATUSES[number];
export type PackageCategoryType = typeof PACKAGE_TYPES[number];
export type BookingStatus = typeof BOOKING_STATUSES[number];
export type PaymentStatus = typeof PAYMENT_STATUSES[number];
export type PermitStatus = typeof PERMIT_STATUSES[number];
export type PackageDifficulty = "Easy" | "Moderate" | "Challenging" | "Extreme (8000m+)";

export interface Booking {
  id: string;
  reference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  country: string;
  packageName: string;
  packageType: PackageCategoryType;
  startDate: string;
  endDate: string;
  groupSize: number;
  totalAmountUSD: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  assignedGuide?: string;
  permitStatus: PermitStatus;
  specialRequests?: string;
}

export interface PackageItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  categoryId?: string;
  region: PackageRegion;
  durationDays: number;
  maxAltitudeMeters: number;
  difficulty: PackageDifficulty;
  priceUSD: number;
  status: PackageStatus;
  totalBookings: number;
  rating: number;
  reviewsCount?: number;
  image?: string;
  shortDesc?: string;
  bestSeason?: string;
  permitsRequired: string[];
}

export interface Guide {
  id: string;
  name: string;
  role: "Lead Expedition Leader" | "Senior Trekking Guide" | "High Altitude Sherpa" | "Cultural Tour Guide";
  summitStats: string;
  certifications: string[];
  status: "Available" | "On Mountain" | "On Leave";
  phone: string;
  email: string;
  currentAssignment?: string;
  avatarUrl: string;
}

export interface Inquiry {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  country: string;
  interestedTrip: string;
  travelDates: string;
  groupSize: number;
  message: string;
  createdAt: string;
  status: "New" | "Contacted" | "Quote Sent" | "Booked" | "Closed";
  notes?: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  readTime: string;
  status: BlogStatus;
  publishedDate: string;
  views: number;
  excerpt?: string;
  content?: string;
  image?: string;
}

export const mockDashboardMetrics = {
  totalRevenueUSD: 0,
  revenueChangePercent: 0,
  activeExpeditions: 0,
  climbersOnMountain: 0,
  pendingBookings: 0,
  pendingInquiries: 0,
  timsPermitsProcessing: 0,
};

export const mockBookings: Booking[] = [];
export const mockPackages: PackageItem[] = [];
export const mockGuides: Guide[] = [];
export const mockInquiries: Inquiry[] = [];
export const mockBlogArticles: BlogArticle[] = [];

export enum CategoryType {
  TREKKING = "Trekking",
  TOURS = "Tours",
  EXPEDITIONS = "Expeditions",
  BLOGS = "Blogs",
  MEDIA = "Media",
}

export enum CategoryStatus {
  ACTIVE = "Active",
  DRAFT = "Draft",
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description: string;
  itemCount: number;
  status: CategoryStatus;
}

export const mockCategories: CategoryItem[] = [];

export enum AssociateStatus {
  ACTIVE = "Active",
  DRAFT = "Draft",
}

export interface AssociateItem {
  id: string;
  name: string;
  role?: string;
  company?: string;
  image?: string;
  websiteUrl?: string;
  description?: string;
  category: string;
  status: AssociateStatus;
  order: number;
}

export enum FaqStatus {
  ACTIVE = "Active",
  DRAFT = "Draft",
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: FaqStatus;
  order: number;
}




