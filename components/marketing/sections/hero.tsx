import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  const words = siteConfig.tagline.split(" ");
  const highlight = words.pop();
  const lead = words.join(" ");

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-ink-950 px-6 text-center">
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

      {/* Soft, clean overlay gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-ink-950/75"
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-w-3xl flex-col items-center">
        <h1 className="font-heading text-4xl leading-[1.05] font-medium text-stone-50 sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
          <span className="block">{lead}</span>
          <span className="block text-copper-200 italic font-normal">{highlight}</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone-100 sm:text-lg drop-shadow-md font-medium">
          {siteConfig.description}
        </p>

        {/* Clean Luxe Action Button */}
        <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="group relative inline-flex items-center gap-3 rounded-full bg-stone-50/95 hover:bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-stone-200/80 cursor-pointer"
          >
            <span>Plan My Trip</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-stone-50 transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
