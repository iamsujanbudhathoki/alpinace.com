"use client";

import Link from "next/link";

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
    <section className="py-14 bg-white border-t border-[#E6E0D5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h3 className="font-heading text-xl font-bold text-[#1E2420] mb-6">
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trips.map((p) => (
            <Link key={p.id} href={`${categoryPath}/${p.slug}`}>
              <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl overflow-hidden group hover:border-[#D9D3C7] transition-all">
                <div className="aspect-16/10 w-full overflow-hidden bg-[#16221B]">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-1.5">
                  <span className="text-[11px] font-bold text-[#2D4536] uppercase tracking-wider block">
                    {p.region ? `${p.region} • ` : ""}
                    {p.durationDays} Days
                  </span>
                  <h4 className="font-heading text-sm font-bold text-[#1E2420] line-clamp-1 group-hover:text-[#2D4536] transition-colors">
                    {p.title}
                  </h4>
                  {p.shortDesc && (
                    <p className="text-xs text-[#6B726C] line-clamp-2 leading-relaxed">
                      {p.shortDesc}
                    </p>
                  )}
                  <span className="text-xs font-bold text-[#1E2420] block pt-1">
                    From ${Number(p.priceUSD).toLocaleString()} USD
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
