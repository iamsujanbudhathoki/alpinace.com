import { z } from "zod";
import {
  TripDifficulty,
  PackageStatus,
  TourType,
  ClimbingGrade,
  BookingPackageType,
  BookingPaymentStatus,
  BookingStatus,
  BookingPermitStatus,
  InquiryStatus,
  InquiryType,
  BlogStatus,
  FaqStatus,
  CategoryType,
  CategoryStatus,
} from "./admin-data";

export const itineraryDaySchema = z.object({
  day: z.preprocess((val) => Number(val) || 1, z.number().min(1, "Day number must be at least 1")),
  title: z.string().trim().min(1, "Day title is required"),
  description: z.string().trim().min(1, "Day description is required"),
  maxAltitude: z.string().optional(),
  accommodation: z.string().optional(),
  meals: z.string().optional(),
  details: z
    .array(
      z.object({
        label: z.string().default(""),
        value: z.string().default(""),
      })
    )
    .optional(),
});

export const departureDateSchema = z.object({
  id: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  priceUSD: z.preprocess((val) => (val !== undefined && val !== "" ? Number(val) : undefined), z.number().optional()),
  status: z.string().optional(),
  seatsAvailable: z.preprocess((val) => (val !== undefined && val !== "" ? Number(val) : undefined), z.number().optional()),
  notes: z.string().optional(),
});

export const packageFileSchema = z.object({
  id: z.string().optional(),
  mediaId: z.string().optional(),
  title: z.string().min(1, "File title is required"),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.string().optional(),
  fileType: z.string().optional(),
  uploadedAt: z.string().optional(),
});

export const trekSchema = z.object({
  title: z.string().min(1, "Trek title is required"),
  categoryId: z.string().trim().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  activity: z.string().optional(),
  durationDays: z.preprocess((val) => Number(val), z.number().min(1, "Duration must be at least 1 day")),
  maxAltitudeMeters: z.preprocess((val) => (val !== undefined && val !== "" ? Number(val) : undefined), z.number().optional()),
  difficulty: z.nativeEnum(TripDifficulty).optional(),
  priceUSD: z.preprocess((val) => Number(val), z.number().min(0, "Price cannot be negative")),
  bestSeason: z.string().optional(),
  status: z.nativeEnum(PackageStatus).default(PackageStatus.ACTIVE),
  startEndLocation: z.string().optional(),
  accommodation: z.string().optional(),
  meals: z.string().optional(),
  groupSizeRange: z.string().optional(),
  permitsText: z.string().optional(),
  inclusionsText: z.string().optional(),
  exclusionsText: z.string().optional(),
  shortDesc: z.string().optional(),
  image: z.string().optional(),
  coverMediaId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  itinerary: z.array(itineraryDaySchema).optional(),
  faqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
  reviews: z
    .array(
      z.object({
        id: z.string().optional(),
        author: z.string(),
        country: z.string(),
        date: z.string().optional(),
        rating: z.number(),
        avatar: z.string().optional(),
        content: z.string(),
      })
    )
    .optional(),
  addonsText: z.string().optional(),
  usefulInfoText: z.string().optional(),
  departureDates: z.array(departureDateSchema).optional(),
  galleryImages: z.array(z.string()).optional(),
  galleryMediaIds: z.array(z.string()).optional(),
  mapImage: z.string().optional(),
  mapMediaId: z.string().optional(),
  packageFiles: z.array(packageFileSchema).optional(),
});

export type TrekFormValues = z.infer<typeof trekSchema>;

