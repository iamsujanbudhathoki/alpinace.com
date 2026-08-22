"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, TrendingUp, Star, ArrowRight, ArrowUpRight } from "lucide-react";
import { apiClient } from "@/lib/services/api-client";
import { TravelPackage } from "@/lib/home-data";
import { PackageStatus } from "@/lib/admin-data";

type FeaturedTab = "treks" | "tours" | "expeditions";

export function FeaturedPackages() {
  const [activeTab, setActiveTab] = useState<FeaturedTab>("treks");
  const [treks, setTreks] = useState<TravelPackage[]>([]);
  const [tours, setTours] = useState<TravelPackage[]>([]);
  const [expeditions, setExpeditions] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const [treksRes, toursRes, expeditionsRes] = await Promise.all([
          apiClient.get<any[]>(`/treks?status=${PackageStatus.FEATURED}`),
          apiClient.get<any[]>(`/tours?status=${PackageStatus.FEATURED}`),
          apiClient.get<any[]>(`/expeditions?status=${PackageStatus.FEATURED}`),
        ]);

        const rawTreks = treksRes && treksRes.success && Array.isArray(treksRes.data) ? treksRes.data : [];
        const rawTours = toursRes && toursRes.success && Array.isArray(toursRes.data) ? toursRes.data : [];
        const rawExpeditions = expeditionsRes && expeditionsRes.success && Array.isArray(expeditionsRes.data) ? expeditionsRes.data : [];

        const mappedTreks: TravelPackage[] = rawTreks.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.categoryType || p.category || "Trekking",
          region: p.region,
          durationDays: Number(p.durationDays || 0),
          maxAltitudeMeters: Number(p.maxAltitudeMeters || 0),
          difficulty: p.difficulty,
          priceUSD: Number(p.priceUSD || 0),
          rating: Number(p.rating || 5),
          reviewsCount: Number(p.reviewsCount || 0),
          image: p.image,
          shortDesc: p.shortDesc,
          status: p.status,
        }));

        const mappedTours: TravelPackage[] = rawTours.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.categoryType || p.category || "Tour",
          region: p.region,
          durationDays: Number(p.durationDays || 0),
          maxAltitudeMeters: Number(p.maxAltitudeMeters || p.peakHeightM || 0),
          difficulty: p.difficulty,
          priceUSD: Number(p.priceUSD || 0),
          rating: Number(p.rating || 5),
          reviewsCount: Number(p.reviewsCount || 0),
          image: p.image,
          shortDesc: p.shortDesc,
          status: p.status,
        }));

        const mappedExpeditions: TravelPackage[] = rawExpeditions.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          region: p.region,
          durationDays: Number(p.durationDays || 0),
          maxAltitudeMeters: Number(p.maxAltitudeMeters || p.peakHeightM || 0),
          difficulty: p.difficulty,
          priceUSD: Number(p.priceUSD || 0),
          rating: Number(p.rating || 5),
          reviewsCount: Number(p.reviewsCount || 0),
          image: p.image,
          shortDesc: p.shortDesc,
          status: p.status,
        }));

        setTreks(mappedTreks);
        setTours(mappedTours);
        setExpeditions(mappedExpeditions);
      } catch (e) {
        console.warn("Failed to fetch featured packages from backend:", e);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const getPackageLink = (pkg: TravelPackage, tab: FeaturedTab) => {
    if (tab === "tours") return `/tours/${pkg.slug}`;
    if (tab === "expeditions") return `/expeditions/${pkg.slug}`;
    return `/trekking/${pkg.slug}`;
  };

  const getExploreAllLink = (tab: FeaturedTab) => {
    switch (tab) {
      case "tours":
        return { href: "/tours", label: "View All Tours" };
      case "expeditions":
        return { href: "/expeditions", label: "View All Expeditions" };
      case "treks":
      default:
        return { href: "/trekking", label: "View All Treks" };
    }
  };

  const currentPackages =
    activeTab === "treks"
      ? treks
      : activeTab === "tours"
      ? tours
      : expeditions;

  const exploreInfo = getExploreAllLink(activeTab);

  const tabs: { key: FeaturedTab; label: string; count: number }[] = [
    { key: "treks", label: "Treks", count: treks.length },
    { key: "tours", label: "Tours", count: tours.length },
    { key: "expeditions", label: "Expeditions", count: expeditions.length },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Title on Left, Tabs Aligned on Right */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-stone-100 mb-10">
          <div className="space-y-2">
            <span className="text-amber-800 text-xs font-bold uppercase tracking-wider block">
              Curated Itineraries
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              Featured Himalayan Experiences
            </h2>
            <p className="text-stone-500 text-sm max-w-xl leading-relaxed">
              Hand-picked alpine expeditions, iconic high-pass circuits, and cultural journeys through Nepal.
            </p>
          </div>

          {/* Right-Aligned Segmented Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-xl border border-stone-200/80 self-start lg:self-end">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white text-stone-900 shadow-xs border border-stone-200/60"
                      : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <span>{tab.label}</span>
                  {!loading && tab.count > 0 && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        isActive
                          ? "bg-amber-100 text-amber-900"
                          : "bg-stone-200/70 text-stone-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-stone-50/50 rounded-2xl border border-stone-200 p-4 space-y-4 animate-pulse"
              >
                <div className="h-60 bg-stone-200 rounded-xl w-full" />
                <div className="h-4 bg-stone-200 rounded w-1/3" />
                <div className="h-5 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : currentPackages.length === 0 ? (
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-12 text-center space-y-3">
            <p className="text-sm font-medium text-stone-600">
              No featured {activeTab} available at this moment.
            </p>
            <Link
              href={exploreInfo.href}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:underline"
            >
              <span>{exploreInfo.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentPackages.map((pkg) => {
              const packageHref = getPackageLink(pkg, activeTab);

              return (
                <Link
                  key={pkg.id}
                  href={packageHref}
                  className="group flex flex-col bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-stone-300 transition-all duration-200 cursor-pointer"
                >
                  {/* Image Frame */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                    <img
                      src={pkg.image || "/mountain-placeholder.jpg"}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Minimal Top Badges */}
                    {pkg.region && (
                      <div className="absolute top-3.5 left-3.5 bg-white/90 backdrop-blur-sm text-stone-900 text-xs font-bold px-2.5 py-1 rounded-lg border border-stone-200/60 shadow-xs">
                        {pkg.region}
                      </div>
                    )}

                    <div className="absolute top-3.5 right-3.5 bg-stone-900/85 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{pkg.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {pkg.difficulty && (
                        <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                          {pkg.difficulty}
                        </div>
                      )}
                      <h3 className="font-heading text-lg font-bold text-stone-900 leading-snug group-hover:text-amber-800 transition-colors line-clamp-2">
                        {pkg.title}
                      </h3>
                      {pkg.shortDesc && (
                        <p className="text-stone-500 text-xs leading-relaxed font-normal line-clamp-2">
                          {pkg.shortDesc.replace(/<[^>]*>?/gm, "")}
                        </p>
                      )}
                    </div>

                    {/* Metadata & Pricing Footer */}
                    <div className="pt-4 border-t border-stone-100 space-y-3">
                      <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          {pkg.durationDays} Days
                        </span>
                        {pkg.maxAltitudeMeters > 0 && (
                          <span className="flex items-center gap-1.5 text-stone-700 font-semibold">
                            <TrendingUp className="w-3.5 h-3.5 text-stone-400" />
                            {pkg.maxAltitudeMeters.toLocaleString()}m
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-xs uppercase font-semibold text-stone-500 tracking-wider block">
                            From
                          </span>
                          <span className="text-base font-extrabold text-stone-900">
                            ${pkg.priceUSD.toLocaleString()}{" "}
                            <span className="text-xs font-semibold text-stone-500">USD</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom Explore All CTA */}
        <div className="mt-12 text-center">
          <Link
            href={exploreInfo.href}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer group"
          >
            <span>{exploreInfo.label}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
