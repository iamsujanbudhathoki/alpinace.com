export interface TravelPackage {
  id: string;
  title: string;
  slug: string;
  category: "Trekking" | "Expedition" | "Tour";
  region: string;
  durationDays: number;
  maxAltitudeMeters: number;
  difficulty: "Easy" | "Moderate" | "Challenging" | "Extreme";
  priceUSD: number;
  rating: number;
  reviewsCount: number;
  image: string;
  shortDesc: string;
  featured?: boolean;
}

export interface Destination {
  id: string;
  name: string;
  packageCount: number;
  description: string;
  image: string;
  highlights: string[];
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  country: string;
  tripName: string;
  content: string;
  avatar: string;
  rating: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  image: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
}

export interface CompanyFaq {
  id: string;
  question: string;
  answer: string;
}

export const HOME_STATS = [
  { number: "14+", label: "Years of Adventure", desc: "Crafting premium mountain experiences" },
  { number: "4,800+", label: "Happy Travelers", desc: "Savoring pristine local hospitality" },
  { number: "99.4%", label: "Success Rate", desc: "On high-altitude peak expeditions" },
  { number: "30+", label: "Bespoke Destinations", desc: "Exploring remote wilderness valleys" },
];

export const TRAVEL_PACKAGES: TravelPackage[] = [
  {
    id: "pkg-1",
    title: "Everest Base Camp & Gokyo Lakes Luxury Trek",
    slug: "everest-base-camp-gokyo",
    category: "Trekking",
    region: "Everest Region",
    durationDays: 14,
    maxAltitudeMeters: 5364,
    difficulty: "Challenging",
    priceUSD: 2450,
    rating: 4.9,
    reviewsCount: 48,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    shortDesc: "Experience the ultimate trek to the base of Mt. Everest, staying in handpicked premium luxury lodges with Sherpa legends.",
    featured: true,
  },
  {
    id: "pkg-2",
    title: "Annapurna Panoramic Luxury Circuit",
    slug: "annapurna-circuit-luxury",
    category: "Trekking",
    region: "Annapurna Region",
    durationDays: 10,
    maxAltitudeMeters: 5416,
    difficulty: "Moderate",
    priceUSD: 1980,
    rating: 4.8,
    reviewsCount: 35,
    image: "https://images.unsplash.com/photo-1585409677983-0f6c41ca913b?auto=format&fit=crop&w=1000&q=80",
    shortDesc: "Witness the complete diversity of the Himalayas, from lush tropical valleys and pine ridges to Thorong La pass.",
    featured: true,
  },
  {
    id: "pkg-3",
    title: "Ama Dablam Technical Expedition (6,812m)",
    slug: "ama-dablam-expedition",
    category: "Expedition",
    region: "Everest Region",
    durationDays: 28,
    maxAltitudeMeters: 6812,
    difficulty: "Extreme",
    priceUSD: 7800,
    rating: 5.0,
    reviewsCount: 22,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    shortDesc: "Climb the Matterhorn of the Himalayas with 1:1 IFMGA Sherpa summit leaders and high-altitude luxury basecamp support.",
    featured: true,
  },
];

