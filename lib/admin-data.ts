export const PACKAGE_REGIONS = [
  "Everest",
  "Annapurna",
  "Langtang",
  "Manaslu",
  "Kathmandu & Pokhara",
  "Khumbu",
] as const;

export type PackageRegion = (typeof PACKAGE_REGIONS)[number] | string;

export enum PackageSortOption {
  RATING = "rating",
  PRICE_ASC = "priceAsc",
  PRICE_DESC = "priceDesc",
  DURATION = "duration",
}

export const FILTER_ALL = "All";

export const PACKAGE_COUNTRIES = [
  "Nepal",
  "Tibet",
  "Bhutan",
  "India",
  "Pakistan",
] as const;

export type PackageCountry = (typeof PACKAGE_COUNTRIES)[number] | string;

export enum TripDifficulty {
  EASY = "easy",
  MODERATE = "moderate",
  CHALLENGING = "challenging",
  STRENUOUS = "strenuous",
  EXTREME = "extreme",
}

export enum TripActivity {
  TREKKING_HIKING = "Trekking/Hiking",
  CULTURAL_SIGHTSEEING = "Cultural Sightseeing",
  PEAK_CLIMBING = "Peak Climbing",
  HELI_TREK_TOUR = "Heli Trek & Tour",
  WILDLIFE_SAFARI = "Wildlife Safari",
  OTHER = "Other",
}

export enum PackageStatus {
  ACTIVE = "active",
  FEATURED = "featured",
  DRAFT = "draft",
}

export {
  PackageStatus as TrekStatus,
  PackageStatus as TourStatus,
  PackageStatus as ExpeditionStatus,
};

export enum TourType {
  CULTURAL_HERITAGE = "cultural_heritage",
  LUXURY_WELLNESS = "luxury_wellness",
  WILDLIFE_SAFARI = "wildlife_safari",
  HELICOPTER_TOUR = "helicopter_tour",
  DAY_TOUR = "day_tour",
  OTHER = "other",
}

export enum ClimbingGrade {
  NON_TECHNICAL_TREKKING_PEAK = "Non-Technical Trekking Peak",
  TECHNICAL_ALPINE_GRADE = "Technical Alpine Grade",
  EXTREME_TECHNICAL_GRADE = "Extreme Technical Grade",
}

export enum BookingPackageType {
  TREKKING = "trekking",
  EXPEDITION = "expedition",
  TOUR = "tour",
}

export enum InquiryType {
  TREKKING = "Trekking",
  TOUR = "Tour",
  EXPEDITION = "Expedition",
  GENERAL = "General",
}

export enum BookingPaymentStatus {
  PAID = "paid",
  DEPOSIT_PAID = "deposit_paid",
  PENDING = "pending",
  REFUNDED = "refunded",
}

export enum BookingStatus {
  CONFIRMED = "confirmed",
  IN_REVIEW = "in_review",
  ACTIVE_TREK = "active_trek",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum BookingPermitStatus {
  ISSUED = "issued",
  PROCESSING = "processing",
  PENDING_DOCUMENT = "pending_document",
}

export enum CategoryType {
  TREKKING = "trekking",
  TOURS = "tours",
  EXPEDITIONS = "expeditions",
  BLOGS = "blogs",
  MEDIA = "media",
}

export enum CategoryStatus {
  ACTIVE = "active",
  DRAFT = "draft",
}

export enum FaqStatus {
  ACTIVE = "active",
  DRAFT = "draft",
}

export enum BlogStatus {
  PUBLISHED = "published",
  DRAFT = "draft",
  ARCHIVED = "archived",
}

export enum InquiryStatus {
  NEW = "New",
  CONTACTED = "Contacted",
  QUOTE_SENT = "Quote Sent",
  BOOKED = "Booked",
  CLOSED = "Closed",
}

export enum NotificationType {
  INQUIRY = "inquiry",
  BOOKING = "booking",
  QUOTE = "quote",
  SYSTEM = "system",
}

// Aliases for compatibility
export type PackageCategoryType = BookingPackageType;
export type PaymentStatus = BookingPaymentStatus;
export type PermitStatus = BookingPermitStatus;
export type PackageDifficulty = TripDifficulty;

export interface Booking {
  id: string;
  reference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  country: string;
  packageName: string;
  packageType: BookingPackageType;
  startDate: string;
  endDate: string;
  groupSize: number;
  totalAmountUSD: number;
  paymentStatus: BookingPaymentStatus;
  bookingStatus: BookingStatus;
  assignedGuide?: string;
  permitStatus: BookingPermitStatus;
  specialRequests?: string;
}

export interface TripDepartureDate {
  id?: string;
  startDate: string;
  endDate: string;
  priceUSD?: number;
  status?: string;
  seatsAvailable?: number;
  notes?: string;
}

export interface TripPackageFile {
  id?: string;
  mediaId?: string;
  title: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  uploadedAt?: string;
}

export interface PackageItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  categoryId?: string;
  categorySlug?: string;
  region: PackageRegion;
  durationDays: number;
  maxAltitudeMeters: number;
  difficulty: TripDifficulty;
  priceUSD: number;
  status: PackageStatus;
  totalBookings: number;
  rating: number;
  reviewsCount?: number;
  image?: string;
  coverMediaId?: string;
  country?: string;
  activity?: string;
  shortDesc?: string;
  bestSeason?: string;
  startEndLocation?: string;
  accommodation?: string;
  meals?: string;
  groupSizeRange?: string;
  inclusionsText?: string;
  exclusionsText?: string;
  addonsText?: string;
  usefulInfoText?: string;
  departureDates?: TripDepartureDate[];
  galleryImages?: string[];
  galleryMediaIds?: string[];
  mapImage?: string;
  mapMediaId?: string;
  packageFiles?: TripPackageFile[];
  itinerary?: Array<{
    day: number;
    title: string;
    description: string;
    maxAltitude?: string;
    accommodation?: string;
    meals?: string;
    details?: Array<{ label: string; value: string }>;
    [key: string]: any;
  }>;
  tourType?: TourType;
  transportation?: string;
  peakHeightM?: number;
  climbingGrade?: ClimbingGrade;
  sherpaGuideRatio?: string;
  oxygenRequired?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  faqs?: Array<{ question: string; answer: string }>;
  reviews?: Array<{
    id?: string;
    author: string;
    country: string;
    date?: string;
    rating: number;
    avatar?: string;
    content: string;
  }>;
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
  status: InquiryStatus;
  type?: InquiryType;
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
  coverMediaId?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description: string;
  itemCount: number;
  status: CategoryStatus;
  showInMenu?: boolean;
  menuOrder?: number;
  image?: string | null;
  mediaId?: string | null;
  parentId?: string | null;
  children?: CategoryItem[];
}


export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: FaqStatus;
  order: number;
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
export const mockInquiries: Inquiry[] = [];
export const mockBlogArticles: BlogArticle[] = [];
export const mockCategories: CategoryItem[] = [];
