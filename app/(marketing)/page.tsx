import { Hero } from "@/components/marketing/sections/hero";
import { PartnersAffiliationsSection } from "@/components/marketing/sections/partners-affiliations";
import { WhyChooseUs } from "@/components/marketing/sections/why-choose-us";
import { WhyAceSection } from "@/components/marketing/sections/why-ace-section";
import { FeaturedPackages } from "@/components/marketing/sections/featured-packages";
import { ActivitiesSection } from "@/components/marketing/sections/activities-section";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials";
import { ExpertCtaSection } from "@/components/marketing/sections/expert-cta-section";
import { FeaturedBlogs } from "@/components/marketing/sections/featured-blogs";
import { FaqsSection } from "@/components/marketing/sections/faqs-section";
import { FinalCta } from "@/components/marketing/sections/final-cta";
import { siteConfig } from "@/lib/site-config";
import {
  TrekService,
  TourService,
  ExpeditionService,
  BlogService,
} from "@/lib/services/admin-service";
import { BlogStatus, PackageStatus, CategoryType } from "@/lib/admin-data";
import { TravelPackage, BlogPost } from "@/lib/home-data";

export const revalidate = 3600; // revalidate hourly

export default async function Home() {
  // Fetch initial featured data on the server for instant SSR HTML rendering
  let initialPopular: TravelPackage[] = [];
  let initialTreks: TravelPackage[] = [];
  let initialTours: TravelPackage[] = [];
  let initialExpeditions: TravelPackage[] = [];
  let initialBlogs: BlogPost[] = [];

  try {
    const [rawTreks, rawTours, rawExpeditions, rawBlogs] = await Promise.all([
      TrekService.getAll().catch(() => []),
      TourService.getAll().catch(() => []),
      ExpeditionService.getAll().catch(() => []),
      BlogService.getAll(BlogStatus.PUBLISHED).catch(() => []),
    ]);

    initialTreks = rawTreks
      .filter((p) => p.isFeatured || p.status === PackageStatus.ACTIVE)
      .sort((a, b) => (a.isFeatured ? -1 : 1))
      .slice(0, 20)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        categoryType: CategoryType.TREKKING,
        region: p.region,
        durationDays: p.durationDays ?? 0,
        maxAltitudeMeters: p.maxAltitudeMeters ?? 0,
        difficulty: p.difficulty,
        priceUSD: p.priceUSD ?? 0,
        rating: p.rating ?? 0,
        reviewsCount: p.reviewsCount ?? 0,
        image: p.image || "",
        shortDesc: p.shortDesc || "",
        status: (p.status as PackageStatus) || PackageStatus.ACTIVE,
        isPopular: p.isPopular,
      }));

    initialTours = rawTours
      .filter((p) => p.isFeatured || p.status === PackageStatus.ACTIVE)
      .sort((a, b) => (a.isFeatured ? -1 : 1))
      .slice(0, 20)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        categoryType: CategoryType.TOURS,
        region: p.region,
        durationDays: p.durationDays ?? 0,
        maxAltitudeMeters: p.maxAltitudeMeters ?? 0,
        difficulty: p.difficulty,
        priceUSD: p.priceUSD ?? 0,
        rating: p.rating ?? 0,
        reviewsCount: p.reviewsCount ?? 0,
        image: p.image || "",
        shortDesc: p.shortDesc || "",
        status: (p.status as PackageStatus) || PackageStatus.ACTIVE,
        isPopular: p.isPopular,
      }));

    initialExpeditions = rawExpeditions
      .filter((p) => p.isFeatured || p.status === PackageStatus.ACTIVE)
      .sort((a, b) => (a.isFeatured ? -1 : 1))
      .slice(0, 20)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        categoryType: CategoryType.EXPEDITIONS,
        region: p.region,
        durationDays: p.durationDays ?? 0,
        maxAltitudeMeters: p.maxAltitudeMeters ?? 0,
        difficulty: p.difficulty,
        priceUSD: p.priceUSD ?? 0,
        rating: p.rating ?? 0,
        reviewsCount: p.reviewsCount ?? 0,
        image: p.image || "",
        shortDesc: p.shortDesc || "",
        status: (p.status as PackageStatus) || PackageStatus.ACTIVE,
        isPopular: p.isPopular,
      }));

    initialPopular = [
      ...initialTreks.filter((p) => p.isPopular),
      ...initialTours.filter((p) => p.isPopular),
      ...initialExpeditions.filter((p) => p.isPopular),
    ];

    initialBlogs = rawBlogs.slice(0, 3).map((b: any) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      category: b.category,
      date: b.publishedDate,
      readTime: b.readTime,
      excerpt: b?.excerpt || "",
      content: b?.content || "",
      image: b?.image || "",
    }));
  } catch (e) {
    console.warn("Server-side initial data fetch warning:", e);
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.fullName,
    alternateName: [...siteConfig.alternateNames],
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/trekking?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="flex flex-col bg-stone-50 text-stone-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />

      {/* 1. Hero Section */}
      <Hero
        initialTreks={initialTreks}
        initialTours={initialTours}
        initialExpeditions={initialExpeditions}
      />

      {/* 2. Featured Trekking & Expedition Packages */}
      <FeaturedPackages
        initialPopular={initialPopular}
        initialTreks={initialTreks}
        initialTours={initialTours}
        initialExpeditions={initialExpeditions}
      />

      {/* 3. Explore by Activity Hubs */}
      <ActivitiesSection />

      {/* 4. Discover the Difference - About Alpine Ace */}
      <WhyChooseUs />

      {/* 5. Why Choose AlpineAce Treks? */}
      <WhyAceSection />

      {/* 4. Traveler's Tales - Client Testimonials */}
      <TestimonialsSection />

      {/* 5. Speak to an Expert CTA */}
      <ExpertCtaSection />

      {/* 6. Expedition Journal */}
      <FeaturedBlogs initialPosts={initialBlogs} />

      {/* 6. FAQs Accordion */}
      <FaqsSection />

      {/* 7. Official Partners & Affiliations Trust Board */}
      <PartnersAffiliationsSection />

      {/* 8. Pre-Footer Trip Consultation Banner */}
      <FinalCta />
    </div>
  );
}


