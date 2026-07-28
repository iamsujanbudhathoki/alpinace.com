import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Award, CheckCircle2 } from "lucide-react";
import { siteConfig, contact } from "@/lib/site-config";

export function Hero() {
  const words = siteConfig.tagline.split(" ");
  const highlight = words.pop();
  const lead = words.join(" ");

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white pt-20">
      {/* Background Image/Video with Deep Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="w-full h-full object-cover opacity-45"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-400/30 text-gold-300 text-xs uppercase tracking-widest font-semibold px-4 py-2 rounded-full mb-6">
          <Sparkles className="h-4 w-4 text-gold-400" />
          <span>Premium Himalayan Operator</span>
        </div>

        {/* Headline */}
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-5xl leading-tight">
          {lead} <span className="text-gold-400">{highlight}</span>
        </h1>

        {/* Supporting Copy */}
        <p className="text-slate-200 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed font-normal">
          {siteConfig.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-14 w-full justify-center px-4">
          <Link
            href="/contact"
            className="bg-gold-500 hover:bg-gold-400 text-slate-950 font-heading text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-full shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 group border border-gold-400"
          >
            <span>Plan My Trip</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href={`https://wa.me/${contact.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900/80 hover:bg-slate-900 border border-gold-500/30 hover:border-gold-500 text-white font-heading text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2"
          >
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="w-full max-w-4xl border-t border-white/10 pt-8">
          <p className="text-gold-400 text-[10px] uppercase tracking-widest font-semibold mb-4">
            Our Local Trust Partners
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/70 text-xs font-mono font-bold tracking-widest">
            <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-all">
              <ShieldCheck className="h-5 w-5 text-gold-400" />
              <span>TAAN PERMITTED</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-all">
              <Award className="h-5 w-5 text-gold-400" />
              <span>NMA CERTIFIED</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-all">
              <CheckCircle2 className="h-5 w-5 text-gold-400" />
              <span>NEPAL TOURISM BOARD</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
