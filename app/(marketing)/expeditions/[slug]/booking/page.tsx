import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ExpeditionService } from "@/lib/services/admin-service";
import { initialExpeditionsData } from "@/lib/expedition-data";
import { BookingPackageType } from "@/lib/admin-data";
import {
  BookingPageClient,
  BookingTripDetails,
} from "@/components/marketing/booking/booking-page-client";
import { Loader2 } from "lucide-react";

interface ExpeditionBookingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getExpedition(slug: string) {
  try {
    const raw = await ExpeditionService.getBySlug(slug);
    if (raw) return raw;
  } catch (e) {
    console.warn(`Server fetch error for expedition ${slug}:`, e);
  }
  return initialExpeditionsData.find((e) => e.slug === slug) || null;
}

export async function generateMetadata({
  params,
}: ExpeditionBookingPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const expedition = await getExpedition(resolvedParams.slug);

  if (!expedition) {
    return {
      title: "Apply for Himalayan Expedition | AlpineAce",
    };
  }

  return {
    title: `Apply for ${expedition.title} | AlpineAce Mountaineering`,
    description: `Submit your climber application and dates for ${expedition.title} with AlpineAce. 1:1 Sherpa summit support, premium base camp logistics, and gear options.`,
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

export default async function ExpeditionBookingPage({
  params,
}: ExpeditionBookingPageProps) {
  const resolvedParams = await params;
  const expedition = await getExpedition(resolvedParams.slug);

  if (!expedition) {
    notFound();
  }

  const initialTrip: BookingTripDetails = {
    id: expedition.id,
    title: expedition.title,
    slug: expedition.slug,
    region: expedition.region,
    durationDays: expedition.durationDays,
    maxAltitudeMeters: expedition.peakHeightM || expedition.maxAltitudeMeters || 8000,
    difficulty: expedition.difficulty || "Extreme",
    priceUSD: expedition.priceUSD,
    image: expedition.image,
    categoryType: BookingPackageType.EXPEDITION,
    groupPricingEnabled: expedition.groupPricingEnabled,
    groupPricing: expedition.groupPricing,
    addons: expedition.addons,
    departureDates: expedition.departureDates,
  };

  return (
    <Suspense fallback={<BookingLoadingFallback />}>
      <BookingPageClient
        initialSlug={resolvedParams.slug}
        initialType={BookingPackageType.EXPEDITION}
        initialTrip={initialTrip}
      />
    </Suspense>
  );
}
