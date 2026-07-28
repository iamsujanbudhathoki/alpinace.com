import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { contact, siteConfig } from "@/lib/site-config";

const trustPartners = ["TAAN Permitted", "NMA Certified", "Nepal Tourism Board"];

export function Hero() {
  const words = siteConfig.tagline.split(" ");
  const highlight = words.pop();
  const lead = words.join(" ");

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-charcoal-950 px-6 text-center">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Soft, clean overlay gradient to let the video shine while maintaining readability */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-charcoal-950/70"
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-w-3xl flex-col items-center">
        <h1 className="font-heading text-4xl leading-[1.05] font-bold text-offwhite-50 sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
          <span className="block">{lead}</span>
          <span className="block text-gold-400">{highlight}</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-offwhite-100 sm:text-lg drop-shadow-md font-medium">
          {siteConfig.description}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-charcoal-950 transition-colors hover:bg-gold-400"
          >
            Plan My Trip
            <ArrowRight className="h-4 w-4" />
          </Link>
        
        </div>

      
      </div>
    </section>
  );
}
