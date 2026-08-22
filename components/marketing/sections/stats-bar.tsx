import { HOME_STATS } from "@/lib/home-data";

export function StatsBar() {
  return (
    <section className="py-10 bg-stone-900 text-white border-y border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {HOME_STATS.map((s, index) => (
            <div key={index} className="space-y-1">
              <span className="font-heading text-3xl sm:text-4xl font-extrabold text-white block leading-none">
                {s.number}
              </span>
              <span className="font-heading text-xs font-semibold text-stone-300 block uppercase tracking-wider">
                {s.label}
              </span>
              <span className="text-stone-300 text-xs block font-medium leading-snug">
                {s.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
