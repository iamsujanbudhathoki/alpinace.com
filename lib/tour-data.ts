export interface TourItem {
  id: string;
  title: string;
  slug: string;
  category: "TOUR";
  rating: number;
  reviewsCount: number;
  image: string;
  shortDesc: string;
  durationDays: number;
  tourType: string;
  bestSeason: string;
  priceUSD: number;
  highlights: string[];
  status: string;
  region: string;
}

export const initialToursData: TourItem[] = [];

