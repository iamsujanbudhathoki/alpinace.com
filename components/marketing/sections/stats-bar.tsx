import { HOME_STATS } from "@/lib/home-data";

export function StatsBar() {
  const stats =
    HOME_STATS.length > 0
      ? HOME_STATS
      : [
          { number: "100%", label: "Sherpa Owned", desc: "Based in Thamel, Kathmandu" },
          { number: "25+", label: "IFMGA Guides", desc: "Certified high-altitude leaders" },
          { number: "12+", label: "Years Operating", desc: "Guiding Himalayan circuits" },
          { number: "100%", label: "Safety Protocols", desc: "Oximeters & hyperbaric readiness" },
        ];

  return (
    <section className="py-12 bg-stone-900 text-white border-y border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((s, index) => (
            <div key={index} className="space-y-1">
              <span className="font-heading text-2xl sm:text-3xl font-bold text-amber-400 block leading-none">
                {s.number}
              </span>
              <span className="font-heading text-xs font-semibold text-stone-200 block tracking-wide">
                {s.label}
              </span>
              <span className="text-stone-400 text-xs block font-normal leading-snug">
                {s.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
