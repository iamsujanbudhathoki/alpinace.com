export type PackageStatus = "Active" | "Draft" | "Featured";
export type PackageCategoryType = "Trekking" | "Expedition" | "Tour";
export type BookingStatus = "Confirmed" | "In Review" | "Active Trek" | "Completed" | "Cancelled";
export type PaymentStatus = "Paid" | "Deposit Paid" | "Pending" | "Refunded";
export type PermitStatus = "Issued" | "Processing" | "Pending Document";
export type PackageRegion = "Everest" | "Annapurna" | "Langtang" | "Manaslu" | "Kathmandu & Pokhara" | "Khumbu";
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
  category: "Expedition Prep" | "Trekking Guides" | "Sherpa Culture" | "Gear & Equipment";
  author: string;
  readTime: string;
  status: "Published" | "Draft" | "Archived";
  publishedDate: string;
  views: number;
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

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  type: "Trekking" | "Tours" | "Expeditions" | "Blogs" | "Media";
  description: string;
  itemCount: number;
  status: "Active" | "Draft";
}

export const mockCategories: CategoryItem[] = [];


