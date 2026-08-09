import Link from "next/link";
import { DESTINATIONS } from "@/lib/home-data";

export function DestinationsSection() {
  return (
    <section className="py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
          <span className="text-amber-700 text-sm font-medium block">
            Geography of Wonder
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-zinc-900">
            Iconic Nepal Regions
          </h2>
          <p className="text-zinc-700 text-sm font-normal leading-relaxed">
            From the deep pine forests of the lower valleys to the arid high-altitude tundra bordering Tibet, select your perfect theater of adventure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DESTINATIONS.map((dest) => (
            <Link key={dest.id} href="/trekking">
              <div className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border border-stone-200 hover:border-amber-400/60">
                <div className="absolute inset-0">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                </div>

                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-md w-fit mb-3">
                    {dest.packageCount} itineraries
                  </span>
                  <h3 className="font-heading text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-tight">
                    {dest.name}
                  </h3>
                  <p className="text-slate-200 text-xs font-normal line-clamp-2 mt-2 leading-relaxed opacity-90">
                    {dest.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {dest.highlights.slice(0, 2).map((h, i) => (
                      <span
                        key={i}
                        className="text-xs bg-white/15 text-amber-200 px-2 py-0.5 rounded border border-white/10"
                      >
                        {h}
                      </span>
                    ))}
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
