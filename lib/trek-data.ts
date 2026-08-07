import { PackageStatus, PackageRegion } from "./admin-data";

export type TrekDifficulty = "Moderate Trek" | "Challenging Trek" | "Strenuous Trek";

export interface TrekItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  rating: number;
  reviewsCount: number;
  image: string;
  shortDesc: string;
  durationDays: number;
  difficulty: TrekDifficulty;
  bestSeason: string;
  priceUSD: number;
  permitsRequired: string[];
  status: PackageStatus;
  region: PackageRegion;
}

export const initialTreksData: TrekItem[] = [];

