"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Loader2, Map as MapIcon } from "lucide-react";
import { openSingleImage } from "@/lib/utils/lightbox";
import { PackageSection } from "./package-section";

interface PackageTrekMapProps {
  mapImage?: string;
  title: string;
}

function toFileSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function PackageTrekMap({ mapImage, title }: PackageTrekMapProps) {
  const [downloading, setDownloading] = useState(false);

  if (!mapImage || !mapImage.trim()) return null;

  const fileBase = `${toFileSlug(title)}-route-map`;

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);

    try {
      const res = await fetch(mapImage);
      if (!res.ok) throw new Error(`Map request failed with ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const ext = mapImage.split(".").pop()?.split("?")[0] || "jpg";

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${fileBase}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // The host may block cross-origin reads; open the original so the user can still save it.
      window.open(mapImage, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <PackageSection
      icon={MapIcon}
      eyebrow="The experience"
      title="Route map"
      action={
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="btn-secondary py-2 px-3.5 min-h-[40px] text-xs font-semibold disabled:opacity-50"
          aria-label="Download route map"
        >
          {downloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
          )}
          <span>{downloading ? "Downloading..." : "Download"}</span>
        </button>
      }
    >
      <button
        type="button"
        onClick={(e) => openSingleImage(mapImage, `${title} Route Map`, e.currentTarget)}
        className="block w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-950 cursor-zoom-in shadow-xs"
        title="View full-size route map"
      >
        <Image
          src={mapImage}
          alt={`${title} Route Map`}
          width={1200}
          height={1600}
          sizes="(max-width: 1024px) 100vw, 800px"
          className="w-full h-auto"
        />
      </button>
    </PackageSection>
  );
}
