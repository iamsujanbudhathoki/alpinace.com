import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ActivityService } from "@/lib/services/admin-service";
import { ChevronRight } from "lucide-react";
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
    // Strip HTML tags for clean plain text meta description
    const plainDesc = activity.description
      ? activity.description.replace(/<[^>]*>?/gm, "").slice(0, 160)
      : `Explore top rated trekking routes, tours, and expeditions for ${activity.name}.`;

    return {
      title: `${activity.name} | Alpine Ace Nepal`,
      description: plainDesc,
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
    <div className="bg-stone-50/60 min-h-screen text-stone-900 font-sans pb-20">
      {/* Hero Section - Image Only */}
      <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[480px] bg-stone-900 overflow-hidden">
        {activity.image ? (
          <Image
            src={activity.image}
            alt={activity.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center">
            <span className="text-stone-500 font-heading text-lg tracking-wider uppercase">
              Alpine Ace Experience
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area Below Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-10">
        {/* Breadcrumb & Header Info */}
        <div className="space-y-4 border-b border-stone-200/80 pb-8">
          <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <Link href="/" className="hover:text-stone-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-500">Activities</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 font-semibold">{activity.name}</span>
          </nav>

          <div className="space-y-2">
            
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
              {activity.name}
            </h1>
          </div>
        </div>

        {/* Activity Description (Rich Text) */}
        {activity.description && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              About {activity.name}
            </h2>
            <div
              className="prose prose-slate max-w-none 
                text-stone-800 text-base sm:text-lg leading-[1.85] font-normal
                [&_h1]:font-heading [&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:font-bold [&_h1]:text-stone-950 [&_h1]:mt-8 [&_h1]:mb-4
                [&_h2]:font-heading [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:text-stone-950 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-stone-200
                [&_h3]:font-heading [&_h3]:text-lg [&_h3]:sm:text-xl [&_h3]:font-bold [&_h3]:text-stone-900 [&_h3]:mt-6 [&_h3]:mb-3
                [&_p]:mb-5 [&_p]:leading-relaxed
                [&_blockquote]:border-l-4 [&_blockquote]:border-stone-900 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:bg-stone-100/70 [&_blockquote]:p-4 [&_blockquote]:rounded-r-sm [&_blockquote]:my-6 [&_blockquote]:text-stone-800
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-5 [&_ul]:space-y-2 [&_ul]:marker:text-stone-700
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-5 [&_ol]:space-y-2 [&_ol]:marker:text-stone-900
                [&_li]:text-stone-800 [&_li]:leading-relaxed
                [&_img]:rounded-sm [&_img]:my-8 [&_img]:border [&_img]:border-stone-200 [&_img]:w-full [&_img]:object-cover
                [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-stone-400 [&_a]:hover:decoration-stone-900 [&_a]:font-semibold [&_a]:transition-colors"
              dangerouslySetInnerHTML={{ __html: activity.description }}
            />
          </div>
        )}

        {/* Package Sections (Treks, Tours, Expeditions - Separated & No Filters) */}
        <div className="pt-4 border-t border-stone-200/80">
          <ActivityDetailClient
            activityName={activity.name}
            treks={mappedTreks}
            tours={mappedTours}
            expeditions={mappedExpeditions}
          />
        </div>
      </div>
    </div>
  );
}
