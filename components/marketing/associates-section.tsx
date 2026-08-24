"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ExternalLink, Award } from "lucide-react";
import { AssociateService } from "@/lib/services/admin-service";
import { AssociateItem, AssociateStatus } from "@/lib/admin-data";

interface AssociatesSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function AssociatesSection({
  title = "Official Partners & Affiliations",
  subtitle = "Recognized and certified by Nepal's leading tourism, safety, and mountaineering authorities.",
  className = "",
}: AssociatesSectionProps) {
  const [associates, setAssociates] = useState<AssociateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssociates() {
      try {
        const data = await AssociateService.getAll(AssociateStatus.ACTIVE);
        setAssociates(data);
      } catch (err) {
        console.warn("Failed to load associates:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAssociates();
  }, []);

  if (!loading && associates.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 sm:py-16 bg-slate-50/70 border-y border-stone-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            <span>Trusted & Accredited</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-stone-600 text-sm mt-2 font-normal leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs animate-pulse space-y-3">
                <div className="h-12 w-12 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-10 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          /* Associates Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {associates.map((assoc) => (
              <div
                key={assoc.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    {assoc.image ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={assoc.image}
                          alt={assoc.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6 text-amber-700" />
                      </div>
                    )}
                    {assoc.category && (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {assoc.category}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      {assoc.name}
                    </h3>
                    {assoc.role && (
                      <p className="text-xs text-amber-700 font-semibold mt-0.5">
                        {assoc.role} {assoc.company ? `• ${assoc.company}` : ""}
                      </p>
                    )}
                    {assoc.description && (
                      <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed font-normal">
                        {assoc.description}
                      </p>
                    )}
                  </div>
                </div>

                {assoc.websiteUrl && (
                  <div className="pt-4 mt-4 border-t border-stone-100">
                    <a
                      href={assoc.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-700 transition-colors"
                    >
                      <span>Visit Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
