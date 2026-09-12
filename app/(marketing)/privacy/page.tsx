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
    <div className="pt-24 min-h-screen bg-white pb-20 font-sans text-stone-900">
      {/* Header Section */}
      <header className="pt-8 pb-10 border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <span className="text-stone-500 text-xs font-semibold uppercase tracking-wider block">
            Legal &amp; Compliance
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-stone-900">
            Privacy Policy
          </h1>
          <p className="text-stone-600 text-base max-w-2xl font-normal leading-relaxed">
            How AlpineAce Treks &amp; Expeditions collects, uses, and safeguards your personal data during trip planning and high-altitude operations.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <PrivacyPolicyContent />

        <div className="pt-8 border-t border-stone-200 flex justify-between items-center text-xs font-semibold text-stone-700">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-stone-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/terms"
            className="hover:text-stone-950 transition-colors"
          >
            Terms &amp; Conditions &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
