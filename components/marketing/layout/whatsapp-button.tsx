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
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 group cursor-pointer border border-emerald-400/30"
    >
      <div className="relative flex items-center justify-center">
        <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
        {/* Active online pulse dot */}
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200" />
        </span>
      </div>
      <span className="text-xs font-semibold hidden sm:inline-block">
        Chat on WhatsApp
      </span>
    </a>
  );
}
