import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "404 - Page Not Found | AlpineAce",
  description: "The requested page could not be found.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 font-sans px-4 py-16">
      <main className="w-full max-w-md space-y-6 text-center mx-auto">
        <p className="text-5xl font-extrabold text-amber-500 tracking-tight">404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.
        </p>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link href="/">
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-5 h-10 rounded-lg cursor-pointer transition-colors"
            >
              Go back home
            </Button>
          </Link>
          <Link href="/trekking">
            <Button
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs px-5 h-10 rounded-lg cursor-pointer transition-colors"
            >
              Browse treks
            </Button>
          </Link>
        </div>

        {/* Clean User-Friendly Navigation Links */}
        <div className="pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">Looking for something specific?</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-700 font-medium">
            <Link href="/trekking" className="hover:text-amber-600 transition-colors">Trekking</Link>
            <Link href="/tours" className="hover:text-amber-600 transition-colors">Tours</Link>
            <Link href="/expeditions" className="hover:text-amber-600 transition-colors">Expeditions</Link>
            <Link href="/contact" className="hover:text-amber-600 transition-colors">Contact</Link>
          </div>
        </div>

        {/* Machine-Readable Agent Navigation (Accessible to bots/crawlers without cluttering UI) */}
        <nav className="sr-only" aria-label="Machine Readable Site Index">
          <a href="/sitemap.xml">Sitemap</a>
          <a href="/llms.txt">Agent Guidance (llms.txt)</a>
          <a href="/llms-full.txt">Full LLM Context (llms-full.txt)</a>
        </nav>
      </main>
    </div>
  );
}
