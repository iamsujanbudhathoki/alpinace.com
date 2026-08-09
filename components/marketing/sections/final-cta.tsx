import Link from "next/link";
import { contact } from "@/lib/site-config";
import { MessageCircle, ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="relative py-20 bg-white text-slate-900 border-t border-slate-200 text-center overflow-hidden">
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <span className="text-amber-700 text-sm font-medium block">
          Start Your Journey
        </span>
        <h2 className="font-heading text-3xl sm:text-5xl font-bold text-slate-900 leading-tight">
          The Himalayas Are Calling
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-normal leading-relaxed">
          Ready to explore Nepal? Reach out to our local team in Kathmandu to start planning your custom trek or peak expedition.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <Link
            href="/contact"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-heading text-sm font-semibold px-8 py-3.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Plan Your Trip</span>
            <ArrowRight className="h-4 w-4 text-amber-400" />
          </Link>
          <a
            href={`https://wa.me/${contact.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-heading text-sm font-medium px-8 py-3.5 rounded-full transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <div className="pt-4 text-xs text-slate-600 flex flex-wrap justify-center items-center gap-6 font-medium">
          <span>&bull; Experienced Sherpa Guides</span>
          <span>&bull; Custom Itineraries</span>
          <span>&bull; High-Altitude Safety</span>
        </div>
      </div>
    </section>
  );
}
