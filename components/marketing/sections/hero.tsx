import Link from "next/link";
import { ArrowRight, Mountain, ShieldCheck, Award } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[92vh] flex-col items-center justify-center overflow-hidden bg-slate-950 px-6 text-center pt-20">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for rich contrast */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90"
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-w-4xl flex-col items-center space-y-6">
        {/* Mountain Trust Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-slate-900/80 px-4 py-1.5 backdrop-blur-md">
          <Award className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
            NTB Licensed • IFMGA Sherpa Guides
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-tight">
          Venture Beyond <br className="hidden sm:inline" />
          <span className="text-amber-400">The Ordinary</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-200 font-medium">
          Experience Nepal&apos;s iconic trekking routes, historical tours, and elite 6,000m - 8,000m peak expeditions with multi-summit Sherpa leaders.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <Link
            href="/trekking"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-7 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-950 transition-all hover:bg-amber-400 shadow-lg"
          >
            <span>Explore Treks</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            <span>Plan My Trip</span>
          </Link>
        </div>

        {/* Key Mountain Stats Chips */}
        <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-white text-xs font-semibold w-full max-w-2xl border-t border-white/15">
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-amber-400">8,848m</span>
            <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Mt. Everest</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-amber-400">6,812m</span>
            <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Ama Dablam</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-amber-400">1:1</span>
            <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Sherpa Ratio</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-amber-400">100%</span>
            <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Safety Record</span>
          </div>
        </div>
      </div>
    </section>
  );
}
