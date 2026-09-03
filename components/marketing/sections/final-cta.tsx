"use client";

import Link from "next/link";
import { useSettings } from "@/lib/settings-context";

export function FinalCta() {
  const { settings } = useSettings();
  const phone = (settings.whatsappNumber || "").replace(/\D/g, "");
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(
        "Hello Alpine Ace! I would like to plan my trek with you."
      )}`
    : "#";

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-amber-50/70 via-stone-50 to-amber-100/30 border-t border-b border-amber-200/60 text-stone-900 text-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <span className="text-amber-800 text-xs font-semibold uppercase tracking-wider block">
          Plan your trip
        </span>

        <h2 className="font-heading text-2xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          Ready to plan your trek? We&apos;re here to help you choose the right route.
        </h2>

        <p className="text-stone-600 text-sm sm:text-base font-normal leading-relaxed max-w-xl mx-auto">
          Reach out to our team in Kathmandu for custom itineraries, route advice, or trek bookings.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          <Link
            href="/contact"
            className="w-full sm:w-auto bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs sm:text-sm px-7 py-3.5 rounded-md transition-colors shadow-sm"
          >
            Get in Touch &rarr;
          </Link>

          {phone && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-white hover:bg-stone-50 border border-stone-300 text-stone-900 font-semibold text-xs sm:text-sm px-7 py-3.5 rounded-md transition-colors shadow-2xs flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4 fill-emerald-600 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Message on WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
