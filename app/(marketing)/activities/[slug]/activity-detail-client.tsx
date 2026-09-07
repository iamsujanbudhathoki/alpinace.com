"use client";

import { useState } from "react";
import Link from "next/link";
import { TravelPackage } from "@/lib/home-data";
import { ArrowRight, Mountain, Compass, MapPin } from "lucide-react";

interface ActivityDetailClientProps {
  activityName: string;
  treks: TravelPackage[];
  tours: TravelPackage[];
  expeditions: TravelPackage[];
}

type TabType = "all" | "treks" | "tours" | "expeditions";

export function ActivityDetailClient({
  activityName,
  treks,
  tours,
  expeditions,
}: ActivityDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const totalCount = treks.length + tours.length + expeditions.length;

  const getFilteredPackages = () => {
    switch (activeTab) {
      case "treks":
        return treks.map((t) => ({ ...t, type: "trekking" }));
      case "tours":
        return tours.map((t) => ({ ...t, type: "tours" }));
      case "expeditions":
        return expeditions.map((e) => ({ ...e, type: "expeditions" }));
      case "all":
      default:
        return [
          ...treks.map((t) => ({ ...t, type: "trekking" })),
          ...tours.map((t) => ({ ...t, type: "tours" })),
          ...expeditions.map((e) => ({ ...e, type: "expeditions" })),
        ];
    }
  };

  const filteredPackages = getFilteredPackages();

  const getPackageHref = (pkg: TravelPackage & { type: string }) => {
    if (pkg.type === "tours") return `/tours/${pkg.slug}`;
    if (pkg.type === "expeditions") return `/expeditions/${pkg.slug}`;
    return `/trekking/${pkg.slug}`;
  };

  return (
    <div className="space-y-8">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
              activeTab === "all"
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
            }`}
          >
            All Packages ({totalCount})
          </button>

          <button
            onClick={() => setActiveTab("treks")}
            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === "treks"
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Trekkings ({treks.length})
          </button>

          <button
            onClick={() => setActiveTab("tours")}
            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === "tours"
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Tours ({tours.length})
          </button>

          <button
            onClick={() => setActiveTab("expeditions")}
            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === "expeditions"
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
            }`}
          >
            <Mountain className="w-3.5 h-3.5" /> Expeditions ({expeditions.length})
          </button>
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Showing <span className="text-stone-900 font-bold">{filteredPackages.length}</span> itineraries for {activityName}
        </div>
      </div>

      {/* Packages Grid */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white rounded-sm border border-stone-200 p-12 text-center space-y-3 max-w-lg mx-auto my-12">
          <p className="text-sm text-stone-600 font-medium">
            No active routes or itineraries linked to <strong>{activityName}</strong> yet.
          </p>
          <p className="text-xs text-stone-400">
            Check back soon or explore our complete catalog of trekking and tour packages.
          </p>
          <div className="pt-2">
            <Link
              href="/trekking"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 px-4 py-2 rounded-sm transition-colors"
            >
              Explore All Treks &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const href = getPackageHref(pkg);

            return (
              <Link
                key={pkg.id}
                href={href}
                className="group flex flex-col bg-white rounded-sm border border-stone-200 hover:border-stone-400 transition-all duration-300 overflow-hidden shadow-2xs hover:shadow-md"
              >
                {/* Image Frame */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                  <img
                    src={pkg.image || "/mountain-placeholder.jpg"}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100"
                  />
                  {pkg.region && (
                    <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm tracking-wide">
                      {pkg.region}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 text-stone-900 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm backdrop-blur-xs">
                    {pkg.category}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                      <span>{pkg.durationDays} Days</span>
                      {pkg.maxAltitudeMeters > 0 && (
                        <span>{pkg.maxAltitudeMeters.toLocaleString()}m altitude</span>
                      )}
                    </div>

                    <h3 className="font-heading text-base font-bold text-stone-900 group-hover:text-stone-600 transition-colors leading-snug line-clamp-1">
                      {pkg.title}
                    </h3>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-stone-400 block font-medium">From</span>
                      <span className="text-base font-bold text-stone-900">
                        ${pkg.priceUSD ? pkg.priceUSD.toLocaleString() : "0"} <span className="text-xs font-normal text-stone-500">USD</span>
                      </span>
                    </div>

                    <span className="text-xs font-medium text-stone-900 group-hover:underline inline-flex items-center gap-1">
                      Explore Route &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
