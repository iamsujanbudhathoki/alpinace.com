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

export default function Home() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/trekking?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const agencySchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "AlpineAce Expeditions",
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.jpg`,
    image: `${siteConfig.url}/logo.jpg`,
    description: siteConfig.description,
    telephone: "+977-1-4700000",
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Thamel Marg, Ward 29",
      addressLocality: "Kathmandu",
      addressRegion: "Bagmati",
      postalCode: "44600",
      addressCountry: "NP",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 27.7172,
      longitude: 85.324,
    },
    priceRange: "$$$",
    sameAs: [
      "https://facebook.com/alpineace",
      "https://instagram.com/alpineace",
      "https://youtube.com/@alpineace",
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
          __html: JSON.stringify(agencySchema),
        }}
      />

      {/* 1. Video Hero Section */}
      <Hero />

      {/* 2. Featured Trekking & Expedition Packages */}
      <FeaturedPackages />

      {/* 3. Why Travel With Us */}
      <WhyChooseUs />

      {/* 5. Travel Process (4-Step Journey) */}
      <TravelProcess />

      {/* 6. Pioneer Testimonials */}
      <TestimonialsSection />

      {/* 7. Statistics Bar */}
      <StatsBar />

      {/* 8. Featured Blog Articles */}
      <FeaturedBlogs />

      {/* 9. Pre-Trip Consultations FAQ Accordion */}
      <FaqsSection />

      {/* 10. Final Call To Action */}
      <FinalCta />
    </div>
  );
}
