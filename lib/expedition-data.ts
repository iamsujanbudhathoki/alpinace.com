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

export const initialExpeditionsData: ExpeditionItem[] = [
  {
    id: "exp-301",
    title: "Island Peak (Imja Tse) Climbing Expedition",
    slug: "island-peak-imja-tse-expedition",
    category: "EXPEDITION",
    rating: 4.8,
    reviewsCount: 37,
    image: "https://images.unsplash.com/photo-1516482498816-ba38689e1c14?auto=format&fit=crop&w=1200&q=80",
    shortDesc: "An ideal introductory Himalayan summit, combining the classic Everest Base Camp approach with a guided technical ascent of Island Peak.",
    durationDays: 18,
    peakHeightM: 6189,
    climbingGrade: "Non-Technical Trekking Peak",
    bestSeason: "March - May & September - November",
    priceUSD: 3450,
    permitsRequired: ["Sagarmatha NP Permit", "Island Peak Climbing Permit", "Khumbu Pasang Lhamu Entry"],
    status: "Featured",
    region: "Everest",
  },
  {
    id: "exp-302",
    title: "Ama Dablam Technical Climbing Expedition",
    slug: "ama-dablam-technical-expedition",
    category: "EXPEDITION",
    rating: 4.9,
    reviewsCount: 24,
    image: "https://images.unsplash.com/photo-1544198365-f5d60949e75f?auto=format&fit=crop&w=1200&q=80",
    shortDesc: "Climb one of the most iconic peaks on Earth, with fixed camps at 5,700m, 6,000m, and 6,300m under IFMGA-certified expedition leadership.",
    durationDays: 26,
    peakHeightM: 6812,
    climbingGrade: "Technical Alpine Grade",
    bestSeason: "March - May & September - November",
    priceUSD: 8900,
    permitsRequired: ["Ama Dablam Climbing Permit", "Sagarmatha NP Permit", "Liaison Officer Fee"],
    status: "Active",
    region: "Everest",
  },
  {
    id: "exp-303",
    title: "Manaslu Summit Expedition (8,163m)",
    slug: "manaslu-summit-expedition",
    category: "EXPEDITION",
    rating: 5.0,
    reviewsCount: 15,
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    shortDesc: "Summit the world's eighth-highest mountain via the standard Northeast Face route, fully supported with Sherpa climbing crew and bottled oxygen.",
    durationDays: 42,
    peakHeightM: 8163,
    climbingGrade: "Extreme Technical Grade",
    bestSeason: "September - October",
    priceUSD: 16500,
    permitsRequired: ["Manaslu Restricted Permit", "MCAP Permit", "ACAP Permit", "Summit Climbing Permit"],
    status: "Featured",
    region: "Manaslu",
  },
  {
    id: "exp-304",
    title: "Mount Everest Summit Expedition (8,849m)",
    slug: "everest-summit-expedition",
    category: "EXPEDITION",
    rating: 5.0,
    reviewsCount: 11,
    image: "https://images.unsplash.com/photo-1583870908408-3f9c6f8a9e0f?auto=format&fit=crop&w=1200&q=80",
    shortDesc: "The ultimate mountaineering achievement. A full South Col expedition with 1:1 Sherpa support, bottled oxygen, and basecamp luxury medical facilities.",
    durationDays: 63,
    peakHeightM: 8849,
    climbingGrade: "Extreme Technical Grade",
    bestSeason: "April - May",
    priceUSD: 48500,
    permitsRequired: ["Everest Summit Permit", "Sagarmatha NP Permit", "Khumbu Icefall Route Fee", "Liaison Officer Fee"],
    status: "Featured",
    region: "Everest",
  },
];
