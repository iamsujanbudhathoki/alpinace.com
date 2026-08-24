"use client";

import { useState } from "react";
import {
  MapPin,
  UploadCloud,
  FolderOpen,
  Trash2,
  Maximize2,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MediaService } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";

interface TripMapManagerProps {
  mapImage?: string;
  mapMediaId?: string;
  onChange: (url: string, mediaId?: string) => void;
  readOnly?: boolean;
  packageTitle?: string;
}

export function TripMapManager({
  mapImage = "",
  mapMediaId = "",
  onChange,
  readOnly = false,
  packageTitle = "Trek",
}: TripMapManagerProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploading(true);

    try {
      const res = await MediaService.uploadFile(file);
      const url = res?.data?.url || (res as any)?.url;
      const mediaId = res?.data?.id;
      if (url || mediaId) {
        onChange(url || "", mediaId);
        toast.success("Trek map image uploaded successfully");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload trek map image");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    onChange("", "");
    toast.info("Trek map image removed");
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Dedicated Trek Route / Elevation Map Image</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload an elevation chart or geographical route map specific to this adventure.
          </p>
        </div>

        {!readOnly && (
          <label className="cursor-pointer shrink-0">
            <span className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors">
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5" />
              )}
              <span>{mapImage ? "Replace Map Image" : "Upload Trek Map"}</span>
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Map Image Preview Box */}
      {mapImage ? (
        <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Compact Map Thumbnail with Lightbox click */}
            <div
              onClick={(e) => openSingleImage(mapImage, `${packageTitle} Trek Route Map`, e.currentTarget)}
              className="relative w-36 h-20 shrink-0 rounded-lg overflow-hidden border border-emerald-200 bg-slate-950 group cursor-pointer shadow-xs"
              title="Click for Lightbox Full View"
            >
              <img src={mapImage} alt={`${packageTitle} Trek Map`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-4 h-4 text-white drop-shadow-xs" />
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                Route Map Active
              </span>
              <p className="text-xs font-bold text-slate-900 truncate max-w-[180px] sm:max-w-[240px]">
                {mapImage.split("/").pop() || "route-map.jpg"}
              </p>
              <button
                type="button"
                onClick={(e) => openSingleImage(mapImage, `${packageTitle} Trek Route Map`, e.currentTarget)}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
                View Fullscreen Lightbox
              </button>
            </div>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-1 h-8 px-2.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>Replace</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-xs font-semibold h-8 px-2 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-10 text-center bg-slate-50/70 border border-dashed border-slate-200 rounded-xl space-y-2">
          <Compass className="w-9 h-9 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">No Trek Map Uploaded</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Upload a dedicated map image showing the trekking trail, elevation profile, or key waypoints for Marketing Associates and travelers.
          </p>
        </div>
      )}
    </div>
  );
}
