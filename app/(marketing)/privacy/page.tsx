import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { generateStaticMetadata } from "@/lib/seo";
import { PrivacyPolicyContent } from "./privacy-content";

export function generateMetadata(): Metadata {
  return generateStaticMetadata({
    title: "Privacy Policy | AlpineAce Treks & Expeditions",
    description:
      "Privacy policy and data protection guidelines for AlpineAce Treks & Expeditions in Nepal.",
    path: "/privacy",
    keywords: [
      "Privacy Policy",
      "AlpineAce Data Protection",
      "Nepal trekking privacy",
    ],
  });
}

export default function PrivacyPage() {
  return (
    <div className="pt-24 min-h-screen bg-stone-50 pb-20 font-sans">
      {/* Header Banner */}
      <section className="py-16 bg-slate-950 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-amber-400 text-sm font-medium block">
            Legal &amp; Compliance
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto font-light leading-relaxed">
            How AlpineAce Treks &amp; Expeditions collects, uses, and
            safeguards your personal data during trip planning and high-altitude
            operations.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <PrivacyPolicyContent />

        <div className="flex justify-between items-center text-xs font-semibold text-zinc-700">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/terms"
            className="hover:text-amber-800 transition-colors"
          >
            Terms &amp; Conditions &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
