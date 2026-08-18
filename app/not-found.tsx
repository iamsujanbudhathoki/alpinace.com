import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/marketing/layout/site-header";
import { SiteFooter } from "@/components/marketing/layout/site-footer";

export const metadata = {
  title: "404 - Page Not Found | AlpineAce",
  description: "The requested page could not be found.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900 font-sans">
      <SiteHeader />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="max-w-sm w-full space-y-4 mx-auto">
          <p className="text-4xl font-extrabold text-amber-500 tracking-tight">404</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Page not found
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
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
