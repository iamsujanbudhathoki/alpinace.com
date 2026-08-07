export enum PackageStatus {
  ACTIVE = "Active",
  DRAFT = "Draft",
  FEATURED = "Featured",
}

export enum PackageCategoryType {
  TREKKING = "Trekking",
  EXPEDITION = "Expedition",
  TOUR = "Tour",
}

export enum BookingStatus {
  CONFIRMED = "Confirmed",
  IN_REVIEW = "In Review",
  ACTIVE_TREK = "Active Trek",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export enum PaymentStatus {
  PAID = "Paid",
  DEPOSIT_PAID = "Deposit Paid",
  PENDING = "Pending",
  REFUNDED = "Refunded",
}

export enum PermitStatus {
  ISSUED = "Issued",
  PROCESSING = "Processing",
  PENDING_DOCUMENT = "Pending Document",
}

export interface Booking {
  id: string;
  reference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  country: string;
  packageName: string;
  packageType: "Trekking" | "Expedition" | "Tour";
  startDate: string;
  endDate: string;
  groupSize: number;
  totalAmountUSD: number;
  paymentStatus: "Paid" | "Deposit Paid" | "Pending" | "Refunded";
  bookingStatus: "Confirmed" | "In Review" | "Active Trek" | "Completed" | "Cancelled";
  assignedGuide?: string;
  permitStatus: "Issued" | "Processing" | "Pending Document";
  specialRequests?: string;
}

export interface PackageItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  region: "Everest" | "Annapurna" | "Langtang" | "Manaslu" | "Kathmandu & Pokhara";
  durationDays: number;
  maxAltitudeMeters: number;
  difficulty: "Easy" | "Moderate" | "Challenging" | "Extreme (8000m+)";
  priceUSD: number;
  status: "Active" | "Draft" | "Featured";
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


