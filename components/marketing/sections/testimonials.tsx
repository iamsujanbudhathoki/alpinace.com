import { Star, ShieldCheck, Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/home-data";

export function TestimonialsSection() {
  // Duplicate array 3 times for smooth, seamless infinite scrolling
  const marqueeItems = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-24 bg-[#fafaf8] border-y border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center space-y-2">
        <span className="text-gold-600 text-xs uppercase tracking-widest font-extrabold block">
          Pioneer Experiences
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
          Stories from High Altitudes
        </h2>
        <p className="text-slate-600 text-sm font-normal max-w-xl mx-auto leading-relaxed">
          Hear directly from explorers who traversed the Himalayas with our multi-summit Sherpa team.
        </p>
      </div>

      {/* Infinite Horizontal X-Axis Auto Slider */}
      <div className="relative w-full overflow-hidden">
        {/* Left & Right Gradient Fade Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#fafaf8] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#fafaf8] to-transparent z-10 pointer-events-none" />

        {/* Sliding X-Axis Track */}
        <div className="animate-marquee-track flex gap-6 px-4">
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="w-[360px] sm:w-[420px] shrink-0 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-gold-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold-500 text-gold-500" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Explorer
                  </span>
                </div>

                {/* Quote */}
                <div className="relative pt-1">
                  <Quote className="w-8 h-8 text-slate-200 absolute -top-3 -left-2 -z-10 opacity-70" />
                  <p className="text-slate-800 text-xs sm:text-sm font-medium leading-relaxed italic">
                    &ldquo;{item.content}&rdquo;
                  </p>
                </div>
              </div>

              {/* Guest Profile Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-6">
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.author}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gold-400"
                  />
                  <div>
                    <h3 className="font-heading text-xs font-bold text-slate-900 leading-none">
                      {item.author}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                      {item.role} &bull; {item.country}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-gold-600 bg-gold-100 px-2.5 py-1 rounded-md">
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
