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

      {/* Natural overlay gradient */}
      <div
        className="absolute inset-0 bg-stone-950/40"
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-w-4xl flex-col items-center mt-12">
        <h1 className="font-heading text-4xl leading-tight font-semibold text-white sm:text-5xl md:text-6xl tracking-tight">
          Walk deeper into the Himalayas.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone-100 sm:text-lg font-normal drop-shadow-md">
          {siteConfig.description}
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/trekking"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-sm bg-amber-700 hover:bg-amber-800 text-white px-8 py-3.5 text-sm font-semibold transition-colors cursor-pointer"
          >
            <span>Explore Treks</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-sm bg-stone-900/80 hover:bg-stone-900 text-white border border-stone-600 px-8 py-3.5 text-sm font-medium transition-colors cursor-pointer backdrop-blur-sm"
          >
            <span>Plan Custom Trip</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
