import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[90svh] sm:min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-slate-950 px-6 text-center">
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
        className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90"
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-w-4xl flex-col items-center">
        <h1 className="font-heading text-4xl leading-[1.1] font-bold text-white sm:text-5xl md:text-6xl">
          Guided Treks &amp; Expeditions in the Himalayas
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg font-normal">
          {siteConfig.description}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          <Link
            href="/trekking"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 px-7 py-3.5 text-sm font-bold transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <span>Explore Treks</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md px-7 py-3.5 text-sm font-medium transition-all cursor-pointer active:scale-98"
          >
            <span>Plan Custom Trip</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
