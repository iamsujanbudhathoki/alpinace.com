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
    <div className="min-h-[60vh] bg-stone-50/50 flex flex-col items-center justify-center py-20 px-4">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
        <p className="text-stone-600 text-sm font-medium">
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
