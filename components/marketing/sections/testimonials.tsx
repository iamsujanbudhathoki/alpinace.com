import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/home-data";

export function TestimonialsSection() {
  const marqueeItems = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-24 bg-stone-50/80 border-y border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center space-y-2">
        <span className="text-amber-700 text-sm font-medium block">
          Pioneer Experiences
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-zinc-900">
          Stories from High Altitudes
        </h2>
        <p className="text-zinc-700 text-sm font-normal max-w-xl mx-auto leading-relaxed">
          Hear directly from explorers who traversed the Himalayas with our multi-summit Sherpa team.
        </p>
      </div>

      {/* Infinite Horizontal X-Axis Auto Slider */}
      <div className="relative w-full overflow-hidden">
        {/* Left & Right Gradient Fade Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-stone-50/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-stone-50/90 to-transparent z-10 pointer-events-none" />

        {/* Sliding X-Axis Track */}
        <div className="animate-marquee-track flex gap-6 px-4">
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="w-[360px] sm:w-[420px] shrink-0 bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-gold-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                    ))}
                  </div>
                  <span className="bg-amber-50 text-xs font-medium text-amber-900 px-2.5 py-0.5 rounded-md border border-amber-200">
                    Verified Explorer
                  </span>
                </div>

                {/* Quote */}
                <p className="text-zinc-800 text-xs sm:text-sm font-medium leading-relaxed italic pt-1">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              {/* Guest Profile Footer */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-6">
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.author}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  />
                  <div>
                    <h3 className="font-heading text-xs font-bold text-zinc-900 leading-none">
                      {item.author}
                    </h3>
                    <p className="text-xs text-zinc-600 font-semibold mt-1">
                      {item.role} &bull; {item.country}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                  {item.tripName.split(" ")[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
