import { PackageStatus } from "./admin-data";

export enum TrekDifficulty {
  MODERATE = "Moderate Trek",
  CHALLENGING = "Challenging Trek",
  STRENUOUS = "Strenuous Trek",
}

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
  difficulty: TrekDifficulty | string;
  bestSeason: string;
  priceUSD: number;
  permitsRequired: string[];
  status: PackageStatus | string;
  region: "Everest" | "Annapurna" | "Langtang" | "Manaslu" | string;
}

export const initialTreksData: TrekItem[] = [];

