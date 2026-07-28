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
  tourType: "Cultural Heritage" | "Wildlife Safari" | "Wellness Retreat" | "Scenic & Adventure";
  bestSeason: string;
  priceUSD: number;
  highlights: string[];
  status: "Active" | "Featured" | "Draft";
  region: "Kathmandu Valley" | "Pokhara" | "Chitwan" | "Everest Region";
}

export const initialToursData: TourItem[] = [
  {
    id: "tur-201",
    title: "Kathmandu Valley Royal Heritage & Durbar Squares Tour",
    slug: "kathmandu-valley-royal-heritage",
    category: "TOUR",
    rating: 4.9,
    reviewsCount: 41,
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80",
    shortDesc: "Explore medieval durbar squares, ancient pagoda palaces, and sacred stupas with private historians, staying in Nepal's legendary heritage hotels.",
    durationDays: 5,
    tourType: "Cultural Heritage",
    bestSeason: "Year-round, best October - April",
    priceUSD: 1650,
    highlights: ["Dwarika's Heritage Hotel Stay", "Private Art Historian Guide", "Kathmandu, Patan & Bhaktapur Durbar Squares", "Boudhanath & Swayambhunath Stupas"],
    status: "Featured",
    region: "Kathmandu Valley",
  },
  {
    id: "tur-202",
    title: "Pokhara Lakeside Wellness & Serenity Retreat",
    slug: "pokhara-lakeside-wellness-retreat",
    category: "TOUR",
    rating: 4.8,
    reviewsCount: 33,
    image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc32?auto=format&fit=crop&w=1200&q=80",
    shortDesc: "Unwind beside Phewa Lake with private sunrise cruises, mountain-view yoga sessions, and full spa treatments framed by the Annapurna range.",
    durationDays: 4,
    tourType: "Wellness Retreat",
    bestSeason: "September - May",
    priceUSD: 1280,
    highlights: ["Private Lakeside Cruise at Sunrise", "Daily Spa & Ayurvedic Treatments", "Sarangkot Annapurna Viewpoint", "Resident Wellness Coach"],
    status: "Active",
    region: "Pokhara",
  },
  {
    id: "tur-203",
    title: "Chitwan Luxury Wildlife Safari",
    slug: "chitwan-luxury-wildlife-safari",
    category: "TOUR",
    rating: 4.9,
    reviewsCount: 27,
    image: "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?auto=format&fit=crop&w=1200&q=80",
    shortDesc: "Track one-horned rhinos and Bengal tigers across Chitwan National Park, staying in the high-end Meghauli Serai jungle resort.",
    durationDays: 3,
    tourType: "Wildlife Safari",
    bestSeason: "October - March",
    priceUSD: 1450,
    highlights: ["Meghauli Serai Jungle Resort", "Private Jeep & Canoe Safaris", "Tharu Cultural Village Visit", "Resident Naturalist Guide"],
    status: "Active",
    region: "Chitwan",
  },
  {
    id: "tur-204",
    title: "Everest Scenic Mountain Flight & Sherpa Village Day Tour",
    slug: "everest-scenic-flight-sherpa-village",
    category: "TOUR",
    rating: 5.0,
    reviewsCount: 19,
    image: "https://images.unsplash.com/photo-1516481400365-878b508f2fea?auto=format&fit=crop&w=1200&q=80",
    shortDesc: "Fly within view of Mt. Everest's summit at dawn, then land in the Khumbu foothills for a guided day in a traditional Sherpa village.",
    durationDays: 1,
    tourType: "Scenic & Adventure",
    bestSeason: "March - May & September - November",
    priceUSD: 650,
    highlights: ["Dawn Mountain Flight Past Everest", "Private Helicopter Village Landing", "Guided Sherpa Homestead Visit", "Champagne Breakfast at Altitude"],
    status: "Featured",
    region: "Everest Region",
  },
];
