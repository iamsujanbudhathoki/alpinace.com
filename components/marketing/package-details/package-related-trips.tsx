"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface RelatedTripItem {
  id: string;
  title: string;
  slug: string;
  region?: string;
  durationDays: number;
  priceUSD: number;
  shortDesc?: string;
  image: string;
}

export interface PackageRelatedTripsProps {
  trips: RelatedTripItem[];
  categoryPath: string;
  title?: string;
}

export function PackageRelatedTrips({
  trips,
  categoryPath,
  title = "Other Recommended Himalayan Journeys",
}: PackageRelatedTripsProps) {
  if (!trips || trips.length === 0) return null;

  return (
    <section className="py-10 bg-white border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between gap-4 mb-6 pb-3 border-b border-stone-200">
          <div>
            <span className="type-caption text-amber-800 font-bold block mb-0.5">
              Explore More
            </span>
            <h2 className="type-heading-xl">
              {title}
            </h2>
          </div>
          <Link
            href={categoryPath}
            className="inline-flex items-center gap-1.5 type-caption text-stone-600 hover:text-stone-900 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" strokeWidth={2} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {trips.map((p) => (
            <Link key={p.id} href={`${categoryPath}/${p.slug}`} className="group block">
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden group-hover:border-stone-400 group-hover:shadow-md transition-all">
                <div className="aspect-16/10 w-full overflow-hidden bg-stone-100 relative">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-stone-950/80 backdrop-blur-xs text-white type-caption px-2 py-0.5 rounded-full border border-white/10">
                    {p.region ? `${p.region} • ` : ""}{p.durationDays} Days
                  </div>
                </div>
                <div className="p-4 space-y-1.5">
                  <h3 className="type-heading-md text-stone-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
                    {p.title}
                  </h3>
                  {p.shortDesc && (
                    <p className="type-body-sm text-stone-600 line-clamp-2 leading-relaxed">
                      {p.shortDesc.replace(/<[^>]*>?/gm, "")}
                    </p>
                  )}
                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                    <span className="type-caption text-stone-500">Starting from</span>
                    <span className="type-heading-md text-stone-900">
                      ${Number(p.priceUSD).toLocaleString()}{" "}
                      <span className="text-xs font-normal text-stone-500">USD</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