export const DESTINATIONS: Destination[] = [
  {
    id: "everest",
    name: "Everest Region",
    packageCount: 8,
    description: "Home to Mt. Everest, Namche Bazaar, Kala Patthar, and turquoise Gokyo Lakes.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    highlights: ["Sagarmatha NP", "Kala Patthar (5,545m)", "Namche Bazaar"],
  },
  {
    id: "annapurna",
    name: "Annapurna Region",
    packageCount: 6,
    description: "Diverse trails from tropical Pokhara valley to Thorong La pass and Tilicho Lake.",
    image: "https://images.unsplash.com/photo-1585409677983-0f6c41ca913b?auto=format&fit=crop&w=800&q=80",
    highlights: ["Thorong La (5,416m)", "Poon Hill Sunrise", "Fewa Lake"],
  },
  {
    id: "langtang",
    name: "Langtang Region",
    packageCount: 4,
    description: "Pristine mountain valley near Kathmandu featuring Tamang culture & Gosaikunda lakes.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    highlights: ["Kyanjin Gompa", "Gosaikunda Lake", "Tamang Heritage"],
  },
  {
    id: "manaslu",
    name: "Manaslu Region",
    packageCount: 5,
    description: "Restricted wilderness trek circumnavigating Mt. Manaslu (8,163m) across Larkya La pass.",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    highlights: ["Larkya La (5,106m)", "Restricted Border", "Tibetan Culture"],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    author: "Jonathan Vance",
    role: "Expedition Member",
    country: "United States",
    tripName: "Ama Dablam Expedition",
    content: "The 1:1 Sherpa guide ratio and basecamp luxury made our summit push unforgettable. AlpineAce sets the gold standard in high-altitude mountaineering.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    id: "test-2",
    author: "Elena Rostova",
    role: "Luxury Trekker",
    country: "Germany",
    tripName: "Everest Luxury Lodge Trek",
    content: "Heated mattresses and organic fine dining at 4,000 meters! The Sherpa team looked after our safety with pulse oximeters every evening.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    id: "test-3",
    author: "Jean-Pierre Dubois",
    role: "Private Traveler",
    country: "France",
    tripName: "Annapurna Circuit & Heli Tour",
    content: "Bespoke planning from start to finish. Our private helicopter transfer from Manang back to Kathmandu was seamless and breathtaking.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "How to Prepare for High-Altitude Trekking in Nepal",
    slug: "how-to-prepare-for-high-altitude-trekking-in-nepal",
    category: "EXPEDITION PREPARATION",
    date: "JULY 12, 2026",
    readTime: "6 MIN READ",
    excerpt: "Essential advice on cardiovascular training, altitude acclimatization schedules, and preventing AMS on the Everest trail.",
    content: "Preparing for a Himalayan trek is as much mental as it is physical. Over our years of leading premium itineraries, we have found that high altitude readiness depends heavily on gradual pacing and proper hydration. Build cardiovascular fitness for at least 8 weeks before departure, prioritize acclimatization days at 3,000m and 4,000m, and watch for early symptoms of acute mountain sickness such as headache, nausea, and disrupted sleep. Ascending no more than 300-500m in sleeping altitude per day above 3,000m is the single most effective way to prevent AMS.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Mingma Sherpa",
      role: "IFMGA Expedition Leader",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "blog-2",
    title: "Top 5 Essential Packing Items for Everest Base Camp",
    slug: "top-5-essential-packing-items-for-everest-base-camp",
    category: "GEAR & EQUIPMENT",
    date: "JUNE 28, 2026",
    readTime: "4 MIN READ",
    excerpt: "Don't leave Kathmandu without these critical gear items — from thermal layering to down sleeping bags and solar power packs.",
    content: "Don't leave Kathmandu without these critical gear items: a -20°C rated down sleeping bag, moisture-wicking thermal base layers, a reliable headlamp with spare batteries, a water filtration bottle to cut down on plastic waste, and a portable solar charging pack for keeping cameras and phones running above 4,000m where power is scarce. Quality trekking boots that are already broken in matter more than almost anything else on this list.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Sujan Budhathoki",
      role: "Founder & Director",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "blog-3",
    title: "Understanding Sherpa Culture and Sacred Himalayan Peaks",
    slug: "understanding-sherpa-culture-and-sacred-himalayan-peaks",
    category: "CULTURE & HERITAGE",
    date: "JUNE 15, 2026",
    readTime: "8 MIN READ",
    excerpt: "A deep dive into Tibetan Buddhism, Mani stones, prayer flags, and the spiritual respect guiding multi-summit Sherpas.",
    content: "Many of the Himalaya's highest peaks are considered sacred by the Sherpa people, and mountaineers are expected to observe local customs before any expedition. Prayer flags carry mantras on the wind, Mani stones inscribed with Buddhist scripture line the trails, and basecamp Puja ceremonies ask for safe passage before a climbing season begins. Understanding this cultural context transforms a trek from a physical challenge into a much deeper journey through one of the world's most spiritually significant landscapes.",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Passang Lhamu Sherpa",
      role: "Cultural Historian",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    },
  },
];

export const COMPANY_FAQS: CompanyFaq[] = [
  {
    id: "faq-1",
    question: "How do you ensure high-altitude medical safety on treks?",
    answer: "Every trek is led by certified IFMGA Sherpa leaders equipped with pulse oximeters, specialized high-altitude medical kits, satellite communications, and 24/7 standby emergency helicopter evacuation coverage.",
  },
  {
    id: "faq-2",
    question: "What is the difference between standard tea houses and your luxury lodges?",
    answer: "We replace cold, drafty tea houses with premium boutique luxury lodges (such as Yeti Mountain Home and Ker & Downey) featuring attached heated bathrooms, electric mattress warmers, and organic fine dining.",
  },
  {
    id: "faq-3",
    question: "Can I customize a private itinerary for my family or group?",
    answer: "Yes! Our adventure directors design bespoke day-by-day itineraries tailored to your timeframe, physical fitness, dietary requirements, and private helicopter transfer preferences.",
  },
  {
    id: "faq-4",
    question: "What permits are required for trekking in restricted regions like Manaslu?",
    answer: "Restricted regions require Special Area Permits issued by the Nepal Department of Immigration, along with TIMS and Conservation Area Permits. Our team handles 100% of government paperwork prior to your arrival.",
  },
];
