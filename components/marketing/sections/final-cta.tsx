import Link from "next/link";
import { Sparkles } from "lucide-react";
import { contact } from "@/lib/site-config";

export function FinalCta() {
  return (
    <section className="relative py-24 bg-slate-950 text-white overflow-hidden text-center">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1486916856992-e4db22c8df33?auto=format&fit=crop&w=1920&q=80"
          alt="Majestic high snow peaks"
          className="w-full h-full object-cover object-bottom opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/60" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <span className="text-amber-400 text-xs uppercase tracking-widest font-extrabold block">
          Are You Ready?
        </span>
        <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white leading-tight">
          The Himalayas Are Calling
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
          Take the first step toward a bespoke mountain experience. Speak directly with our certified expedition directors to craft your personalized high-altitude itinerary.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <Link
            href="/contact"
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Begin Bespoke Planning</span>
          </Link>
          <a
            href={`https://wa.me/${contact.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-slate-900 border border-white/20 hover:border-white/40 text-white font-heading text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-full transition-colors flex items-center justify-center gap-2"
          >
            <span>Contact Thamel HQ</span>
          </a>
        </div>

        <div className="pt-4 text-xs font-mono text-slate-400 flex flex-wrap justify-center items-center gap-4">
          <span>● 24/7 Rescue Standby</span>
          <span>● Sustainable Operator</span>
          <span>● Tailored Customization</span>
        </div>
      </div>
    </section>
  );
}
