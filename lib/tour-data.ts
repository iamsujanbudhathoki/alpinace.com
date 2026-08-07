import { PackageStatus, PackageRegion } from "./admin-data";

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
  tourType: string;
  bestSeason: string;
  priceUSD: number;
  highlights: string[];
  status: PackageStatus;
  region: PackageRegion;
}

export const initialToursData: TourItem[] = [];

