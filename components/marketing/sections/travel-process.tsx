export function TravelProcess() {
  const processSteps = [
    {
      step: "01",
      title: "Bespoke Consultation",
      desc: "Our adventure designers connect on an introductory video call to understand your physical fitness, bucket list dreams, and travel preferences.",
    },
    {
      step: "02",
      title: "Bespoke Itinerary Crafting",
      desc: "We design a detailed day-by-day customized proposal combining trekking routes, luxury lodges, and domestic flight/private helicopter options.",
    },
    {
      step: "03",
      title: "Guided Preparation",
      desc: "Access training plans curated by mountaineers, comprehensive packing lists, visa assistance, and private pre-trip briefing calls.",
    },
    {
      step: "04",
      title: "Legendary Footsteps",
      desc: "Arrive in Kathmandu. Enjoy premium airport transfers, royal heritage stays, and step into the wilderness with elite Sherpa support.",
    },
  ];

  return (
    <section className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
          <span className="text-gold-600 text-xs uppercase tracking-widest font-extrabold block">
            How It Works
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
            Your Journey To The Sky
          </h2>
          <p className="text-slate-600 text-sm font-normal leading-relaxed">
            From our initial custom planning call to boarding your final helicopter, we engineer every step of your Himalayan itinerary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {processSteps.map((step, idx) => (
            <div
              key={idx}
              className="relative bg-slate-50/80 rounded-2xl p-6 border border-slate-200 flex flex-col group hover:border-slate-400 transition-all duration-300"
            >
              <span className="font-heading text-5xl font-extrabold text-amber-500/20 group-hover:text-amber-500/40 transition-colors absolute top-4 right-6 leading-none">
                {step.step}
              </span>
              <h3 className="font-heading text-base font-bold text-slate-900 mt-8 mb-3 pr-8">
                {step.title}
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed font-normal">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
