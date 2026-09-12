"use client";

import Link from "next/link";
import Image from "next/image";
import { TravelPackage } from "@/lib/home-data";

interface ActivityDetailClientProps {
  activityName: string;
  treks: TravelPackage[];
  tours: TravelPackage[];
  expeditions: TravelPackage[];
}

export function ActivityDetailClient({
  activityName,
  treks,
  tours,
  expeditions,
}: ActivityDetailClientProps) {
  const totalCount = treks.length + tours.length + expeditions.length;

  if (totalCount === 0) {
    return (
      <div className="bg-white rounded-sm border border-stone-200 p-12 text-center space-y-3 max-w-lg mx-auto my-6">
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
    );
  }

  const renderPackageGrid = (packages: TravelPackage[], type: "trekking" | "tours" | "expeditions") => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const href =
            type === "tours"
              ? `/tours/${pkg.slug}`
              : type === "expeditions"
              ? `/expeditions/${pkg.slug}`
              : `/trekking/${pkg.slug}`;

          return (
            <div
              key={pkg.id}
              className="bg-white rounded-lg border border-stone-200 overflow-hidden flex flex-col justify-between hover:border-stone-300 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-out group"
            >
              <Link href={href} className="block flex-1 flex flex-col justify-between h-full">
                <div>
                  {/* Image Frame */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                    <Image
                      src={pkg.image || "/mountain-placeholder.jpg"}
                      alt={pkg.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100"
                    />
                    {pkg.region && (
                      <span className="absolute top-3 left-3 badge-muted text-xs">
                        {pkg.region}
                      </span>
                    )}
                    <span className="absolute top-3 right-3 bg-white/90 text-stone-900 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm backdrop-blur-xs">
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

                      <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-stone-600 group-hover:underline transition-colors leading-snug line-clamp-1">
                        {pkg.title}
                      </h3>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-stone-400 block font-medium">From</span>
                        <span className="text-base font-bold text-stone-900">
                          ${pkg.priceUSD ? pkg.priceUSD.toLocaleString() : "0"}{" "}
                          <span className="text-xs font-normal text-stone-500">USD</span>
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-stone-900 group-hover:underline inline-flex items-center gap-1">
                        Explore Route &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Treks Section */}
      {treks.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2.5">
              <Image
                src="/icons/trekking.png"
                alt="Trekking"
                width={28}
                height={28}
                className="object-contain shrink-0"
              />
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">
                Trekking Packages ({treks.length})
              </h2>
            </div>
            <Link
              href="/trekking"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 hover:underline transition-colors"
            >
              View All Treks &rarr;
            </Link>
          </div>
          {renderPackageGrid(treks, "trekking")}
        </section>
      )}

      {/* Tours Section */}
      {tours.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2.5">
              <Image
                src="/icons/tour.png"
                alt="Tours"
                width={28}
                height={28}
                className="object-contain shrink-0"
              />
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">
                Tour Packages ({tours.length})
              </h2>
            </div>
            <Link
              href="/tours"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 hover:underline transition-colors"
            >
              View All Tours &rarr;
            </Link>
          </div>
          {renderPackageGrid(tours, "tours")}
        </section>
      )}

      {/* Expeditions Section */}
      {expeditions.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2.5">
              <Image
                src="/icons/expeditions.png"
                alt="Expeditions"
                width={28}
                height={28}
                className="object-contain shrink-0"
              />
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">
                Expedition Packages ({expeditions.length})
              </h2>
            </div>
            <Link
              href="/expeditions"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 hover:underline transition-colors"
            >
              View All Expeditions &rarr;
            </Link>
          </div>
          {renderPackageGrid(expeditions, "expeditions")}
        </section>
      )}
    </div>
  );
}

