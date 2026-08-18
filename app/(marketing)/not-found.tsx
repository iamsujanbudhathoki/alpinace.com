import Link from "next/link";
import {
  Compass,
  MapPin,
  Search,
  ArrowLeft,
  Home,
  Mountain,
  Sparkles,
  PhoneCall,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "404 - Mountain Pass Not Found | AlpineAce Luxury Expeditions",
  description:
    "The page or expedition route you requested could not be found on AlpineAce. Return to basecamp or search our luxury Himalayan packages.",
};

export default function NotFound() {
  const popularLinks = [
    {
      title: "Everest Base Camp Luxury Trek",
      category: "Trekking",
      href: "/trekking/everest-base-camp-gokyo-lakes",
      badge: "Iconic",
    },
    {
      title: "Ama Dablam 6812m Expedition",
      category: "Expedition",
      href: "/expeditions/ama-dablam-expedition",
      badge: "Extreme",
    },
    {
      title: "Kathmandu Royal Cultural Tour",
      category: "Luxury Tour",
      href: "/tours/kathmandu-cultural-heritage-tour",
      badge: "Heritage",
    },
    {
      title: "Annapurna Sanctuary Circuit",
      category: "Trekking",
      href: "/trekking/annapurna-circuit-thorong-la",
      badge: "Popular",
    },
  ];

  return (
    <div className="relative min-h-[85vh] bg-slate-950 text-white overflow-hidden flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
      {/* ── Ambient Background Aurora Glow & Grid Lines ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-amber-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        
        {/* Subtle Geometric Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto w-full text-center space-y-8 z-10">
        {/* ── Top Badge ── */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase shadow-xl backdrop-blur-md">
          <Compass className="w-4 h-4 animate-spin-slow text-amber-400" />
          <span>Altitude 404 &bull; Off-Route Landmark</span>
        </div>

        {/* ── Giant 404 Number Graphic ── */}
        <div className="relative select-none my-2">
          <h1 className="text-8xl sm:text-[13rem] font-heading font-extrabold tracking-tighter leading-none bg-gradient-to-b from-amber-200 via-amber-400 to-emerald-500 bg-clip-text text-transparent drop-shadow-2xl">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-sm sm:text-xl font-black uppercase tracking-[0.3em] text-slate-400/30 blur-[0.5px]">
              Mountain Pass Not Found
            </span>
          </div>
        </div>

        {/* ── Main Message ── */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-slate-100 tracking-tight">
            Lost Above the Clouds
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
            The high-altitude trek route, itinerary, or page you are looking for has been moved, renamed, or lies beyond our current expedition map.
          </p>
        </div>

        {/* ── Primary Navigation CTA Buttons ── */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/">
            <Button
              size="lg"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm px-6 h-12 rounded-xl shadow-xl shadow-amber-500/10 cursor-pointer transition-all hover:scale-105 flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Back to Basecamp (Home)</span>
            </Button>
          </Link>

          <Link href="/trekking">
            <Button
              size="lg"
              variant="outline"
              className="bg-slate-900/80 hover:bg-slate-800 text-white border-slate-700 font-bold text-xs sm:text-sm px-6 h-12 rounded-xl backdrop-blur-md cursor-pointer transition-all hover:scale-105 flex items-center gap-2"
            >
              <Mountain className="w-4 h-4 text-emerald-400" />
              <span>Explore Himalayan Treks</span>
            </Button>
          </Link>

          <Link href="/expeditions">
            <Button
              size="lg"
              variant="outline"
              className="bg-slate-900/80 hover:bg-slate-800 text-white border-slate-700 font-bold text-xs sm:text-sm px-6 h-12 rounded-xl backdrop-blur-md cursor-pointer transition-all hover:scale-105 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>8000m Expeditions</span>
            </Button>
          </Link>
        </div>

        {/* ── Popular Mountain Expeditions Quick Grid ── */}
        <div className="pt-8 border-t border-slate-800/80 text-left max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Recommended Himalayan Routes</span>
            </h3>
            <Link
              href="/tours"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <span>View All Tours</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularLinks.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="group p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all flex items-center justify-between shadow-xs"
              >
                <div className="space-y-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="text-[9px] font-extrabold bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded-md">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                    {item.title}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Assistance Footer Note ── */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            24/7 IFMGA Emergency Standby Coverage
          </span>
          <Link
            href="/contact"
            className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 font-semibold transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            Contact Expedition Director
          </Link>
        </div>
      </div>
    </div>
  );
}
