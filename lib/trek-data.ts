import { PackageStatus, PackageRegion, TripDifficulty } from "./admin-data";

export type TrekDifficulty = TripDifficulty;

export interface TripItineraryDetail {
  label: string;
  value: string;
}

export interface TripItineraryDay {
  day: number;
  title: string;
  description: string;
  maxAltitude?: string;
  accommodation?: string;
  meals?: string;
  details?: TripItineraryDetail[];
  [key: string]: any;
}

export interface TripFaqItem {
  question: string;
  answer: string;
}

export interface TripReviewItem {
  id?: string;
  author: string;
  country: string;
  date?: string;
  rating: number;
  avatar?: string;
  content: string;
}

export interface TrekItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  categoryId?: string;
  rating: number;
  reviewsCount: number;
  image: string;
  shortDesc: string;
  durationDays: number;
  maxAltitudeMeters?: number;
  difficulty: TripDifficulty;
  bestSeason: string;
  priceUSD: number;
  startEndLocation?: string;
  accommodation?: string;
  meals?: string;
  groupSizeRange?: string;
  permitsRequired: string[];
  inclusionsText?: string;
  exclusionsText?: string;
  itinerary?: TripItineraryDay[];
  faqs?: TripFaqItem[];
  reviews?: TripReviewItem[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  status: PackageStatus;
  region: PackageRegion;
}

export const initialTreksData: TrekItem[] = [];
