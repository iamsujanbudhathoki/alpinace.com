import { PackageStatus, PackageRegion } from "./admin-data";

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
  climbingGrade: ClimbingGrade;
  bestSeason: string;
  priceUSD: number;
  permitsRequired: string[];
  status: PackageStatus;
  region: PackageRegion;
}

export const initialExpeditionsData: ExpeditionItem[] = [];

