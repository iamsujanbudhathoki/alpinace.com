import { TripDifficulty, PackageStatus } from "./admin-data";

export interface TravelPackage {
  id: string;
  title: string;
  slug: string;
  category: string;
  region: string;
  durationDays: number;
  maxAltitudeMeters: number;
  difficulty: TripDifficulty;
  priceUSD: number;
  rating: number;
  reviewsCount: number;
  image: string;
  shortDesc: string;
  status: PackageStatus;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  country: string;
  tripName: string;
  content: string;
  avatar: string;
  rating: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  readTime: string;
  excerpt?: string;
  content?: string;
  image?: string;
  author?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

export const HOME_STATS: { number: string; label: string; desc: string }[] = [];
export const TRAVEL_PACKAGES: TravelPackage[] = [];
export const TESTIMONIALS: Testimonial[] = [];



