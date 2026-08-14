import { TripDifficulty, PackageStatus } from "./admin-data";

export interface TravelPackage {
  id: string;
  title: string;
  slug: string;
  category: string;
  region: string;
  durationDays: number;
  maxAltitudeMeters: number;
  difficulty: TripDifficulty;
  priceUSD: number;
  rating: number;
  reviewsCount: number;
  image: string;
  shortDesc: string;
  status: PackageStatus;
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
}

export interface CompanyFaq {
  id: string;
  question: string;
  answer: string;
}

export const HOME_STATS: { number: string; label: string; desc: string }[] = [];
export const TRAVEL_PACKAGES: TravelPackage[] = [];
export const DESTINATIONS: Destination[] = [];
export const TESTIMONIALS: Testimonial[] = [];
export const COMPANY_FAQS: CompanyFaq[] = [
  {
    id: "faq-1",
    question: "What physical fitness and prior experience is required?",
    answer:
      "For classic trekking routes (such as Everest Base Camp or Annapurna Circuit), strong cardiovascular endurance and regular aerobic training 6–8 weeks in advance is recommended. Prior trekking experience is beneficial but not mandatory. For 6,000m peak expeditions (Island Peak, Mera Peak, Lobuche), basic mountaineering skills with crampons and fixed ropes are taught on-site during basecamp training clinics by our certified master guides.",
  },
  {
    id: "faq-2",
    question: "How does Alpine Ace manage altitude acclimatization and medical safety?",
    answer:
      "All our itineraries follow conservative ascent profiles with dedicated acclimatization days. Guide leaders conduct twice-daily pulse-oximeter biometric checks (SpO2 & heart rate). Every high-altitude group is equipped with supplemental medical oxygen, comprehensive first-aid kits, and 24/7 direct satellite emergency dispatch for immediate helicopter evacuation when warranted.",
  },
  {
    id: "faq-3",
    question: "What travel permits and government paperwork are needed?",
    answer:
      "Alpine Ace handles 100% of required paperwork including National Park Entry permits (Sagarmatha, Annapurna, Langtang), TIMS cards, Restricted Area permits (Manaslu, Upper Mustang), and NMA peak climbing permits. You only need a passport with at least 6 months validity and valid travel insurance covering high-altitude trekking up to 6,000m.",
  },
  {
    id: "faq-4",
    question: "When is the optimal season for trekking and peak climbing in Nepal?",
    answer:
      "The two primary seasons are Spring (March to May) and Autumn (September to November). Spring offers pleasant temperatures, blooming rhododendron forests, and active mountaineering summit pushes. Autumn provides the crispest blue skies, stable high-pressure windows, and extraordinary mountain panoramas.",
  },
  {
    id: "faq-5",
    question: "What are the accommodations and dietary arrangements on the trail?",
    answer:
      "We partner with the finest boutique lodges and luxury mountain retreats along the Khumbu and Annapurna trails, offering heated electric blankets, en-suite bathrooms, and hot showers. At wilderness basecamps, we provide four-season private tents and a dedicated expedition cook team serving freshly prepared, hygienic, nutrient-dense organic meals.",
  },
  {
    id: "faq-6",
    question: "What is your booking deposit and rescheduling policy?",
    answer:
      "A 20% advance deposit secures your guide crew, lodge bookings, and government permits. The remaining balance can be settled upon arrival in Kathmandu via bank transfer, credit card, or cash. We offer complimentary trip date transfers up to 30 days prior to departure in the event of unexpected travel changes.",
  },
];


