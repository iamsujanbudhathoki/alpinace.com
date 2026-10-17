import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TourService } from "@/lib/services/admin-service";
import { initialToursData } from "@/lib/tour-data";
import { BookingPackageType } from "@/lib/admin-data";
import {
  BookingPageClient,
  BookingTripDetails,
} from "@/components/marketing/booking/booking-page-client";
import { Loader2 } from "lucide-react";

interface TourBookingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getTour(slug: string) {
  try {
    const raw = await TourService.getBySlug(slug);
    if (raw) return raw;
  } catch (e) {
    console.warn(`Server fetch error for tour ${slug}:`, e);
  }
  return initialToursData.find((t) => t.slug === slug) || null;
}

export async function generateMetadata({
  params,
}: TourBookingPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tour = await getTour(resolvedParams.slug);

  if (!tour) {
    return {
      title: "Book Nepal Tour | AlpineAce",
    };
  }

  return {
    title: `Book ${tour.title} | AlpineAce Private Cultural Tours`,
    description: `Reserve your private luxury departure for ${tour.title} with AlpineAce. Handpicked boutique heritage hotels and custom cultural add-ons.`,
  };
}

function BookingLoadingFallback() {
  return (
    <div className="min-h-[60vh] bg-stone-50/50 flex flex-col items-center justify-center py-20 px-4">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
        <p className="text-stone-600 text-sm font-medium">
          Loading reservation details...
        </p>
      </div>
    </div>
  );
}

export default async function TourBookingPage({ params }: TourBookingPageProps) {
  const resolvedParams = await params;
  const tour = await getTour(resolvedParams.slug);

  if (!tour) {
    notFound();
  }

  const initialTrip: BookingTripDetails = {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    region: tour.region,
    durationDays: tour.durationDays,
    maxAltitudeMeters: tour.maxAltitudeMeters || 1400,
    difficulty: tour.difficulty || "Easy",
    priceUSD: tour.priceUSD,
    image: tour.image,
    categoryType: BookingPackageType.TOUR,
    groupPricingEnabled: tour.groupPricingEnabled,
    groupPricing: tour.groupPricing,
    addons: tour.addons,
    departureDates: tour.departureDates,
  };

  return (
    <Suspense fallback={<BookingLoadingFallback />}>
      <BookingPageClient
        initialSlug={resolvedParams.slug}
        initialType={BookingPackageType.TOUR}
        initialTrip={initialTrip}
      />
    </Suspense>
  );
}
