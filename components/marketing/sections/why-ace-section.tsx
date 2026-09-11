"use client";

import Image from "next/image";

interface WhyAceFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
  badgeBg: string;
  badgeBorder: string;
  iconColor: string;
}

const whyAceFeatures: WhyAceFeature[] = [
  {
    title: "Local Himalayan Experts",
    description:
      "Dedicated local professionals are based in Nepal and work exclusively for Alpine Ace to give you an authentic Himalayan experience.",
    icon: (
      <Image
        src="/icons/himalaya.png"
        alt="Local Himalayan Experts"
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
      />
    ),
    badgeBg: "bg-stone-100",
    badgeBorder: "border-stone-200",
    iconColor: "text-stone-800",
  },
  {
    title: "High Standard of Safety Prioritized",
    description:
      "Your safe and secure trip is our top priority. Fully health-trained mountain guides and medical-equipped staff take care of you throughout the journey.",
    icon: (
      <Image
        src="/icons/safety.png"
        alt="High Standard of Safety Prioritized"
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
      />
    ),
    badgeBg: "bg-stone-100",
    badgeBorder: "border-stone-200",
    iconColor: "text-stone-800",
  },
  {
    title: "Unbeatable Value",
    description:
      "We at Alpine Ace carefully curate our itineraries with transparent pricing and the best possible services to guarantee your trip is true value for money.",
    icon: (
      <Image
        src="/icons/value-proposition.png"
        alt="Unbeatable Value"
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
      />
    ),
    badgeBg: "bg-stone-100",
    badgeBorder: "border-stone-200",
    iconColor: "text-stone-800",
  },
  {
    title: "Top-Notch Service",
    description:
      "Well-experienced professional mountain guides and dedicated support team are at your service to deliver an exceptional quality trip experience.",
    icon: (
      <Image
        src="/icons/service-responsible.png"
        alt="Top-Notch Service"
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
      />
    ),
    badgeBg: "bg-stone-100",
    badgeBorder: "border-stone-200",
    iconColor: "text-stone-800",
  },
  {
    title: "Socially Responsible",
    description:
      "Alpine Ace believes in giving back to local mountain communities primarily through social initiatives and eco-friendly trekking practices across Nepal.",
    icon: (
      <Image
        src="/icons/responsible.png"
        alt="Socially Responsible"
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
      />
    ),
    badgeBg: "bg-stone-100",
    badgeBorder: "border-stone-200",
    iconColor: "text-stone-800",
  },
  {
    title: "Guaranteed Departures",
    description:
      "Our trips have guaranteed departure dates. Once your booking is confirmed, your trek is guaranteed to run irrespective of the group size.",
    icon: (
      <Image
        src="/icons/departure.png"
        alt="Guaranteed Departures"
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
      />
    ),
    badgeBg: "bg-stone-100",
    badgeBorder: "border-stone-200",
    iconColor: "text-stone-800",
  },
];

export function WhyAceSection() {
  return (
    <section className="py-16 sm:py-24 bg-stone-50 border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900">
            Why AlpineAce Treks?
          </h2>
          <div className="section-accent-line mx-auto mb-5" />
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-normal">
            We have been helping travelers explore the Nepalese Himalayas with dedicated local experts across Nepal, promoting eco-friendly and responsible tourism for your unforgettable mountain adventure.
          </p>
        </div>

        {/* 6 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {whyAceFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:border-stone-300 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              {/* Icon Container */}
              <div
                className={`w-14 h-14 rounded-2xl ${feature.badgeBg} border ${feature.badgeBorder} ${feature.iconColor} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 shadow-2xs`}
              >
                {feature.icon}
              </div>

              {/* Title & Description */}
              <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 mb-2.5">
                {feature.title}
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

       
      </div>
    </section>
  );
}
