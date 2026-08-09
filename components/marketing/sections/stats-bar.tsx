import { HOME_STATS } from "@/lib/home-data";

export function StatsBar() {
  return (
    <section className="py-14 bg-amber-500 text-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {HOME_STATS.map((s, index) => (
            <div key={index} className="space-y-1">
              <span className="font-heading text-4xl sm:text-5xl font-extrabold block leading-none">
                {s.number}
              </span>
              <span className="font-heading text-sm font-bold block text-slate-950">
                {s.label}
              </span>
              <span className="text-slate-900 text-xs block font-normal leading-snug">
                {s.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
