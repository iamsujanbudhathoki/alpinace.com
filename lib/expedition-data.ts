export interface ExpeditionItem {
  id: string;
  title: string;
  slug: string;
  category: "EXPEDITION";
  rating: number;
  reviewsCount: number;
  image: string;
  shortDesc: string;
  durationDays: number;
  peakHeightM: number;
  climbingGrade: "Non-Technical Trekking Peak" | "Technical Alpine Grade" | "Extreme Technical Grade";
  bestSeason: string;
  priceUSD: number;
  permitsRequired: string[];
  status: "Active" | "Featured" | "Draft";
  region: "Everest" | "Annapurna" | "Manaslu" | "Khumbu";
}

export const initialExpeditionsData: ExpeditionItem[] = [];

