"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock, TrendingUp, Star, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/services/api-client";
import { TravelPackage } from "@/lib/home-data";

export function FeaturedPackages() {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await apiClient.get<any[]>("/packages?status=Featured");
        if (Array.isArray(data)) {
          const mapped: TravelPackage[] = data.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            category: p.categoryType || p.category,
            region: p.region,
            durationDays: Number(p.durationDays),
            maxAltitudeMeters: Number(p.maxAltitudeMeters),
            difficulty: p.difficulty,
            priceUSD: Number(p.priceUSD),
            rating: Number(p.rating),
            reviewsCount: Number(p.reviewsCount),
            image: p.image,
            shortDesc: p.shortDesc,
            status: p.status,
          }));
          setPackages(mapped);
        }
      } catch (e) {
        console.warn("Failed to fetch featured packages from backend:", e);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <section className="py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-gold-600 text-xs uppercase tracking-widest font-extrabold block mb-2">
              Bespoke Journeys
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
              Featured Himalayan Experiences
            </h2>
          </div>
          <Link
            href="/trekking"
            className="text-slate-900 hover:text-gold-600 font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-1 mt-4 md:mt-0 transition-colors cursor-pointer"
          >
            <span>Explore All Packages</span>
            <ChevronRight className="h-4 w-4 text-gold-600" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs font-medium">
            Loading Himalayan packages from server...
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-medium">
            No featured packages available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
              >
                <Link href={`/trekking/${pkg.slug}`} className="block">
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-gold-500 text-slate-950 text-xs font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider border border-gold-400">
                      {pkg.category}
                    </div>
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                      <span>{pkg.rating} ({pkg.reviewsCount})</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {pkg.region}
                    </div>
                    <h3 className="font-heading text-base font-bold text-slate-900 leading-snug group-hover:text-gold-600 transition-colors">
                      {pkg.title}
                    </h3>
                    <p className="text-slate-700 text-xs leading-relaxed font-normal line-clamp-2">
                      {pkg.shortDesc}
                    </p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {pkg.durationDays} Days
                      </span>
                      <span className="flex items-center gap-1 text-slate-900">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                        {pkg.maxAltitudeMeters}m
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="p-6 pt-0 border-t border-slate-100 mt-2">
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs font-bold text-slate-700 uppercase">Starting from</span>
                      <div className="text-base font-extrabold text-slate-900">
                        ${pkg.priceUSD.toLocaleString()} <span className="text-xs font-semibold text-slate-700">USD</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/trekking/${pkg.slug}`}>
                        <button className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
                          Details
                        </button>
                      </Link>

                      <Link href="/contact">
                        <button className="bg-gold-500 hover:bg-gold-400 text-slate-950 border border-gold-400 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1">
                          <span>Book</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

