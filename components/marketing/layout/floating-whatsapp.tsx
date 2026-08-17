"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useSettings } from "@/lib/settings-context";

export function FloatingWhatsApp() {
  const { settings } = useSettings();
  const [showTooltip, setShowTooltip] = useState(true);

  const rawNumber = settings.whatsappNumber || "";
  const cleanNumber = rawNumber.replace(/\D/g, "");

  // If no WhatsApp number is configured in backend settings, do not render
  if (!cleanNumber) {
    return null;
  }

  const defaultMessage = "Hello AlpineAce team! I would like to inquire about planning a trip to Nepal.";
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group print:hidden">
      {/* Optional Dismissible Tooltip */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-zinc-900 text-xs font-medium py-2 px-3.5 rounded-full shadow-lg border border-stone-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Chat with Mountain Specialist</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-stone-400 hover:text-stone-700 ml-1 transition-colors p-0.5 rounded-full"
            aria-label="Close tooltip"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-105 group-hover:ring-4 group-hover:ring-emerald-500/20"
      >
        <MessageCircle className="w-7 h-7 fill-white stroke-emerald-500" />
      </a>
    </div>
  );
}
