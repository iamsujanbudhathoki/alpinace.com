import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/home-data";

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
          <span className="text-amber-400 text-xs uppercase tracking-widest font-extrabold block">
            Mountain Testimonials
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            Words From Our Pioneers
          </h2>
          <p className="text-slate-300 text-sm font-normal leading-relaxed">
            We measure our luxury standard by the deep spiritual connections and lasting trust we build with our international guests.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 flex flex-col h-full hover:border-amber-400/40 transition-all"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4 text-amber-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-slate-200 text-xs leading-relaxed italic flex-grow font-normal mb-6">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Profile info */}
              <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                />
                <div>
                  <h3 className="font-heading text-sm font-bold text-white">{t.author}</h3>
                  <p className="text-slate-400 text-[11px] font-mono leading-none">
                    {t.role} &mdash; {t.country}
                  </p>
                  <span className="text-amber-400 text-[10px] uppercase font-semibold tracking-wider block mt-1">
                    Trip: {t.tripName}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
