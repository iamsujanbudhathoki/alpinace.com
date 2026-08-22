import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'About AlpineAce | Our Team, Sherpa Heritage & Values',
  description:
    'AlpineAce is a Sherpa-owned trekking and expedition company based in Kathmandu. Founded in 2012 to combine local expertise with international safety and comfort standards.',
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
  openGraph: {
    title: 'About AlpineAce | Sherpa-Owned, Kathmandu-Based',
    description:
      'AlpineAce is a Sherpa-owned trekking and expedition company based in Kathmandu, founded in 2012.',
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    type: 'website',
  },
};

export default function AboutView() {
  const team = [
    {
      name: 'Chhewang Sherpa',
      role: 'Co-Founder & Lead Expedition Guide',
      desc: 'Nine Everest summits, two K2 ascents, twelve Ama Dablam routes. IFMGA-certified and ropes coordinator for all technical expeditions.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
      badge: 'IFMGA Guide'
    },
    {
      name: 'Pasang Lhamu Sherpa',
      role: 'Operations & Logistics Director',
      desc: 'Manages permits, helicopter charters, lodge bookings, and client itineraries across Khumbu and Annapurna. 12 years coordinating Himalayan operations.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
      badge: 'Operations Lead'
    },
    {
      name: 'Dr. Rajesh Thapa',
      role: 'Chief Medical Officer',
      desc: 'Specialist in high-altitude physiology and emergency medicine. Oversees all medical safety protocols, acclimatization planning, and basecamp health monitoring.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150',
      badge: 'MD, Altitude Medicine'
    }
  ];

  const values = [
    {
      title: 'Sherpa-owned and operated',
      desc: '100% of our leadership and field staff are local Sherpas. Profits from every expedition go back into Sherpa villages — supporting schools, solar infrastructure, and micro-hydro projects.'
    },
    {
      title: 'Environmental responsibility',
      desc: 'All waste is packed out from campsites. We cook with LPG gas instead of firewood, and apply carbon offsets to helicopter flights. Porters are paid fair wages that exceed industry standards.'
    },
    {
      title: 'Quality over volume',
      desc: 'We run a maximum of 30 expeditions per year. That limit exists so we can maintain genuine standards on guide prep, equipment quality, kitchen hygiene, and client communication.'
    }
  ];

  return (
    <div className="pt-20 min-h-screen bg-white text-slate-900 font-sans">

      {/* Page Hero */}
      <section className="py-16 sm:py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1600"
            alt="Prayer flags in front of snow peaks"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/55 to-slate-950/80" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider block mb-3">Our Story</span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
            Founded in Kathmandu.<br />
            Guided by Sherpa expertise.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed max-w-2xl">
            Alpine Ace was started in Thamel in 2012 with a clear goal: offer guided Himalayan treks that meet international safety standards without removing what makes Nepal travel meaningful — local guides, authentic routes, and genuine expertise.
          </p>
        </div>
      </section>

      {/* Story & Values */}
      <section className="py-20 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

            {/* Story */}
            <div className="lg:col-span-6 space-y-5">
              <span className="text-amber-700 text-xs font-semibold uppercase tracking-wider block">Background</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                Twelve years of guided expeditions
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                When we started, most operators in Nepal were either budget teahouse companies or foreign-owned luxury brands that subcontracted local guides. Neither worked well for serious travelers who wanted both comfort and real local knowledge.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                We built AlpineAce around a different model: Sherpa guides who are also shareholders, premium lodge partnerships we've maintained for years, and a hard limit on how many expeditions we run each season. The result is a company where quality is a structural constraint, not a marketing claim.
              </p>

              <div className="pt-4 flex gap-8 border-t border-stone-100">
                <div>
                  <span className="font-heading text-3xl font-extrabold text-slate-900 block">100%</span>
                  <span className="text-slate-600 text-xs font-medium">Sherpa-owned and run</span>
                </div>
                <div>
                  <span className="font-heading text-3xl font-extrabold text-slate-900 block">25+</span>
                  <span className="text-slate-600 text-xs font-medium">Active certified peak guides</span>
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div className="lg:col-span-6 space-y-1">
              <h3 className="font-heading text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider text-xs text-amber-700">
                Our commitments
              </h3>
              <ul className="divide-y divide-stone-100">
                {values.map((v, i) => (
                  <li key={i} className="py-5 flex gap-4 items-start">
                    <span className="text-xs font-bold text-stone-400 w-5 shrink-0 pt-0.5">0{i + 1}</span>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-slate-900 mb-1.5">{v.title}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed font-normal">{v.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-stone-50 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-amber-700 text-xs font-semibold uppercase tracking-wider block mb-2">Leadership</span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
              The team behind your expedition
            </h2>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Our leadership blends field experience at altitude, operational expertise, and medical training.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((t, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full group">
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={t.image}
                    alt={t.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <span className="absolute bottom-3 left-3 bg-slate-950/90 text-amber-300 text-xs font-medium px-2.5 py-1 rounded">
                    {t.badge}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-heading text-sm font-bold text-slate-900 mb-0.5">{t.name}</h3>
                  <span className="text-amber-800 text-xs font-medium block mb-3">{t.role}</span>
                  <p className="text-slate-600 text-xs leading-relaxed font-normal">
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
