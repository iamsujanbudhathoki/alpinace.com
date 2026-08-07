import { PackageStatus } from "./admin-data";

export enum ClimbingGrade {
  NON_TECHNICAL = "Non-Technical Trekking Peak",
  TECHNICAL_ALPINE = "Technical Alpine Grade",
  EXTREME_TECHNICAL = "Extreme Technical Grade",
}

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
  climbingGrade: ClimbingGrade | string;
  bestSeason: string;
  priceUSD: number;
  permitsRequired: string[];
  status: PackageStatus | string;
  region: "Everest" | "Annapurna" | "Manaslu" | "Khumbu" | string;
}

export const initialExpeditionsData: ExpeditionItem[] = [];

