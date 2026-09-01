import Link from "next/link";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[82vh] flex-col justify-end overflow-hidden bg-stone-950 text-white">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* High-Contrast Gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/20"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="max-w-2xl space-y-5">
          <span className="text-amber-400 text-xs sm:text-sm font-medium block">
            Sherpa-Guided Himalayan Expeditions &bull; Kathmandu, Nepal
          </span>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-white">
            Walk deeper into the Himalayas.
          </h1>

          <p className="text-stone-200 text-base sm:text-lg font-normal leading-relaxed">
            Custom Himalayan trekking circuits and high-peak climbs guided exclusively by IFMGA Sherpa leaders.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/trekking"
              className="inline-flex items-center justify-center rounded-sm bg-amber-600 hover:bg-amber-700 text-white px-7 py-3 text-sm font-semibold transition-colors text-center"
            >
              Explore Routes &rarr;
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-sm bg-stone-900/90 hover:bg-stone-900 text-white border border-stone-700 px-7 py-3 text-sm font-medium transition-colors text-center"
            >
              Plan Custom Trip
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

