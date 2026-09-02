import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { generateStaticMetadata } from "@/lib/seo";
import { TermsAndConditionsContent } from "./terms-content";

export function generateMetadata(): Metadata {
  return generateStaticMetadata({
    title: "Terms & Conditions | AlpineAce",
    description:
      "Terms and conditions, booking policies, and expedition agreements for AlpineAce Treks & Expeditions in Nepal.",
    path: "/terms",
    keywords: [
      "Terms and conditions",
      "AlpineAce Booking Terms",
      "Nepal expedition contract",
    ],
  });
}

export default function TermsPage() {
  return (
    <div className="pt-24 min-h-screen bg-stone-50 pb-20 font-sans">
      {/* Header Banner */}
      <section className="py-16 bg-slate-950 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-amber-400 text-sm font-medium block">
            Expedition Agreement
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Terms &amp; Conditions
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto font-light leading-relaxed">
            Please review our booking policies, high-altitude safety agreements, and cancellation terms prior to reserving your trip with AlpineAce.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <TermsAndConditionsContent />

        <div className="flex justify-between items-center text-xs font-semibold text-zinc-700">
          <Link
            href="/privacy"
            className="flex items-center gap-1 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Privacy Policy</span>
          </Link>
          <Link
            href="/contact"
            className="hover:text-amber-800 transition-colors"
          >
            Contact Concierge &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
