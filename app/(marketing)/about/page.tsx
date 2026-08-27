import type { Metadata } from 'next';
import { generateStaticMetadata } from '@/lib/seo';
import { AssociatesSection } from '@/components/marketing/associates-section';

export function generateMetadata(): Metadata {
  return generateStaticMetadata({
    title: 'About AlpineAce | Our Team, Sherpa Heritage & Values',
    description:
      'AlpineAce is a Sherpa-owned trekking and expedition company based in Thamel, Kathmandu. Founded in 2012 to combine local Sherpa expertise with international safety standards.',
    path: '/about',
    keywords: [
      'About AlpineAce',
      'Sherpa owned trek company',
      'Kathmandu trekking agency',
      'IFMGA Sherpa guides',
      'Himalayan trekking team',
    ],
  });
}

const DEFAULT_TEAM = [
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

export default async function AboutView() {
  let team = DEFAULT_TEAM;

  try {
    const { adminTeamsApi, TeamMemberItem } = await import('@/lib/services/admin-service');
    const res = await adminTeamsApi.getAll({ status: 'active' });
    if (res.items && res.items.length > 0) {
      team = res.items.map((m: any) => ({
        name: m.name,
        role: m.role,
        desc: m.bio || 'Experienced Himalayan expedition specialist.',
        image: m.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
        badge: m.experience || 'Sherpa Team',
      }));
    }
  } catch (e) {
    console.warn('Failed to fetch team members for about page:', e);
  }

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
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/60 to-slate-950/85" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
            Sherpa-guided treks planned from Kathmandu.
          </h1>
          <p className="text-slate-200 text-base sm:text-lg font-normal leading-relaxed max-w-2xl">
            AlpineAce was founded in Thamel in 2012 with a clear commitment: deliver high-altitude Himalayan expeditions that combine certified mountain guides with safety logistics and authentic local hospitality.
          </p>
        </div>
      </section>

      {/* Story & Values */}
      <section className="py-16 sm:py-20 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

            {/* Story */}
            <div className="lg:col-span-6 space-y-4">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                Twelve years of guided expeditions
              </h2>
              <p className="text-stone-700 text-sm leading-relaxed">
                When we started, most operators in Nepal were either budget teahouse companies or foreign-owned luxury brands that subcontracted local guides. Neither worked well for serious travelers who wanted both comfort and real local knowledge.
              </p>
              <p className="text-stone-700 text-sm leading-relaxed">
                We built AlpineAce around a direct model: Sherpa guides who lead every expedition, long-standing mountain lodge partnerships, and clear safety protocols. The result is a company focused entirely on trip quality and trekker safety.
              </p>

              <div className="pt-4 flex gap-8 border-t border-stone-200">
                <div>
                  <span className="font-heading text-3xl font-bold text-stone-900 block">100%</span>
                  <span className="text-stone-600 text-xs font-semibold mt-0.5 block">Sherpa owned &amp; operated</span>
                </div>
                <div>
                  <span className="font-heading text-3xl font-bold text-stone-900 block">25+</span>
                  <span className="text-stone-600 text-xs font-semibold mt-0.5 block">Active IFMGA guides</span>
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div className="lg:col-span-6 space-y-1">
              <h3 className="font-heading text-base font-bold text-stone-900 mb-4 pb-2 border-b border-stone-200">
                Our commitments
              </h3>
              <ul className="divide-y divide-stone-200">
                {values.map((v, i) => (
                  <li key={i} className="py-4 space-y-1">
                    <h4 className="font-heading text-sm font-bold text-stone-900">{v.title}</h4>
                    <p className="text-stone-700 text-sm leading-relaxed font-normal">{v.desc}</p>
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

      {/* Official Partners & Affiliations */}
      <AssociatesSection />
    </div>
  );
}
