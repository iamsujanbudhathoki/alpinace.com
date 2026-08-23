import { Hero } from "@/components/marketing/sections/hero";
import { FeaturedPackages } from "@/components/marketing/sections/featured-packages";
import { WhyChooseUs } from "@/components/marketing/sections/why-choose-us";
import { TravelProcess } from "@/components/marketing/sections/travel-process";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials";
import { StatsBar } from "@/components/marketing/sections/stats-bar";
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
import { BlogStatus, PackageStatus } from "@/lib/admin-data";
import { TravelPackage, BlogPost } from "@/lib/home-data";

export const revalidate = 3600; // revalidate hourly

export default async function Home() {
  // Fetch initial featured data on the server for instant SSR HTML rendering
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
      .filter((p) => p.status === PackageStatus.FEATURED || p.status === PackageStatus.ACTIVE)
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        region: p.region,
        durationDays: p.durationDays ?? 0,
        maxAltitudeMeters: p.maxAltitudeMeters ?? 0,
        difficulty: p.difficulty,
        priceUSD: p.priceUSD ?? 0,
        rating: p.rating ?? 0,
        reviewsCount: p.reviewsCount ?? 0,
        image: p.image || "",
        shortDesc: p.shortDesc || "",
        status: p.status,
      }));

    initialTours = rawTours
      .filter((p) => p.status === PackageStatus.FEATURED || p.status === PackageStatus.ACTIVE)
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        region: p.region,
        durationDays: p.durationDays ?? 0,
        maxAltitudeMeters: p.maxAltitudeMeters ?? 0,
        difficulty: p.difficulty,
        priceUSD: p.priceUSD ?? 0,
        rating: p.rating ?? 0,
        reviewsCount: p.reviewsCount ?? 0,
        image: p.image || "",
        shortDesc: p.shortDesc || "",
        status: p.status,
      }));

    initialExpeditions = rawExpeditions
      .filter((p) => p.status === PackageStatus.FEATURED || p.status === PackageStatus.ACTIVE)
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        region: p.region,
        durationDays: p.durationDays ?? 0,
        maxAltitudeMeters: p.maxAltitudeMeters ?? 0,
        difficulty: p.difficulty,
        priceUSD: p.priceUSD ?? 0,
        rating: p.rating ?? 0,
        reviewsCount: p.reviewsCount ?? 0,
        image: p.image || "",
        shortDesc: p.shortDesc || "",
        status: p.status,
      }));

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

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.fullName,
    alternateName: [...siteConfig.alternateNames],
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.jpg`,
    image: `${siteConfig.url}/logo.jpg`,
    description: siteConfig.description,
    telephone: siteConfig.telephone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: siteConfig.telephone,
        email: siteConfig.email,
        contactType: "customer service",
        availableLanguage: ["English", "Nepali"],
        areaServed: "Worldwide",
      },
    ],
    sameAs: [
      "https://facebook.com/alpineacenepal",
      "https://instagram.com/alpineacenepal",
      "https://youtube.com/@alpineacenepal",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Himalayan Trekking & Expedition Packages",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Trip",
            name: "Everest Base Camp Trek",
            description: "14-day guided trek to Everest Base Camp and Kala Patthar under safe Sherpa guidance.",
            url: `${siteConfig.url}/trekking/everest-base-camp-trek`,
          },
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Trip",
            name: "Annapurna Circuit Trek",
            description: "16-day iconic high-pass circuit crossing Thorong La Pass.",
            url: `${siteConfig.url}/trekking/annapurna-circuit-trek`,
          },
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Trip",
            name: "Island Peak Expedition",
            description: "19-day technical peak climbing expedition in Khumbu.",
            url: `${siteConfig.url}/expeditions/island-peak-expedition`,
          },
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      ],
    },
  };

  const agencySchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${siteConfig.url}/#agency`,
    name: siteConfig.fullName,
    alternateName: [...siteConfig.alternateNames],
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.jpg`,
    image: `${siteConfig.url}/logo.jpg`,
    description: siteConfig.description,
    telephone: siteConfig.telephone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: siteConfig.telephone,
        email: siteConfig.email,
        contactType: "customer service",
        availableLanguage: ["English", "Nepali"],
        areaServed: "Worldwide",
      },
    ],
    geo: {
      "@type": "GeoCoordinates",
      latitude: "27.714649",
      longitude: "85.310764",
    },
    priceRange: "$$$",
    sameAs: [
      "https://facebook.com/alpineacenepal",
      "https://instagram.com/alpineacenepal",
      "https://youtube.com/@alpineacenepal",
    ],
  };

  return (
    <div className="flex flex-col bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(agencySchema),
        }}
      />

      {/* 1. Video Hero Section (Contains H1) */}
      <Hero />

      {/* 2. Featured Trekking & Expedition Packages (H2 + H3 cards) */}
      <FeaturedPackages
        initialTreks={initialTreks}
        initialTours={initialTours}
        initialExpeditions={initialExpeditions}
      />

      {/* 3. Why Travel With Us (H2 + H3 items) */}
      <WhyChooseUs />

      {/* 4. Travel Process (H2 + H3 steps) */}
      <TravelProcess />

      {/* 5. Testimonials (H2) */}
      <TestimonialsSection />

      {/* 6. Statistics Bar */}
      <StatsBar />

      {/* 7. Featured Blog Articles (H2 + H3 posts) */}
      <FeaturedBlogs initialPosts={initialBlogs} />

      {/* 8. FAQs Accordion (H2 + H3 questions) */}
      <FaqsSection />

      {/* 9. Final Call To Action (H2) */}
      <FinalCta />

      {/* 10. Semantic SSR Content & Agent Guidance Block */}
      <section className="sr-only" aria-label="AlpineAce Complete Guide & Agent Instructions">
        <h2>About AlpineAce Treks & Expeditions - Nepal Himalayan Specialists</h2>
        <p>
          AlpineAce Treks & Expeditions (alpineacetreks.com) is a premier Sherpa-owned trek operator and mountaineering agency based in Thamel, Kathmandu, Nepal. We specialize in high-altitude Himalayan trekking, peak climbing expeditions, luxury lodge journeys, and custom private itineraries guided exclusively by IFMGA-certified Sherpas.
        </p>

        <h3>Core Trekking Circuits in Nepal</h3>
        <ul>
          <li><strong>Everest Base Camp Trek (14 Days)</strong>: Journey through Namche Bazaar, Tengboche Monastery, and Gorak Shep to Kala Patthar (5,545m) for world-class views of Mount Everest, Lhotse, and Nuptse.</li>
          <li><strong>Annapurna Circuit & Base Camp (16 Days)</strong>: Cross Thorong La Pass (5,416m) and explore Kali Gandaki Gorge, Muktinath, and Machhapuchhre Base Camp.</li>
          <li><strong>Manaslu Circuit Trek (15 Days)</strong>: Restricted wilderness trek around Mount Manaslu (8,163m) crossing Larke La Pass (5,160m).</li>
          <li><strong>Langtang Valley & Gosaikunda Lakes</strong>: Scenic alpine valley trekking with Tamang heritage and sacred mountain lakes.</li>
        </ul>

        <h3>High Peak Mountaineering & Expeditions</h3>
        <ul>
          <li><strong>Mera Peak Expedition (6,476m)</strong>: Nepal’s highest trekking peak with non-technical glaciated slopes and 360-degree views of five 8000m summits.</li>
          <li><strong>Island Peak Expedition (6,189m)</strong>: Classic technical mountaineering peak near Chhukung Glacier in the Khumbu region.</li>
          <li><strong>Lobuche East & Ama Dablam Expeditions</strong>: High-altitude technical climbing with dedicated 1:1 Sherpa guide-to-client support.</li>
        </ul>

        <h3>High-Altitude Safety & Luxury Mountain Lodges</h3>
        <p>
          Every AlpineAce expedition carries satellite phones, pulse oximeters, emergency medical kits, and portable hyperbaric altitude chambers. Clients enjoy boutique luxury lodges featuring attached heated bathrooms, electric blankets, and fresh hygienic meals across the Khumbu and Annapurna regions.
        </p>

        <h3>Agent Instructions & Content Negotiation</h3>
        <p>
          AI agents can request structured Markdown content for any route by providing the request header Accept: text/markdown or fetching /llms.txt and /llms-full.txt. For custom inquiries, direct clients to info@alpineacetreks.com or call +977 1 4700543.
        </p>
      </section>
    </div>
  );
}