export const tourSchema = z.object({
  title: z.string().min(1, "Tour title is required"),
  categoryId: z.string().trim().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  activity: z.string().optional(),
  tourType: z.nativeEnum(TourType).optional(),
  transportation: z.string().optional(),
  difficulty: z.nativeEnum(TripDifficulty).optional(),
  bestSeason: z.string().optional(),
  durationDays: z.preprocess((val) => Number(val), z.number().min(1, "Duration must be at least 1 day")),
  maxAltitudeMeters: z.preprocess((val) => (val !== undefined && val !== "" ? Number(val) : undefined), z.number().optional()),
  priceUSD: z.preprocess((val) => Number(val), z.number().min(0, "Price cannot be negative")),
  status: z.nativeEnum(PackageStatus).default(PackageStatus.ACTIVE),
  startEndLocation: z.string().optional(),
  accommodation: z.string().optional(),
  meals: z.string().optional(),
  groupSizeRange: z.string().optional(),
  permitsText: z.string().optional(),
  inclusionsText: z.string().optional(),
  exclusionsText: z.string().optional(),
  shortDesc: z.string().optional(),
  image: z.string().optional(),
  coverMediaId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  itinerary: z.array(itineraryDaySchema).optional(),
  faqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
  reviews: z
    .array(
      z.object({
        id: z.string().optional(),
        author: z.string(),
        country: z.string(),
        date: z.string().optional(),
        rating: z.number(),
        avatar: z.string().optional(),
        content: z.string(),
      })
    )
    .optional(),
  addonsText: z.string().optional(),
  usefulInfoText: z.string().optional(),
  departureDates: z.array(departureDateSchema).optional(),
  galleryImages: z.array(z.string()).optional(),
  galleryMediaIds: z.array(z.string()).optional(),
  mapImage: z.string().optional(),
  mapMediaId: z.string().optional(),
  packageFiles: z.array(packageFileSchema).optional(),
});

export type TourFormValues = z.infer<typeof tourSchema>;

export const expeditionSchema = z.object({
  title: z.string().min(1, "Expedition title is required"),
  categoryId: z.string().trim().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  activity: z.string().optional(),
  peakHeightM: z.preprocess((val) => (val !== undefined && val !== "" ? Number(val) : undefined), z.number().optional()),
  maxAltitudeMeters: z.preprocess((val) => (val !== undefined && val !== "" ? Number(val) : undefined), z.number().optional()),
  climbingGrade: z.nativeEnum(ClimbingGrade).optional(),
  sherpaGuideRatio: z.string().optional(),
  oxygenRequired: z.boolean().optional(),
  difficulty: z.nativeEnum(TripDifficulty).optional(),
  bestSeason: z.string().optional(),
  durationDays: z.preprocess((val) => Number(val), z.number().min(1, "Duration must be at least 1 day")),
  priceUSD: z.preprocess((val) => Number(val), z.number().min(0, "Price cannot be negative")),
  status: z.nativeEnum(PackageStatus).default(PackageStatus.ACTIVE),
  startEndLocation: z.string().optional(),
  accommodation: z.string().optional(),
  meals: z.string().optional(),
  groupSizeRange: z.string().optional(),
  permitsText: z.string().optional(),
  inclusionsText: z.string().optional(),
  exclusionsText: z.string().optional(),
  shortDesc: z.string().optional(),
  image: z.string().optional(),
  coverMediaId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  itinerary: z.array(itineraryDaySchema).optional(),
  faqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
  reviews: z
    .array(
      z.object({
        id: z.string().optional(),
        author: z.string(),
        country: z.string(),
        date: z.string().optional(),
        rating: z.number(),
        avatar: z.string().optional(),
        content: z.string(),
      })
    )
    .optional(),
  addonsText: z.string().optional(),
  usefulInfoText: z.string().optional(),
  departureDates: z.array(departureDateSchema).optional(),
  galleryImages: z.array(z.string()).optional(),
  galleryMediaIds: z.array(z.string()).optional(),
  mapImage: z.string().optional(),
  mapMediaId: z.string().optional(),
  packageFiles: z.array(packageFileSchema).optional(),
});

export type ExpeditionFormValues = z.infer<typeof expeditionSchema>;

