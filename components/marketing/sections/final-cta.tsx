import Link from "next/link";
import { contact } from "@/lib/site-config";

export function FinalCta() {
  return (
    <section className="relative py-24 bg-white text-slate-900 border-t border-slate-200 text-center overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <span className="text-gold-600 text-xs uppercase tracking-widest font-extrabold block">
          Are You Ready?
        </span>
        <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
          The Himalayas Are Calling
        </h2>
        <p className="text-slate-700 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
          Take the first step toward a bespoke mountain experience. Speak directly with our certified expedition directors to craft your personalized high-altitude itinerary.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <Link
            href="/contact"
            className="w-full sm:w-auto bg-slate-900 hover:bg-gold-500 hover:text-slate-950 text-white font-heading text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-full shadow-md transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2 border border-slate-900"
          >
            <span>Begin Bespoke Planning</span>
          </Link>
          <a
            href={`https://wa.me/${contact.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-heading text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-full transition-colors flex items-center justify-center gap-2"
          >
            <span>Contact Thamel HQ</span>
          </a>
        </div>

        <div className="pt-4 text-xs font-mono text-slate-700 flex flex-wrap justify-center items-center gap-4 font-semibold">
          <span>&bull; 24/7 Rescue Standby</span>
          <span>&bull; Sustainable Operator</span>
          <span>&bull; Tailored Customization</span>
        </div>
      </div>
    </section>
  );
}
