import { generateStaticMetadata, normalizeImageUrl } from "@/lib/seo";
import { AboutUsData, AboutUsService, adminTeamsApi } from "@/lib/services/admin-service";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const aboutData: AboutUsData | null = await AboutUsService.getPublic();

  const title =
    aboutData?.metaTitle?.trim() ||
    aboutData?.heroTitle?.trim() ||
    "About AlpineAce | Our Team, Sherpa Heritage & Values";

  const description =
    aboutData?.metaDescription?.trim() ||
    aboutData?.heroSubtitle?.trim() ||
    "AlpineAce is a Sherpa-owned trekking and expedition company based in Thamel, Kathmandu. Founded in 2012 to combine local Sherpa expertise with international safety standards.";

  const keywords = aboutData?.metaKeywords
    ? aboutData.metaKeywords.split(",").map((s) => s.trim()).filter(Boolean)
    : [
        "About AlpineAce",
        "Sherpa owned trek company",
        "Kathmandu trekking agency",
        "IFMGA Sherpa guides",
        "Himalayan trekking team",
      ];

  const featuredImg = aboutData?.heroImage || aboutData?.storyImage;

  const meta = generateStaticMetadata({
    title,
    description,
    path: "/about",
    keywords,
  });

  if (featuredImg) {
    const formattedOgImage = normalizeImageUrl(featuredImg);
    meta.openGraph = {
      ...meta.openGraph,
      title,
      description,
      images: [
        {
          url: formattedOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    };
  }

  return meta;
}

const DEFAULT_TEAM = [
  {
    name: "Chhewang Sherpa",
    role: "Co-Founder & Lead Expedition Guide",
    desc: "Nine Everest summits, two K2 ascents, twelve Ama Dablam routes. IFMGA-certified and ropes coordinator for all technical expeditions.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
    badge: "IFMGA Guide",
  },
  {
    name: "Pasang Lhamu Sherpa",
    role: "Operations & Logistics Director",
    desc: "Manages permits, helicopter charters, lodge bookings, and client itineraries across Khumbu and Annapurna. 12 years coordinating Himalayan operations.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150",
    badge: "Operations Lead",
  },
  {
    name: "Dr. Rajesh Thapa",
    role: "Chief Medical Officer",
    desc: "Specialist in high-altitude physiology and emergency medicine. Oversees all medical safety protocols, acclimatization planning, and basecamp health monitoring.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150",
    badge: "MD, Altitude Medicine",
  },
];

const DEFAULT_VALUES = [
  {
    title: "Sherpa-owned and operated",
    desc: "100% of our leadership and field staff are local Sherpas. Profits from every expedition go back into Sherpa villages — supporting schools, solar infrastructure, and micro-hydro projects.",
  },
  {
    title: "Environmental responsibility",
    desc: "All waste is packed out from campsites. We cook with LPG gas instead of firewood, and apply carbon offsets to helicopter flights. Porters are paid fair wages that exceed industry standards.",
  },
  {
    title: "Quality over volume",
    desc: "We run a maximum of 30 expeditions per year. That limit exists so we can maintain genuine standards on guide prep, equipment quality, kitchen hygiene, and client communication.",
  },
];

export default async function AboutView() {
  let aboutData: AboutUsData | null = null;
  try {
    aboutData = await AboutUsService.getPublic();
  } catch (e) {
    console.warn("Failed to fetch public about us content:", e);
  }

  let team = DEFAULT_TEAM;
  try {
    const res = await adminTeamsApi.getPublicAll({ status: "active" });
    if (Array.isArray(res) && res.length > 0) {
      team = res.map((m) => ({
        name: m.name,
        role: m.role,
        desc: m.bio || "Experienced Himalayan expedition specialist.",
        image: m.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
        badge: m.experience || "Sherpa Team",
      }));
    }
  } catch (e) {
    console.warn("Failed to fetch team members for about page:", e);
  }

  const values =
    Array.isArray(aboutData?.values) && aboutData.values.length > 0
      ? aboutData.values
      : DEFAULT_VALUES;

  const stats =
    Array.isArray(aboutData?.stats) && aboutData.stats.length > 0
      ? aboutData.stats
      : [
          { number: "100%", label: "Sherpa owned & operated" },
          { number: "25+", label: "Active IFMGA guides" },
        ];

  const heroTitle = aboutData?.heroTitle || "Sherpa-guided treks planned from Kathmandu.";
  const heroSubtitle =
    aboutData?.heroSubtitle ||
    "AlpineAce was founded in Thamel in 2012 with a clear commitment: deliver high-altitude Himalayan expeditions that combine certified mountain guides with safety logistics and authentic local hospitality.";
  const heroBgImage =
    aboutData?.heroImage ||
    "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1600";

  const storyTitle = aboutData?.storyTitle || "Twelve years of guided expeditions";
  const storyContentHtml = aboutData?.storyContent || "";
  const storyImage = aboutData?.storyImage;

  const missionHtml = aboutData?.mission || "";
  const visionHtml = aboutData?.vision || "";

  return (
    <div className="pt-20 min-h-screen bg-white text-slate-900 font-sans">
      {/* Page Hero */}
      <section className="py-16 sm:py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBgImage}
            alt={heroTitle}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left space-y-3">
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {heroTitle}
          </h1>
          {heroSubtitle && (
            <p className="text-slate-200 text-base sm:text-lg font-normal leading-relaxed max-w-2xl">
              {heroSubtitle}
            </p>
          )}
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16 sm:py-20 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Story Column */}
            <div className="lg:col-span-6 space-y-5">
              {storyTitle && (
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                  {storyTitle}
                </h2>
              )}

              {storyImage && (
                <div className="rounded-sm overflow-hidden border border-stone-200 max-h-72 shadow-xs my-4">
                  <img
                    src={storyImage}
                    alt={storyTitle || "AlpineAce Story"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {storyContentHtml ? (
                <div
                  className="text-stone-700 text-sm leading-relaxed space-y-3 prose prose-stone max-w-none [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_h3]:font-bold [&_h3]:text-stone-900"
                  dangerouslySetInnerHTML={{ __html: storyContentHtml }}
                />
              ) : (
                <div className="text-stone-700 text-sm leading-relaxed space-y-3">
                  <p>
                    When we started, most operators in Nepal were either budget teahouse companies or foreign-owned luxury brands that subcontracted local guides. Neither worked well for serious travelers who wanted both comfort and real local knowledge.
                  </p>
                  <p>
                    We built AlpineAce around a direct model: Sherpa guides who lead every expedition, long-standing mountain lodge partnerships, and clear safety protocols. The result is a company focused entirely on trip quality and trekker safety.
                  </p>
                </div>
              )}

              {/* Key Stats Bar */}
              {stats.length > 0 && (
                <div className="pt-4 flex flex-wrap gap-8 border-t border-stone-200">
                  {stats.map((s, idx) => (
                    <div key={idx}>
                      <span className="font-heading text-3xl font-bold text-stone-900 block">
                        {s.number}
                      </span>
                      <span className="text-stone-600 text-xs font-semibold mt-0.5 block">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Commitments & Mission/Vision Column */}
            <div className="lg:col-span-6 space-y-8">
              {values.length > 0 && (
                <div>
                  <h3 className="font-heading text-base font-bold text-stone-900 mb-4 pb-2 border-b border-stone-200">
                    Our commitments
                  </h3>
                  <ul className="divide-y divide-stone-200">
                    {values.map((v, i) => (
                      <li key={i} className="py-4 space-y-1">
                        <h4 className="font-heading text-sm font-bold text-stone-900">
                          {v.title}
                        </h4>
                        <p className="text-stone-700 text-sm leading-relaxed font-normal">
                          {v.desc}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mission & Vision Section (Only rendered if content exists) */}
              {(missionHtml || visionHtml) && (
                <div className="space-y-4 pt-4 border-t border-stone-200">
                  {missionHtml && (
                    <div className="bg-stone-50 p-5 rounded-sm border border-stone-200 space-y-2">
                      <h3 className="font-heading text-sm font-bold text-stone-900">
                        Our Mission
                      </h3>
                      <div
                        className="text-stone-700 text-xs leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: missionHtml }}
                      />
                    </div>
                  )}

                  {visionHtml && (
                    <div className="bg-stone-50 p-5 rounded-sm border border-stone-200 space-y-2">
                      <h3 className="font-heading text-sm font-bold text-stone-900">
                        Our Vision
                      </h3>
                      <div
                        className="text-stone-700 text-xs leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: visionHtml }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Team Section */}
      {team.length > 0 && (
        <section className="py-16 sm:py-20 bg-stone-50 border-t border-stone-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-amber-800 text-xs font-semibold uppercase tracking-wider block mb-2">
                Leadership
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                The team behind your trek
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {team.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-stone-200 rounded-sm overflow-hidden flex flex-col h-full group shadow-xs"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={t.image}
                      alt={t.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-sm">
                      {t.badge}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-heading text-sm font-bold text-slate-900 mb-0.5">
                      {t.name}
                    </h3>
                    <span className="text-amber-800 text-xs font-medium block mb-3">
                      {t.role}
                    </span>
                    <p className="text-slate-600 text-xs leading-relaxed font-normal">
                      {t.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
