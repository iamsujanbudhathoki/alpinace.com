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
    <div className="pt-24 min-h-screen bg-white pb-20 font-sans text-stone-900">
      {/* Header Section */}
      <header className="pt-8 pb-10 border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <span className="text-stone-500 text-xs font-semibold uppercase tracking-wider block">
            Expedition Agreement
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-stone-900">
            Terms &amp; Conditions
          </h1>
          <p className="text-stone-600 text-base max-w-2xl font-normal leading-relaxed">
            Please review our booking policies, high-altitude safety agreements, and cancellation terms prior to reserving your trip with AlpineAce.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <TermsAndConditionsContent />

        <div className="pt-8 border-t border-stone-200 flex justify-between items-center text-xs font-semibold text-stone-700">
          <Link
            href="/privacy"
            className="flex items-center gap-1 hover:text-stone-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Privacy Policy</span>
          </Link>
          <Link
            href="/contact"
            className="hover:text-stone-950 transition-colors"
          >
            Contact Concierge &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
