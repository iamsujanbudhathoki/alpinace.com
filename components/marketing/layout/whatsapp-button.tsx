"use client";

import { MessageCircle } from "lucide-react";
import { contact } from "@/lib/site-config";

export function WhatsAppButton() {
  const defaultMsg = encodeURIComponent(
    "Hello! I am interested in planning a trek or expedition with Alpine Ace."
  );
  const whatsappUrl = `https://wa.me/${contact.whatsappNumber}?text=${defaultMsg}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-lg shadow-emerald-900/20 hover:shadow-emerald-600/40 transition-all duration-300 transform hover:scale-110 active:scale-95 group cursor-pointer border border-emerald-400/40 animate-pulse hover:animate-none"
    >
      <div className="relative flex items-center justify-center">
        <MessageCircle className="w-5 h-5 fill-white text-emerald-600 transition-transform group-hover:rotate-12" />
        {/* Active online pulse dot */}
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200" />
        </span>
      </div>
      <span className="text-xs font-bold text-white tracking-wide">
        Chat Now
      </span>
    </a>
  );
}
