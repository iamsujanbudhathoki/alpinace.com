"use client";

import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { useSettings } from "@/lib/settings-context";

export function FinalCta() {
  const { settings } = useSettings();
  const phone = (settings.whatsappNumber || "").replace(/\D/g, "");
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(
        "Hello AlpineAce! I am interested in planning a trek or expedition."
      )}`
    : "#";

  return (
    <section className="py-20 bg-stone-50 text-slate-900 border-t border-stone-200 text-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
          Ready to plan your expedition?
        </h2>
        <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
          Reach out to our team in Kathmandu. We'll help with permits, logistics, itinerary planning, and any questions about the route.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <Link
            href="/contact"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-7 py-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Get in Touch</span>
            <ArrowRight className="h-4 w-4 text-amber-400" />
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-white hover:bg-stone-100 border border-stone-200 text-slate-800 font-semibold text-sm px-7 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <span>WhatsApp Us</span>
          </a>
        </div>

        <div className="pt-3 text-xs text-slate-500 flex flex-wrap justify-center items-center gap-5 font-medium">
          <span>Sherpa-led teams</span>
          <span>·</span>
          <span>Custom itineraries</span>
          <span>·</span>
          <span>High-altitude safety</span>
        </div>
      </div>
    </section>
  );
}
