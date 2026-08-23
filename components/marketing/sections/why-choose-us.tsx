export function WhyChooseUs() {
  const reasons = [
    {
      num: "01",
      title: "Certified Sherpa guides on every expedition",
      desc: "Every trek is led by IFMGA-certified Sherpas carrying pulse oximeters, satellite phones, altitude medicine kits, and portable hyperbaric chambers.",
    },
    {
      num: "02",
      title: "Premium lodges, not cold teahouses",
      desc: "We book boutique mountain lodges with attached heated bathrooms, electric blankets, and freshly prepared meals — across Khumbu, Annapurna, and Langtang.",
    },
    {
      num: "03",
      title: "Fair wages and zero-waste trail policy",
      desc: "Porters are paid above-industry wages. All waste is packed out from campsites. Carbon offsets are applied to every helicopter flight we operate.",
    },
    {
      num: "04",
      title: "Every itinerary built from scratch",
      desc: "We don't run group departures on fixed schedules. Your route, pacing, dietary needs, and rest days are planned specifically around your goals.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-stone-50/50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* Left: Narrative */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-28">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
              Sherpa expertise from start to finish
            </h2>
            <p className="text-stone-700 text-sm leading-relaxed font-normal">
              AlpineAce is 100% Sherpa-owned and based in Thamel, Kathmandu. Our leaders have spent decades guiding high-altitude Himalayan routes. That mountain experience directly informs how we plan your itinerary, safety protocols, and daily trail pacing.
            </p>

            <div className="pt-4 border-t border-stone-200">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 block">100%</span>
                  <span className="text-stone-600 text-xs font-normal mt-0.5 block">Sherpa-owned and Kathmandu based</span>
                </div>
                <div>
                  <span className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 block">25+</span>
                  <span className="text-stone-600 text-xs font-normal mt-0.5 block">Active IFMGA-certified guides</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Clean List */}
          <div className="lg:col-span-7">
            <ul className="divide-y divide-stone-200">
              {reasons.map((item, idx) => (
                <li key={idx} className="py-5 space-y-1">
                  <h3 className="font-heading text-base font-bold text-stone-900">
                    {item.title}
                  </h3>
                  <p className="text-stone-700 text-sm leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
