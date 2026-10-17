import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TrekService } from "@/lib/services/admin-service";
import { initialTreksData } from "@/lib/trek-data";
import { BookingPackageType } from "@/lib/admin-data";
import {
  BookingPageClient,
  BookingTripDetails,
} from "@/components/marketing/booking/booking-page-client";
import { Loader2 } from "lucide-react";

interface TrekBookingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getTrek(slug: string) {
  try {
    const item = await TrekService.getBySlug(slug);
    if (item) return item;
  } catch (e) {
    console.warn(`Server fetch error for trek ${slug}:`, e);
  }
  return initialTreksData.find((t) => t.slug === slug) || null;
}

export async function generateMetadata({
  params,
}: TrekBookingPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const trek = await getTrek(resolvedParams.slug);

  if (!trek) {
    return {
      title: "Book Himalayan Trek | AlpineAce",
    };
  }

  return {
    title: `Book ${trek.title} | AlpineAce Himalayan Luxury`,
    description: `Reserve your dates for ${trek.title} with AlpineAce. Custom group pricing, authentic mountain lodges, and transparent trip add-ons.`,
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

export default async function TrekBookingPage({ params }: TrekBookingPageProps) {
  const resolvedParams = await params;
  const trek = await getTrek(resolvedParams.slug);

  if (!trek) {
    notFound();
  }

  const initialTrip: BookingTripDetails = {
    id: trek.id,
    title: trek.title,
    slug: trek.slug,
    region: trek.region,
    durationDays: trek.durationDays,
    maxAltitudeMeters: trek.maxAltitudeMeters,
    difficulty: trek.difficulty,
    priceUSD: trek.priceUSD,
    image: trek.image,
    categoryType: BookingPackageType.TREKKING,
    groupPricingEnabled: trek.groupPricingEnabled,
    groupPricing: trek.groupPricing,
    addons: trek.addons,
    departureDates: trek.departureDates,
  };

  return (
    <Suspense fallback={<BookingLoadingFallback />}>
      <BookingPageClient
        initialSlug={resolvedParams.slug}
        initialType={BookingPackageType.TREKKING}
        initialTrip={initialTrip}
      />
    </Suspense>
  );
}
