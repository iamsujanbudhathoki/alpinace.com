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
  difficulty: "Moderate Trek" | "Challenging Trek" | "Strenuous Trek";
  bestSeason: string;
  priceUSD: number;
  permitsRequired: string[];
  status: "Active" | "Featured" | "Draft";
  region: "Everest" | "Annapurna" | "Langtang" | "Manaslu";
}

export const initialTreksData: TrekItem[] = [];