export const bookingSchema = z.object({
  guestName: z.string().min(2, "Guest name must be at least 2 characters"),
  guestEmail: z.string().email("Please enter a valid email address"),
  guestPhone: z.string().min(5, "Contact phone number is required"),
  country: z.string().min(2, "Country is required"),
  packageName: z.string().min(1, "Please select an item to reserve"),
  packageType: z.nativeEnum(BookingPackageType),
  startDate: z.string().min(4, "Start date is required"),
  endDate: z.string().min(4, "End date is required"),
  groupSize: z.preprocess((val) => Number(val) || 1, z.number().min(1, "Group size must be at least 1")),
  totalAmountUSD: z.preprocess((val) => (val !== undefined && val !== "" ? Number(val) : 0), z.number().min(0, "Total amount cannot be negative")),
  paymentStatus: z.nativeEnum(BookingPaymentStatus),
  bookingStatus: z.nativeEnum(BookingStatus),
  assignedGuide: z.string().optional(),
  permitStatus: z.nativeEnum(BookingPermitStatus),
  specialRequests: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;

export const inquirySchema = z.object({
  guestName: z.string().min(2, "Guest name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(5, "Phone number is required"),
  country: z.string().min(2, "Country is required"),
  interestedTrip: z.string().min(3, "Interested trip/expedition is required"),
  travelDates: z.string().min(2, "Travel dates are required"),
  groupSize: z.preprocess((val) => Number(val), z.number().min(1, "Group size must be at least 1")),
  message: z.string().min(5, "Message must be at least 5 characters"),
  status: z.nativeEnum(InquiryStatus).optional(),
  type: z.nativeEnum(InquiryType).optional(),
  notes: z.string().optional(),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;


export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z
    .string()
    .min(1, "Category slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens (e.g. everest-region)"
    ),
  type: z.nativeEnum(CategoryType),
  description: z.string().min(5, "Description must be at least 5 characters"),
  status: z.nativeEnum(CategoryStatus).default(CategoryStatus.ACTIVE),
  showInMenu: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  menuOrder: z.number().optional(),
  image: z.string().optional(),
  mediaId: z.string().optional(),
  parentId: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const blogSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(2, "Category is required"),
  categoryId: z.string().optional(),
  readTime: z.string().default("5 min read"),
  status: z.nativeEnum(BlogStatus),
  publishedDate: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  image: z.string().optional(),
  coverMediaId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
});

export type BlogFormValues = z.infer<typeof blogSchema>;


export const faqSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(10, "Answer must be at least 10 characters"),
  category: z.string().min(2, "Category is required").default("General"),
  status: z.nativeEnum(FaqStatus).default(FaqStatus.ACTIVE),
  order: z.preprocess((val) => Number(val) || 0, z.number().default(0)),
});

export type FaqFormValues = z.infer<typeof faqSchema>;

export function isRichTextEmpty(html?: string): boolean {
  if (!html) return true;
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length === 0;
}

export const aboutUsSchema = z.object({
  heroTitle: z.string().trim().min(3, "Hero heading must be at least 3 characters"),
  heroSubtitle: z.string().optional(),
  heroImage: z.string().optional(),
  heroMediaId: z.string().optional(),
  storyTitle: z.string().optional(),
  storyContent: z.string().optional(),
  storyImage: z.string().optional(),
  storyMediaId: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  values: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Commitment title is required"),
        desc: z.string().trim().min(1, "Commitment description is required"),
      })
    )
    .optional(),
  stats: z
    .array(
      z.object({
        number: z.string().trim().min(1, "Stat number is required"),
        label: z.string().trim().min(1, "Stat label is required"),
      })
    )
    .optional(),
  status: z.enum(["published", "draft"]).default("published"),

  // Essential Core Meta SEO Fields
  metaTitle: z
    .string()
    .max(100, "Meta title must be 100 characters or fewer")
    .optional(),
  metaDescription: z
    .string()
    .max(300, "Meta description must be 300 characters or fewer")
    .optional(),
  metaKeywords: z.string().optional(),
});

export type AboutUsFormValues = z.infer<typeof aboutUsSchema>;

