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
    <section className="py-20 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

          {/* Left: Narrative */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-28">
            <span className="text-amber-700 text-xs font-semibold uppercase tracking-wider block">
              Why travel with us
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
              Built on local Sherpa expertise — not outsourced to third parties
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed">
              We are 100% Sherpa-owned and operated from Kathmandu. Our team has lived and worked at altitude for decades. That experience is the difference between a trek that goes smoothly and one that doesn't.
            </p>

            <div className="pt-4 border-t border-stone-100">
              <div className="flex gap-8">
                <div>
                  <span className="font-heading text-2xl font-extrabold text-zinc-900 block">1:1</span>
                  <span className="text-zinc-600 text-xs font-medium">Guide-to-client ratio on mountaineering routes</span>
                </div>
                <div>
                  <span className="font-heading text-2xl font-extrabold text-zinc-900 block">25+</span>
                  <span className="text-zinc-600 text-xs font-medium">Active IFMGA-certified Sherpa guides</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Clean List */}
          <div className="lg:col-span-7">
            <ul className="divide-y divide-stone-100">
              {reasons.map((item) => (
                <li key={item.num} className="py-6 flex gap-5 items-start">
                  <span className="text-xs font-bold text-stone-400 w-6 shrink-0 pt-0.5">
                    {item.num}
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="font-heading text-sm font-bold text-zinc-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-zinc-600 text-sm leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
