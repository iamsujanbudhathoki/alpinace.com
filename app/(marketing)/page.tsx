import { Hero } from "@/components/marketing/sections/hero";
import { FeaturedPackages } from "@/components/marketing/sections/featured-packages";
import { DestinationsSection } from "@/components/marketing/sections/destinations";
import { WhyChooseUs } from "@/components/marketing/sections/why-choose-us";
import { TravelProcess } from "@/components/marketing/sections/travel-process";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials";
import { StatsBar } from "@/components/marketing/sections/stats-bar";
import { FeaturedBlogs } from "@/components/marketing/sections/featured-blogs";
import { FaqsSection } from "@/components/marketing/sections/faqs-section";
import { FinalCta } from "@/components/marketing/sections/final-cta";

export default function Home() {
  return (
    <div className="flex flex-col bg-slate-50 text-slate-900">
      {/* 1. Video Hero Section */}
      <Hero />

      {/* 2. Featured Trekking & Expedition Packages */}
      <FeaturedPackages />

      {/* 3. Nepal Destinations */}
      <DestinationsSection />

      {/* 4. Why Travel With Us */}
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
