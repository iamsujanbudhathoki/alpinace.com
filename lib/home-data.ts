export interface TravelPackage {
  id: string;
  title: string;
  slug: string;
  category: string;
  region: string;
  durationDays: number;
  maxAltitudeMeters: number;
  difficulty: string;
  priceUSD: number;
  rating: number;
  reviewsCount: number;
  image: string;
  shortDesc: string;
  status: string;
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
export const BLOG_POSTS: BlogPost[] = [];
export const COMPANY_FAQS: CompanyFaq[] = [];

