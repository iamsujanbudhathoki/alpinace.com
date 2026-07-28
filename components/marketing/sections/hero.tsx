import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  const words = siteConfig.tagline.split(" ");
  const highlight = words.pop();
  const lead = words.join(" ");

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-slate-950 px-6 text-center">
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

      {/* Clean overlay gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950/85"
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-w-3xl flex-col items-center">
        <h1 className="font-heading text-4xl leading-[1.05] font-semibold text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
          <span className="block">{lead}</span>
          <span className="block text-gold-400 font-normal italic">{highlight}</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg drop-shadow-md font-medium">
          {siteConfig.description}
        </p>

        {/* Clean Luxe Action Button - Gold ONLY on Hover */}
        <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="group relative inline-flex items-center gap-3.5 rounded-full bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-950 shadow-xl border border-white cursor-pointer transition-all duration-300 hover:bg-gold-500 hover:text-slate-950 hover:border-gold-400 hover:shadow-2xl hover:scale-105 active:scale-95 hover:ring-4 hover:ring-gold-500/25"
          >
            <span>Plan My Trip</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white transition-all duration-300 group-hover:bg-slate-950 group-hover:text-amber-400 group-hover:translate-x-1">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
