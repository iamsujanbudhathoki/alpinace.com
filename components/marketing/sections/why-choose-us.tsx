"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, X } from "lucide-react";

export function WhyChooseUs() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="py-16 sm:py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Heading */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900">
            Your Trusted Partner for Himalayan Treks &amp; Tours
          </h2>
        </div>

        {/* 2-Column Card Container */}
        <div className="max-w-6xl mx-auto bg-[#f8f8f8] border border-stone-200/80 rounded-2xl lg:rounded-3xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[460px]">
            {/* Left Column: Image with Interactive Play Video Overlay */}
            <div className="relative lg:col-span-6 xl:col-span-5 min-h-[320px] sm:min-h-[380px] lg:min-h-full overflow-hidden bg-stone-900 group">
              
              <Image
                src="/about-everest-group.png"
                alt="Alpine Ace Trekkers at Everest Base Camp"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent" />

              {/* Play Video Button */}
              <button
                onClick={() => setIsVideoOpen(true)}
                aria-label="Play Alpine Ace Introduction Video"
                className="absolute inset-0 flex items-center justify-center group/play cursor-pointer"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 text-stone-900 flex items-center justify-center shadow-lg group-hover/play:scale-110 group-hover/play:bg-white transition-all duration-300 backdrop-blur-xs border border-white/80">
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-stone-900 text-stone-900 translate-x-0.5" />
                </div>
              </button>
            </div>

            {/* Right Column: Rebranded Content Text */}
            <div className="lg:col-span-6 xl:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-4 text-stone-700 text-xs sm:text-sm lg:text-[15px] leading-relaxed font-normal">
                <p>
                  <strong className="text-stone-900 font-semibold">Alpine Ace</strong> is a premier trekking and adventure travel company in Nepal, founded by former mountain guides with a passion for creating safe, authentic, and unforgettable Himalayan journeys. Renowned for top-notch service at affordable prices, highly experienced guides, and exceptional safety standards, we proudly maintain an impressive 97.4% trek success rate.
                </p>
                <p>
                  As a Travelife Certified company, we meet internationally recognized sustainability standards through independent assessment, reflecting our commitment to responsible tourism, environmental protection, and supporting local mountain communities in line with GSTC Criteria.
                </p>
                <p>
                  With the highest number of positive reviews from travelers worldwide, Alpine Ace proudly stands as one of Nepal’s leading trekking and tour operators. We specialize in guided Himalayan treks, peak climbing, cultural tours, luxury holidays, and tailor-made adventure travel experiences across Nepal, Bhutan, and Tibet.
                </p>
              </div>

              {/* Button Action */}
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center font-bold text-stone-950 bg-[#eab308] hover:bg-yellow-400 text-xs sm:text-sm px-6 py-3 rounded-md transition-colors shadow-xs"
                >
                  Read more &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal Overlay */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-stone-900 rounded-xl overflow-hidden shadow-2xl border border-stone-800">
            {/* Close Modal Button */}
            <button
              onClick={() => setIsVideoOpen(false)}
              aria-label="Close Video"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-stone-950/80 text-white flex items-center justify-center hover:bg-stone-800 transition-colors cursor-pointer border border-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              <video
                src="/hero-video.mp4"
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

