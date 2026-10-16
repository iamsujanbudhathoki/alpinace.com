import { Metadata } from "next";
import { Suspense } from "react";
import { BookingPageClient } from "@/components/marketing/booking/booking-page-client";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Book Your Himalayan Adventure | AlpineAce",
  description:
    "Secure your luxury trek, expedition, or cultural tour in the Nepal Himalayas with AlpineAce. Custom group pricing, transparent add-ons, and instant booking confirmation.",
};

function BookingLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center py-24 px-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">
          Loading booking reservation details...
        </p>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingLoadingFallback />}>
      <BookingPageClient />
    </Suspense>
  );
}
