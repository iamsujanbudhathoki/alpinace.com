import React from 'react';

export default function AboutView() {
  const team = [
    {
      name: 'Chhewang Sherpa',
      role: 'Co-Founder & Lead Expedition Leader',
      desc: 'Summitted Mt. Everest 9 times, K2 twice, and Ama Dablam 12 times. Ropes coordinator and IFMGA-certified master guide.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
      badge: 'IFMGA Guide'
    },
    {
      name: 'Pasang Lhamu Sherpa',
      role: 'Operations & Logistics Director',
      desc: 'Expert on high-altitude permit regulations, helicopter charters, and luxury lodge relations in Khumbu and Annapurna.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
      badge: 'Logistics Lead'
    },
    {
      name: 'Dr. Rajesh Thapa',
      role: 'Chief Expedition Medical Officer',
      desc: 'Specialist in high-altitude medicine and emergency physiology. Coordinates medical safety training and basecamp emergency medical desks.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150',
      badge: 'MD Medicine'
    }
  ];

  const values = [
    {
      title: 'Local Empowerment',
      desc: 'Unlike foreign operators, we are 100% Sherpa owned and operated. We allocate substantial profits directly into local Sherpa villages, supporting primary school teachers, solar-power grids, and micro-hydro infrastructure.'
    },
    {
      title: 'Pristine Environmental Ethics',
      desc: 'We operate with strict zero-waste mandates on the trail. We cook with clean LPG gas, remove and recycle all waste from basecamps, and pay our porters high-tier fair wages that exceed industry standards.'
    },
    {
      title: 'Supreme Adventure Craftsmanship',
      desc: 'We focus on quality, not volume. We run a maximum of 30 exclusive expeditions annually to maintain absolute perfection in kitchen hygiene, safety equipment prep, and customized client services.'
    }
  ];

  return (
    <div className="pt-24 min-h-screen bg-stone-50 text-slate-900 font-sans">

      {/* Narrative Header */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1600"
            alt="Prayer flags in front of snow peaks"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/60 to-slate-950/85" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold-400 text-xs uppercase tracking-widest font-extrabold block mb-2">Our Story</span>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Founded on Sherpa Heritage & Absolute Safety
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed max-w-3xl mx-auto">
            Alpine Ace Treks & Expedition was born in Thamel, Kathmandu in 2012. Our goal was simple: to combine the legendary endurance and warmth of local Sherpa guides with international premium travel standards.
          </p>
        </div>
      </section>

      {/* Narrative Section & Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

            {/* Story */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-gold-600 text-xs uppercase tracking-widest font-extrabold block">Bespoke Principles</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">Elevating Mountain Journeys Since 2012</h2>
              <p className="text-slate-700 text-sm leading-relaxed font-light">
                For decades, trekking in Nepal was viewed as a rustic, self-sacrificing endeavor. Travelers endured sub-zero sleepless nights, inadequate nutrition, and high altitude risks. We saw a different path.
              </p>
              <p className="text-slate-700 text-sm leading-relaxed font-light">
                By partnering directly with luxury eco-lodges and investing in world-class expedition safety infrastructure, we proved that high-altitude adventure and supreme luxury can beautifully coexist. Today, we stand as Nepal&rsquo;s premier operator for discerning international tourists seeking pristine service and authentic local expert contact.
              </p>

              <div className="pt-4 flex gap-6">
                <div>
                  <span className="font-heading text-3xl font-extrabold text-slate-900 block">100%</span>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Sherpa Owned & Run</span>
                </div>
                <div className="border-l border-slate-200 pl-6">
                  <span className="font-heading text-3xl font-extrabold text-slate-900 block">25+</span>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Active Peak Guides</span>
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div className="lg:col-span-6 space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Our Core Commitments</h3>
              {values.map((v, i) => (
                <div key={i} className="flex gap-4">
                  <span className="font-heading text-xs font-extrabold text-slate-400 shrink-0 pt-0.5">0{i + 1}</span>
                  <div>
                    <h4 className="font-heading text-sm font-bold text-slate-900 mb-1">{v.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed font-light">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Team section */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-gold-600 text-xs uppercase tracking-widest font-extrabold block mb-2">Our Leaders</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">Meet Your Expedition Directors</h2>
            <p className="text-slate-600 text-sm mt-3 font-light">
              Our leadership team blends legendary mountain survival skill, medical excellence, and elite client services coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((t, idx) => (
              <div key={idx} className="bg-stone-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col h-full hover:shadow-sm transition-all group">
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={t.image}
                    alt={t.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-sm text-gold-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border border-gold-500/20">
                    {t.badge}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-heading text-base font-bold text-slate-900 mb-1">{t.name}</h3>
                  <span className="text-gold-600 text-xs font-semibold uppercase tracking-wider block mb-3">{t.role}</span>
                  <p className="text-slate-600 text-xs leading-relaxed font-light">
                    {t.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
