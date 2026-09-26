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

import { COUNTRY_LIST } from "./country-list";
import { GroupPricingTier } from "./pricing-util";

export const FILTER_ALL = "All";

export const PACKAGE_COUNTRIES = COUNTRY_LIST.map((c) => c.name);

export type PackageCountry = string;

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

export enum AdminRole {
  ADMIN = "Admin",
}

export enum PackageStatus {
  ACTIVE = "active",
  DRAFT = "draft",
}


export {
  PackageStatus as TrekStatus,
  PackageStatus as TourStatus,
  PackageStatus as ExpeditionStatus,
};

export type { GroupPricingTier } from "./pricing-util";

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
  PENDING = "pending",
  IN_REVIEW = "in_review",
  ACTIVE = "active",
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

export enum ActivityStatus {
  ACTIVE = "active",
  DRAFT = "draft",
}

export interface ActivityItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: ActivityStatus;
  isFeatured: boolean;
  menuOrder: number;
  mediaId?: string | null;
  image?: string | null;
  tripCount?: number;
  createdAt?: string;
  updatedAt?: string;
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

export enum TeamMemberStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum TestimonialStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum AboutUsStatus {
  PUBLISHED = "published",
  DRAFT = "draft",
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

export enum BookingStepStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export { BookingStepStatus as InquiryStepStatus };

export interface BookingStep {
  status: BookingStepStatus;
  message: string;
}

export interface InquiryStep {
  status: BookingStepStatus;
  message: string;
}

export interface InquiryWorkflowPhase {
  step: number;
  label: string;
  title: string;
  description: string;
}

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
  steps: BookingStep[];
  assignedGuide?: string;
  permitStatus: BookingPermitStatus;
  specialRequests?: string;
}

export interface BookingWorkflowPhase {
  step: number;
  label: string;
  title: string;
  description: string;
}

export enum DepartureDateStatus {
  GUARANTEED = "guaranteed",
  AVAILABLE = "available",
  LIMITED = "limited",
  FULL = "full",
}

export interface TripDepartureDate {
  id?: string;
  startDate: string;
  endDate: string;
  priceUSD?: number;
  status?: DepartureDateStatus | string;
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
  subcategoryId?: string;
  activityIds?: string[];
  categorySlug?: string;
  region: PackageRegion;
  durationDays: number;
  maxAltitudeMeters: number;
  difficulty: TripDifficulty;
  priceUSD: number;
  status: PackageStatus;
  isFeatured?: boolean;
  isPopular?: boolean;
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
  groupPricingEnabled?: boolean;
  groupPricing?: GroupPricingTier[];
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
  steps: InquiryStep[];
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
  isFeatured?: boolean;
  menuOrder?: number;
  image?: string | null;
  mediaId?: string | null;
  parentId?: string | null;
  children?: CategoryItem[];
}

export interface MenuSubcategoryDto {
  id: string;
  name: string;
  slug: string;
  menuOrder: number;
  showInMenu: boolean;
  status: CategoryStatus;
  type: CategoryType;
  parentId: string;
  itemCount?: number;
}

export interface MenuCategoryDto {
  id: string;
  name: string;
  slug: string;
  menuOrder: number;
  showInMenu: boolean;
  status: CategoryStatus;
  type: CategoryType;
  parentId: string | null;
  itemCount?: number;
  subcategories: MenuSubcategoryDto[];
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
