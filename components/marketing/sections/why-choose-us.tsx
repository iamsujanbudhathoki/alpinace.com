export function WhyChooseUs() {
  const pillars = [
    {
      title: "IFMGA-Certified Sherpa Leaders",
      desc: "Every expedition is led by experienced Sherpa guides equipped with oximeters, satellite comms, emergency oxygen, and medical kits.",
    },
    {
      title: "Boutique Mountain Lodges",
      desc: "Comfortable lodges featuring attached heated bathrooms, electric blankets, and fresh hygienic meals across Khumbu and Annapurna.",
    },
    {
      title: "Fair Wages & Eco Trail Ethics",
      desc: "Above-industry porter wages, insurance, zero-waste campsite rules, and carbon-offset helicopter charters.",
    },
    {
      title: "Private Departures & Custom Pacing",
      desc: "No overcrowded mass tours. Route pacing, rest days, and acclimatization planned specifically around your goals.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Brand & Proof Metrics */}
          <div className="lg:col-span-5 space-y-5">
            <span className="text-amber-700 text-xs font-semibold uppercase tracking-wider block">
              Sherpa Heritage &amp; Safety
            </span>

            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
              Sherpa expertise from Kathmandu to the summit.
            </h2>

            <p className="text-stone-600 text-sm leading-relaxed font-normal">
              100% Sherpa-owned and based in Thamel, Kathmandu. Decades of high-altitude Himalayan experience inform every route we plan.
            </p>

            {/* Proof Metrics Grid */}
            <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-4">
              <div>
                <span className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 block">100%</span>
                <span className="text-stone-500 text-xs font-medium block">Sherpa-owned</span>
              </div>
              <div>
                <span className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 block">25+</span>
                <span className="text-stone-500 text-xs font-medium block">Certified Guides</span>
              </div>
              <div>
                <span className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 block">12+</span>
                <span className="text-stone-500 text-xs font-medium block">Years Guiding</span>
              </div>
              <div>
                <span className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 block">1:1</span>
                <span className="text-stone-500 text-xs font-medium block">High-Peak Ratio</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Pillar Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((item, idx) => (
              <div key={idx} className="bg-stone-50 p-5 rounded-sm border border-stone-200 space-y-1.5">
                <h3 className="font-heading text-sm sm:text-base font-bold text-stone-900">
                  {item.title}
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
