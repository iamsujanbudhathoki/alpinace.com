import { ShieldCheck, Award, Leaf, Milestone, Users } from "lucide-react";

export function WhyChooseUs() {
  const whyUs = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-amber-600" />,
      title: "Uncompromised Safety Standards",
      desc: "All treks are led by certified IFMGA Sherpas carrying pulse oximeters, specialized medicine kits, satellite phones, and portable hyperbaric chambers.",
    },
    {
      icon: <Award className="h-6 w-6 text-amber-600" />,
      title: "A Mountain Luxury Aesthetic",
      desc: "We replace cold, drafty tea houses with premium boutique luxury lodges featuring attached heated bathrooms, electric blankets, and organic fine dining.",
    },
    {
      icon: <Leaf className="h-6 w-6 text-amber-600" />,
      title: "Sustainable & Ethical Tourism",
      desc: "We maintain standard-setting fair wages for porters, offset carbon for all helicopter flights, and actively support Sagarmatha community recycling projects.",
    },
    {
      icon: <Milestone className="h-6 w-6 text-amber-600" />,
      title: "Bespoke Private Customization",
      desc: "No cookie-cutter trips. Our destination designers tailor every day-to-day route, dietary preference, and helicopter shuttle to match your unique desires.",
    },
  ];

  return (
    <section className="py-24 bg-slate-50/70 border-b border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Narrative */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-gold-600 text-xs uppercase tracking-widest font-extrabold block">
              Unrivaled Expertise
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              Luxury Mountaineering Built on Local Sherpa Heritage
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-normal">
              We believe that premium travel is not just about comfortable beds, but deep cultural connection, unparalleled safety margins, and absolute local authenticity.
            </p>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="bg-slate-900 text-amber-400 p-2.5 rounded-lg shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold text-slate-950">
                  1:1 Elite Climbing Guide Ratio
                </h3>
                <p className="text-slate-600 text-xs mt-1 leading-normal">
                  Our high-altitude mountaineering team consists entirely of multi-summit Sherpas carrying global certification.
                </p>
              </div>
            </div>
          </div>

          {/* Right 4 Grid Values */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {whyUs.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="bg-slate-50 w-fit p-3 rounded-xl mb-4 border border-slate-100">
                  {item.icon}
                </div>
                <h3 className="font-heading text-base font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-normal">
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
