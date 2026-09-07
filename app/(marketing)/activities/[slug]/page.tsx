import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ActivityService } from "@/lib/services/admin-service";
import { ChevronRight, MapPin, Clock, Mountain, Compass } from "lucide-react";
import { TravelPackage } from "@/lib/home-data";
import { ActivityDetailClient } from "./activity-detail-client";

interface ActivityDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ActivityDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await ActivityService.getBySlug(slug);
    if (!res || !res.data || !res.data.activity) {
      return { title: "Activity Not Found | Alpine Ace" };
    }
    const { activity } = res.data;
    return {
      title: `${activity.name} | Alpine Ace Nepal`,
      description:
        activity.description ||
        `Explore top rated trekking routes, tours, and expeditions for ${activity.name}.`,
    };
  } catch {
    return { title: "Activity Details | Alpine Ace" };
  }
}

export default async function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const { slug } = await params;

  let activityData: any = null;
  try {
    const res = await ActivityService.getBySlug(slug);
    if (res && res.success && res.data) {
      activityData = res.data;
    }
  } catch (e) {
    console.warn("Failed to fetch activity detail server-side:", e);
  }

  if (!activityData || !activityData.activity) {
    notFound();
  }

  const { activity, treks = [], tours = [], expeditions = [] } = activityData;

  // Map backend entities to frontend TravelPackage format
  const mappedTreks: TravelPackage[] = treks.map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category || "Trekking",
    region: p.region,
    durationDays: Number(p.durationDays || 0),
    maxAltitudeMeters: Number(p.maxAltitudeMeters || 0),
    difficulty: p.difficulty,
    priceUSD: Number(p.priceUSD || 0),
    rating: Number(p.rating || 5),
    reviewsCount: Number(p.reviewsCount || 0),
    image: p.image || "/mountain-placeholder.jpg",
    shortDesc: p.shortDesc || "",
    status: p.status,
  }));

  const mappedTours: TravelPackage[] = tours.map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category || "Tour",
    region: p.region,
    durationDays: Number(p.durationDays || 0),
    maxAltitudeMeters: Number(p.maxAltitudeMeters || 0),
    difficulty: p.difficulty,
    priceUSD: Number(p.priceUSD || 0),
    rating: Number(p.rating || 5),
    reviewsCount: Number(p.reviewsCount || 0),
    image: p.image || "/mountain-placeholder.jpg",
    shortDesc: p.shortDesc || "",
    status: p.status,
  }));

  const mappedExpeditions: TravelPackage[] = expeditions.map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category || "Expedition",
    region: p.region,
    durationDays: Number(p.durationDays || 0),
    maxAltitudeMeters: Number(p.maxAltitudeMeters || 0),
    difficulty: p.difficulty,
    priceUSD: Number(p.priceUSD || 0),
    rating: Number(p.rating || 5),
    reviewsCount: Number(p.reviewsCount || 0),
    image: p.image || "/mountain-placeholder.jpg",
    shortDesc: p.shortDesc || "",
    status: p.status,
  }));

  return (
    <div className="bg-stone-50 min-h-screen text-stone-900 font-sans pb-20">
      {/* Activity Hero Banner */}
      <div className="relative bg-stone-900 text-white py-20 sm:py-28 overflow-hidden">
        {activity.image ? (
          <img
            src={activity.image}
            alt={activity.name}
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 opacity-90" />
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-stone-300 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-stone-400">Activities</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-white font-semibold">{activity.name}</span>
          </nav>

          <div className="max-w-3xl space-y-3">
            <span className="inline-block bg-white/10 backdrop-blur-xs text-stone-200 text-xs font-semibold px-3 py-1 rounded-sm uppercase tracking-wider">
              Experience &amp; Activity Hub
            </span>
            <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              {activity.name}
            </h1>
            {activity.description && (
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-normal">
                {activity.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Aggregated Showcase Client Component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <ActivityDetailClient
          activityName={activity.name}
          treks={mappedTreks}
          tours={mappedTours}
          expeditions={mappedExpeditions}
        />
      </div>
    </div>
  );
}
