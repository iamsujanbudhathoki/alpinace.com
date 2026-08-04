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

export const initialTreksData: TrekItem[] = [
  {
    id: "trk-101",
    title: "Everest Base Camp Luxury Lodge Trek",
    slug: "everest-base-camp-luxury-lodge",
    category: "TREKKING",
    rating: 4.9,
    reviewsCount: 48,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    shortDesc: "Experience the ultimate trek to the base of the world's highest peak, staying in handpicked premium luxury lodges with Sherpa legends.",
    durationDays: 14,
    difficulty: "Challenging Trek",
    bestSeason: "March - May & September - November",
    priceUSD: 2450,
    permitsRequired: ["Sagarmatha NP Permit", "Khumbu Pasang Lhamu Entry"],
    status: "Featured",
    region: "Everest",
  },
  {
    id: "trk-102",
    title: "Annapurna Panoramic Luxury Circuit",
    slug: "annapurna-panoramic-luxury-circuit",
    category: "TREKKING",
    rating: 4.8,
    reviewsCount: 35,
    image: "https://images.unsplash.com/photo-1585409677983-0f6c41ca913b?auto=format&fit=crop&w=1200&q=80",
    shortDesc: "Witness the complete diversity of the Himalayas, from lush tropical valleys and pine-covered ridges to the high alpine desert of Manang.",
    durationDays: 10,
    difficulty: "Moderate Trek",
    bestSeason: "March - May & September - November",
    priceUSD: 1980,
    permitsRequired: ["ACAP Permit", "TIMS Card"],
    status: "Active",
    region: "Annapurna",
  },
  {
    id: "trk-103",
    title: "Langtang Valley & Sacred Gosaikunda Lakes",
    slug: "langtang-valley-sacred-gosaikunda",
    category: "TREKKING",
    rating: 4.9,
    reviewsCount: 29,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    shortDesc: "Trek through pristine rhododendron forests, Tamang mountain villages, and glacier-fed alpine lakes near Kathmandu.",
    durationDays: 8,
    difficulty: "Moderate Trek",
    bestSeason: "March - May & September - December",
    priceUSD: 1450,
    permitsRequired: ["Langtang NP Permit", "TIMS Card"],
    status: "Active",
    region: "Langtang",
  },
  {
    id: "trk-104",
    title: "Manaslu Circuit Restricted Wilderness Trek",
    slug: "manaslu-circuit-wilderness",
    category: "TREKKING",
    rating: 5.0,
    reviewsCount: 22,
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    shortDesc: "Circumnavigate Mt. Manaslu (8,163m) across Larkya La Pass (5,106m) in an unspoiled restricted borderland.",
    durationDays: 16,
    difficulty: "Strenuous Trek",
    bestSeason: "March - May & September - November",
    priceUSD: 2850,
    permitsRequired: ["Manaslu Restricted Permit", "MCAP Permit", "ACAP Permit"],
    status: "Featured",
    region: "Manaslu",
  },
];
