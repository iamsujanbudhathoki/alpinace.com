"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PhoneCall } from "lucide-react";
import { useSettings } from "@/lib/settings-context";
import { adminTeamsApi, TeamMemberItem } from "@/lib/services/admin-service";

export function ExpertCtaSection() {
  const { settings } = useSettings();
  const rawPhone = settings.whatsappNumber || "+977 9764398491";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        "Hello Alpine Ace! I would like to speak to a Himalayan trek expert."
      )}`
    : "/contact";

  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([]);

  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await adminTeamsApi.getPublicAll({ status: "active" });
        const list = Array.isArray(res)
          ? res
          : Array.isArray((res as any)?.items)
          ? (res as any).items
          : [];
        if (list.length > 0) {
          setTeamMembers(list);
        }
      } catch (e) {
        // Fallback gracefully
      }
    }
    loadTeam();
  }, []);

  // Display avatars (up to 5 team members or fallback images)
  const defaultAvatars = [
    { name: "Alpine Ace Treks Team", image: "/about-everest-group.png" },
    { name: "Lakpa Tamang", image: "/logo.jpg" },
    { name: "Mingma Norbu", image: "/about-alpineace-group.png" },
    { name: "Pasang Tenzing", image: "/logo.jpg" },
  ];

  const avatarsToDisplay =
    teamMembers.length > 0
      ? teamMembers.map((m) => ({ name: m.name, image: m.avatar || "/logo.jpg" }))
      : defaultAvatars;

  const featuredMember = avatarsToDisplay[0] || defaultAvatars[0];
  const sideAvatarsLeft = avatarsToDisplay.slice(1, 3);
  const sideAvatarsRight = avatarsToDisplay.slice(3, 5);

  return (
    <section className="py-12 sm:py-16 bg-stone-50 border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white border border-stone-200/90 rounded-2xl shadow-xl shadow-stone-900/5 p-6 sm:p-10 md:p-12 overflow-hidden">
          
          {/* World Map Dotted Pattern Background Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <svg className="w-full h-full text-indigo-900" fill="currentColor" viewBox="0 0 1000 500" aria-hidden="true">
              <pattern id="world-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#world-dots)" />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content Column */}
            <div className="md:col-span-7 space-y-4 text-center md:text-left">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
                Speak to an Expert
              </h2>

              <p className="text-stone-600 text-xs sm:text-sm font-normal leading-relaxed max-w-lg mx-auto md:mx-0">
                Need assistance with your booking? Our experts from various countries are here to help. Feel free to reach out with any questions or concerns.
              </p>

              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent text-xs sm:text-sm inline-flex items-center justify-center gap-2.5"
                >
                  <PhoneCall className="w-4 h-4 text-stone-950" />
                  <span>Schedule a Call</span>
                </a>
              </div>
            </div>

            {/* Right Expert Avatars Column */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center space-y-3">
              {/* Overlapping Avatars Row */}
              <div className="flex items-center justify-center -space-x-3">
                {/* Left Side Avatars */}
                {sideAvatarsLeft.map((av, idx) => (
                  <div
                    key={`left-${idx}`}
                    className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-white shadow-xs overflow-hidden bg-stone-100 shrink-0 opacity-90 transition-transform hover:scale-105"
                  >
                    <Image
                      src={av.image}
                      alt={av.name}
                      fill
                      sizes="52px"
                      className="object-cover"
                    />
                  </div>
                ))}

                {/* Featured Central Avatar */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-stone-100 shrink-0 z-20 scale-105">
                  <Image
                    src={featuredMember.image}
                    alt={featuredMember.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                {/* Right Side Avatars */}
                {sideAvatarsRight.map((av, idx) => (
                  <div
                    key={`right-${idx}`}
                    className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-white shadow-xs overflow-hidden bg-stone-100 shrink-0 opacity-90 transition-transform hover:scale-105"
                  >
                    <Image
                      src={av.image}
                      alt={av.name}
                      fill
                      sizes="52px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Expert Name & Flag */}
              <div className="pt-1 space-y-0.5">
                <span className="font-bold text-stone-900 text-sm sm:text-base flex items-center justify-center gap-1.5">
                  Alpine Ace Treks <span className="text-stone-400 font-normal">&bull;</span> Nepal 🇳🇵
                </span>
                <div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-600 hover:text-stone-950 text-xs font-medium inline-flex items-center justify-center gap-1.5 hover:underline cursor-pointer transition-colors"
                  >
                    <span>WhatsApp</span>
                    <span className="font-semibold text-stone-900">{rawPhone}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
