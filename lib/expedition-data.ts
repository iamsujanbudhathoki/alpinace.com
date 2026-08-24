import { ClimbingGrade, PackageRegion, PackageStatus, TripDifficulty, TripDepartureDate, TripPackageFile } from "./admin-data";
import { TripFaqItem, TripItineraryDay, TripReviewItem } from "./trek-data";

export { ClimbingGrade };

export interface ExpeditionItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  rating: number;
  reviewsCount?: number;
  image: string;
  shortDesc: string;
  durationDays: number;
  peakHeightM: number;
  maxAltitudeMeters?: number;
  climbingGrade: ClimbingGrade;
  difficulty?: TripDifficulty;
  sherpaGuideRatio?: string;
  oxygenRequired?: boolean;
  bestSeason: string;
  priceUSD: number;
  startEndLocation?: string;
  accommodation?: string;
  meals?: string;
  groupSizeRange?: string;
  permitsRequired?: string[];
  inclusionsText?: string;
  exclusionsText?: string;
  addonsText?: string;
  usefulInfoText?: string;
  departureDates?: TripDepartureDate[];
  galleryImages?: string[];
  mapImage?: string;
  packageFiles?: TripPackageFile[];
  itinerary?: TripItineraryDay[];
  faqs?: TripFaqItem[];
  categoryId?: string;
  categorySlug?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  status: PackageStatus;
  region: PackageRegion;
}

export const initialExpeditionsData: ExpeditionItem[] = [];
