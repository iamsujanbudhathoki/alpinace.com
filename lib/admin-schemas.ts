import { z } from "zod";
import {
  PACKAGE_REGIONS,
  PACKAGE_STATUSES,
  PACKAGE_TYPES,
  BOOKING_STATUSES,
  PAYMENT_STATUSES,
  PERMIT_STATUSES,
  BlogStatus,
  AssociateStatus,
  FaqStatus,
} from "./admin-data";
import { TREK_DIFFICULTIES } from "./trek-data";

export const trekSchema = z.object({
  title: z.string().min(3, "Trek title must be at least 3 characters"),
  categoryId: z.string().min(1, "Category is required"),
  region: z.enum(PACKAGE_REGIONS),
  durationDays: z.preprocess((val) => Number(val), z.number().min(1, "Duration must be at least 1 day")),
  maxAltitudeMeters: z.preprocess((val) => Number(val), z.number().min(1000, "Max altitude is required")),
  difficulty: z.enum(TREK_DIFFICULTIES),
  priceUSD: z.preprocess((val) => Number(val), z.number().min(100, "Price must be at least $100")),
  bestSeason: z.string().min(3, "Best season is required"),
  status: z.enum(PACKAGE_STATUSES),
  startEndLocation: z.string().optional(),
  accommodation: z.string().optional(),
  meals: z.string().optional(),
  groupSizeRange: z.string().optional(),
  permitsText: z.string().min(2, "At least one required permit is needed"),
  inclusionsText: z.string().optional(),
  exclusionsText: z.string().optional(),
  shortDesc: z.string().min(10, "Short description must be at least 10 characters"),
  image: z.string().min(5, "Cover image URL is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
});

export type TrekFormValues = z.infer<typeof trekSchema>;

export const tourSchema = z.object({
  title: z.string().min(3, "Tour title must be at least 3 characters"),
  categoryId: z.string().min(1, "Category is required"),
  region: z.enum(PACKAGE_REGIONS),
  durationDays: z.preprocess((val) => Number(val), z.number().min(1, "Duration must be at least 1 day")),
  maxAltitudeMeters: z.preprocess((val) => Number(val), z.number().min(100, "Max altitude is required")),
  priceUSD: z.preprocess((val) => Number(val), z.number().min(100, "Price must be at least $100")),
  status: z.enum(PACKAGE_STATUSES),
  startEndLocation: z.string().optional(),
  accommodation: z.string().optional(),
  meals: z.string().optional(),
  groupSizeRange: z.string().optional(),
  permitsText: z.string().min(2, "At least one inclusion/permit is required"),
  inclusionsText: z.string().optional(),
  exclusionsText: z.string().optional(),
  image: z.string().min(5, "Cover image URL is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
});

export type TourFormValues = z.infer<typeof tourSchema>;

export const expeditionSchema = z.object({
  title: z.string().min(3, "Expedition title must be at least 3 characters"),
  categoryId: z.string().min(1, "Category is required"),
  region: z.enum(PACKAGE_REGIONS),
  maxAltitudeMeters: z.preprocess((val) => Number(val), z.number().min(4000, "Summit elevation must be at least 4,000m")),
  durationDays: z.preprocess((val) => Number(val), z.number().min(5, "Duration must be at least 5 days")),
  priceUSD: z.preprocess((val) => Number(val), z.number().min(500, "Price must be at least $500")),
  status: z.enum(PACKAGE_STATUSES),
  startEndLocation: z.string().optional(),
  accommodation: z.string().optional(),
  meals: z.string().optional(),
  groupSizeRange: z.string().optional(),
  permitsText: z.string().min(2, "Mandatory permits are required"),
  inclusionsText: z.string().optional(),
  exclusionsText: z.string().optional(),
  image: z.string().min(5, "Cover image URL is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
});

export type ExpeditionFormValues = z.infer<typeof expeditionSchema>;

export const bookingSchema = z.object({
  guestName: z.string().min(2, "Guest name must be at least 2 characters"),
  guestEmail: z.string().email("Please enter a valid email address"),
  guestPhone: z.string().min(5, "Contact phone number is required"),
  country: z.string().min(2, "Country is required"),
  packageName: z.string().min(3, "Package name is required"),
  packageType: z.enum(PACKAGE_TYPES),
  startDate: z.string().min(4, "Start date is required"),
  endDate: z.string().min(4, "End date is required"),
  groupSize: z.preprocess((val) => Number(val), z.number().min(1, "Group size must be at least 1")),
  totalAmountUSD: z.preprocess((val) => Number(val), z.number().min(100, "Total amount must be at least $100")),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  bookingStatus: z.enum(BOOKING_STATUSES),
  assignedGuide: z.string().optional(),
  permitStatus: z.enum(PERMIT_STATUSES),
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
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  type: z.enum(["Trekking", "Tours", "Expeditions", "Blogs", "Media"]),
  description: z.string().min(5, "Description must be at least 5 characters"),
  status: z.enum(["Active", "Draft"]),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const blogSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(2, "Category is required"),
  readTime: z.string().default("5 min read"),
  status: z.nativeEnum(BlogStatus),
  publishedDate: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  image: z.string().min(5, "Featured image URL is required"),
});

export type BlogFormValues = z.infer<typeof blogSchema>;

export const associateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  role: z.string().optional(),
  company: z.string().optional(),
  image: z.string().optional(),
  websiteUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  description: z.string().optional(),
  category: z.string().default("Partner"),
  status: z.nativeEnum(AssociateStatus).default(AssociateStatus.ACTIVE),
  order: z.preprocess((val) => Number(val) || 0, z.number().default(0)),
});

export type AssociateFormValues = z.infer<typeof associateSchema>;

export const faqSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(10, "Answer must be at least 10 characters"),
  category: z.string().min(2, "Category is required").default("General"),
  status: z.nativeEnum(FaqStatus).default(FaqStatus.ACTIVE),
  order: z.preprocess((val) => Number(val) || 0, z.number().default(0)),
});

export type FaqFormValues = z.infer<typeof faqSchema>;




