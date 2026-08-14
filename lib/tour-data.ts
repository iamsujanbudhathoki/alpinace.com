import { PackageStatus, PackageRegion, TourType, TripDifficulty } from "./admin-data";
import { TripFaqItem, TripReviewItem } from "./trek-data";

export interface TourItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  rating: number;
  reviewsCount: number;
  image: string;
  shortDesc: string;
  durationDays: number;
  maxAltitudeMeters?: number;
  tourType: TourType;
  difficulty?: TripDifficulty;
  bestSeason: string;
  priceUSD: number;
  transportation?: string;
  startEndLocation?: string;
  accommodation?: string;
  meals?: string;
  groupSizeRange?: string;
  highlights: string[];
  permitsRequired?: string[];
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

export const initialToursData: TourItem[] = [];
