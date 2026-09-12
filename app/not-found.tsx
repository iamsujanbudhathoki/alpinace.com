import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "404 - Page Not Found | AlpineAce",
  description: "The requested page could not be found.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50/60 text-stone-900 font-sans flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200/80 shadow-xs p-8 sm:p-10 text-center space-y-6">
        {/* Brand Logo */}
        <div className="flex justify-center">
          <Link href="/" className="inline-block transition-opacity hover:opacity-90">
            <Image
              src="/logo.jpg"
              alt="AlpineAce Logo"
              width={140}
              height={56}
              className="h-11 w-auto object-contain rounded-md"
              priority
            />
          </Link>
        </div>

        {/* 404 Heading & Text */}
        <div className="space-y-2 pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
            Error 404
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Page Not Found
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
            Sorry, we couldn’t find the page you’re looking for. It may have been moved or no longer exists.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs px-5 h-10 rounded-lg cursor-pointer transition-colors inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <Link href="/trekking" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs px-5 h-10 rounded-lg cursor-pointer transition-colors inline-flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-stone-500" />
              <span>Explore Treks</span>
            </Button>
          </Link>
        </div>

        {/* Quick Navigation Links */}
        <div className="pt-5 border-t border-stone-100 text-xs space-y-2">
          <p className="font-medium text-stone-500">Popular destinations:</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-stone-700 font-semibold">
            <Link href="/trekking" className="hover:text-stone-950 transition-colors">Trekking</Link>
            <Link href="/tours" className="hover:text-stone-950 transition-colors">Tours</Link>
            <Link href="/expeditions" className="hover:text-stone-950 transition-colors">Expeditions</Link>
            <Link href="/contact" className="hover:text-stone-950 transition-colors">Contact</Link>
          </div>
        </div>

        {/* Machine-Readable Agent Navigation */}
        <nav className="sr-only" aria-label="Machine Readable Site Index">
          <a href="/sitemap.xml">Sitemap</a>
          <a href="/llms.txt">Agent Guidance (llms.txt)</a>
          <a href="/llms-full.txt">Full LLM Context (llms-full.txt)</a>
        </nav>
      </div>
    </div>
  );
}
