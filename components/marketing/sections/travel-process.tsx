import Link from "next/link";

const processSteps = [
  {
    phase: "1. Consultation & Route Selection",
    desc: "Connect directly with our Kathmandu team to review your travel dates, physical fitness, high-altitude experience, and target Himalayan region.",
  },
  {
    phase: "2. Custom Itinerary & Permits",
    desc: "We design a day-by-day itinerary with built-in acclimatization, secure mandatory national park permits, and lock in boutique lodge stays.",
  },
  {
    phase: "3. Pre-Departure Preparation",
    desc: "Receive guide-approved gear lists, altitude conditioning advice, flight details for Lukla/Pokhara, and direct answers to any trail questions.",
  },
  {
    phase: "4. Kathmandu Arrival & Trailhead",
    desc: "Airport greeting, boutique Kathmandu hotel check-in, final gear check with your assigned Sherpa leader, and seamless departure to the mountains.",
  },
];

export function TravelProcess() {
  return (
    <section className="py-16 sm:py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-stone-200 pb-6">
          <div className="space-y-1">
            <span className="text-amber-700 text-xs font-bold uppercase tracking-wider block">
              Trip Preparation &amp; Logistics
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              From Inquiry to Trailhead
            </h2>
          </div>
          <Link
            href="/contact"
            className="text-xs font-semibold text-amber-700 hover:underline"
          >
            Start a Trip Consultation &rarr;
          </Link>
        </div>

        {/* Clean 4-Stage Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((item, idx) => (
            <div key={idx} className="space-y-2 border-l-2 border-amber-700/40 pl-4 py-1">
              <h3 className="font-heading text-base font-bold text-stone-900 leading-snug">
                {item.phase}
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

