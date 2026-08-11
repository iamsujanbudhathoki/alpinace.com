import { PackageStatus, PackageRegion } from "./admin-data";

export const TREK_DIFFICULTIES = ["Moderate Trek", "Challenging Trek", "Strenuous Trek"] as const;
export type TrekDifficulty = typeof TREK_DIFFICULTIES[number];

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
  difficulty: TrekDifficulty;
  bestSeason: string;
  priceUSD: number;
  permitsRequired: string[];
  status: PackageStatus;
  region: PackageRegion;
}

export const initialTreksData: TrekItem[] = [];

