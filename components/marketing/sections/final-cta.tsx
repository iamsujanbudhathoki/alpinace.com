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
    <section className="py-16 sm:py-20 bg-stone-50 text-stone-900 border-t border-stone-200 text-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Have Questions About a Trek?
        </h2>
        <p className="text-stone-600 text-sm font-normal leading-relaxed">
          Our team in Thamel, Kathmandu is here to help with route selection, permit requirements, custom dates, and physical preparation.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-3">
          <Link
            href="/contact"
            className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Get in Touch</span>
            <ArrowRight className="h-4 w-4 text-amber-400" />
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-white hover:bg-stone-100 border border-stone-300 text-stone-900 font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
