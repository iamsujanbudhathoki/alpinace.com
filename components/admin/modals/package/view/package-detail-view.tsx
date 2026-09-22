"use client";

import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { TripDepartureDatesManager } from "@/components/admin/forms/trip-departure-dates-manager";
import { TripGroupPricingManager } from "@/components/admin/forms/trip-group-pricing-manager";
import { TripGalleryManager } from "@/components/admin/forms/trip-gallery-manager";
import { TripMapManager } from "@/components/admin/forms/trip-map-manager";
import { TripFilesManager } from "@/components/admin/forms/trip-files-manager";
import { Clock, ExternalLink, MapPin, Mountain, ShieldCheck, Compass, Users } from "lucide-react";
import Link from "next/link";

interface PackageDetailViewProps {
  packageData: any;
  availableActivities?: { id: string; name: string }[];
  categorySlugPrefix?: string;
}

export function PackageDetailView({
  packageData,
  availableActivities = [],
  categorySlugPrefix = "trekking",
}: PackageDetailViewProps) {
  if (!packageData) return null;

  return (
    <div className="space-y-4 py-1">
      {/* Header Info Banner */}
      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="col-span-2 pb-1 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Public Marketing Route
            </span>
            <Link
              href={`/${categorySlugPrefix}/${packageData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-1.5 font-extrabold text-slate-900 hover:text-amber-600 transition-colors"
            >
              <span className="underline decoration-transparent group-hover/link:decoration-amber-500 underline-offset-2">
                {packageData.title}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-amber-600 transition-colors shrink-0" />
            </Link>
          </div>
          <div>
            <AdminStatusBadge status={packageData.status || "active"} />
          </div>
        </div>

        <div>
          <span className="text-slate-600 font-semibold block text-[11px]">Region:</span>
          <span className="text-slate-950 font-bold flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            {packageData.region || "—"}
          </span>
        </div>

        <div>
          <span className="text-slate-600 font-semibold block text-[11px]">Duration:</span>
          <span className="text-slate-950 font-bold flex items-center gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            {packageData.durationDays || 0} Days
          </span>
        </div>

        {(packageData.maxAltitudeMeters || packageData.peakHeightM) && (
          <div>
            <span className="text-slate-600 font-semibold block text-[11px]">Max Altitude / Height:</span>
            <span className="text-slate-950 font-bold flex items-center gap-1 mt-0.5">
              <Mountain className="w-3.5 h-3.5 text-emerald-500" />
              {((packageData.maxAltitudeMeters || packageData.peakHeightM || 0)).toLocaleString()}m
            </span>
          </div>
        )}

        <div>
          <span className="text-slate-600 font-semibold block text-[11px]">Starting Price:</span>
          <span className="text-slate-950 font-black text-sm text-emerald-800">
            ${(packageData.priceUSD || 0).toLocaleString()} USD
          </span>
        </div>
      </div>

      {/* Quick Details Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 font-medium block">Best Season</span>
          <span className="text-slate-900 font-bold">{packageData.bestSeason || "—"}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 font-medium block">Group Size</span>
          <span className="text-slate-900 font-bold">{packageData.groupSizeRange || "—"}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 font-medium block">Accommodation</span>
          <span className="text-slate-900 font-bold truncate block">{packageData.accommodation || "Lodge / Hotel"}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 font-medium block">Meals Included</span>
          <span className="text-slate-900 font-bold truncate block">{packageData.meals || "Full Board"}</span>
        </div>
      </div>

      {/* Domain Specific Chips (Expeditions / Tours) */}
      {(packageData.climbingGrade || packageData.sherpaGuideRatio || packageData.tourType || packageData.transportation) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          {packageData.climbingGrade && (
            <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80">
              <span className="text-amber-800 font-medium block">Climbing Grade</span>
              <span className="text-slate-900 font-bold">{packageData.climbingGrade}</span>
            </div>
          )}
          {packageData.sherpaGuideRatio && (
            <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80">
              <span className="text-amber-800 font-medium block">Sherpa Guide Ratio</span>
              <span className="text-slate-900 font-bold">{packageData.sherpaGuideRatio}</span>
            </div>
          )}
          {packageData.tourType && (
            <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200/80">
              <span className="text-blue-800 font-medium block">Tour Category</span>
              <span className="text-slate-900 font-bold">{packageData.tourType}</span>
            </div>
          )}
          {packageData.transportation && (
            <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200/80">
              <span className="text-blue-800 font-medium block">Transportation</span>
              <span className="text-slate-900 font-bold">{packageData.transportation}</span>
            </div>
          )}
        </div>
      )}

      {/* Linked Activity Hubs */}
      {packageData.activityIds && packageData.activityIds.length > 0 && (
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block text-xs">Associated Activity Hubs:</span>
          <div className="flex flex-wrap gap-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
            {packageData.activityIds.map((actId: string) => {
              const actName = availableActivities.find((a) => a.id === actId)?.name || actId;
              return (
                <span key={actId} className="inline-flex items-center gap-1 bg-stone-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  {actName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Short Overview Description */}
      {packageData.shortDesc && (
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block text-xs">Marketing Overview &amp; Experience:</span>
          <div
            className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-normal bg-slate-50 p-3.5 rounded-lg border border-slate-200"
            dangerouslySetInnerHTML={{ __html: packageData.shortDesc }}
          />
        </div>
      )}

      {/* Group Pricing Section */}
      {packageData.groupPricingEnabled && packageData.groupPricing && (
        <div className="pt-1">
          <TripGroupPricingManager
            enabled={packageData.groupPricingEnabled}
            onEnabledChange={() => {}}
            tiers={packageData.groupPricing}
            onChange={() => {}}
            readOnly
          />
        </div>
      )}

      {/* Add-ons & Useful Info */}
      {packageData.addonsText && (
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block text-xs">Add-ons &amp; Options:</span>
          <div
            className="prose prose-sm max-w-none text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-200"
            dangerouslySetInnerHTML={{ __html: packageData.addonsText }}
          />
        </div>
      )}

      {packageData.usefulInfoText && (
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block text-xs">Useful Info:</span>
          <div
            className="prose prose-sm max-w-none text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-200"
            dangerouslySetInnerHTML={{ __html: packageData.usefulInfoText }}
          />
        </div>
      )}

      {/* Departure Dates Summary */}
      {packageData.departureDates && packageData.departureDates.length > 0 && (
        <div className="space-y-1.5">
          <span className="font-bold text-slate-900 block text-xs">
            Scheduled Departure Dates ({packageData.departureDates.length}):
          </span>
          <TripDepartureDatesManager dates={packageData.departureDates} onChange={() => {}} readOnly />
        </div>
      )}

      {/* Media & Map Summary */}
      {((packageData.galleryImages && packageData.galleryImages.length > 0) || packageData.mapImage) && (
        <div className="space-y-3 pt-1">
          {packageData.mapImage && (
            <div>
              <span className="font-bold text-slate-900 block text-xs mb-1">Route Map:</span>
              <TripMapManager mapImage={packageData.mapImage} onChange={() => {}} readOnly packageTitle={packageData.title} />
            </div>
          )}

          {packageData.galleryImages && packageData.galleryImages.length > 0 && (
            <div>
              <span className="font-bold text-slate-900 block text-xs mb-1">
                Photo Gallery ({packageData.galleryImages.length}):
              </span>
              <TripGalleryManager images={packageData.galleryImages} onChange={() => {}} readOnly />
            </div>
          )}
        </div>
      )}

      {/* Downloadable Files Summary */}
      {packageData.packageFiles && packageData.packageFiles.length > 0 && (
        <div className="space-y-1.5">
          <span className="font-bold text-slate-900 block text-xs">
            Downloadable Files &amp; Brochures ({packageData.packageFiles.length}):
          </span>
          <TripFilesManager files={packageData.packageFiles} onChange={() => {}} readOnly />
        </div>
      )}
    </div>
  );
}
