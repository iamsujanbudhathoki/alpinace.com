import { PackageStatus, PackageRegion, ClimbingGrade, TripDifficulty } from "./admin-data";
import { TripFaqItem, TripReviewItem } from "./trek-data";

export { ClimbingGrade };

export interface ExpeditionItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  rating: number;
  reviewsCount: number;
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
  permitsRequired: string[];
  inclusionsText?: string;
  exclusionsText?: string;
  faqs?: TripFaqItem[];
  reviews?: TripReviewItem[];
  categoryId?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  status: PackageStatus;
  region: PackageRegion;
}

export const initialExpeditionsData: ExpeditionItem[] = [];
