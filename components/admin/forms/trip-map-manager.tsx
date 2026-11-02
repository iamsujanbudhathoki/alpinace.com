"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  FolderOpen,
  Trash2,
  Maximize2,
  Loader2,
  Compass,
  Search,
  Check,
  Eye,
  Plus,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { DialogFooter } from "@/components/ui/dialog";
import { MediaService, CategoryService, MediaItem } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";

interface TripMapManagerProps {
  mapImage?: string;
  mapMediaId?: string;
  onChange: (url: string, mediaId?: string) => void;
  readOnly?: boolean;
  packageTitle?: string;
}

type MediaAsset = MediaItem;

export function TripMapManager({
  mapImage = "",
  mapMediaId = "",
  onChange,
  readOnly = false,
  packageTitle = "Trek",
}: TripMapManagerProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [tempSelectedAsset, setTempSelectedAsset] = useState<MediaAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showModalUploader, setShowModalUploader] = useState(false);

  const MEDIA_LIMIT = 12;
  const [mediaPage, setMediaPage] = useState(1);
  const [mediaTotalPages, setMediaTotalPages] = useState(1);
  const [mediaTotalItems, setMediaTotalItems] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await MediaService.uploadFile(file);
      if (res.success && res.data?.url) {
        const uploadedAsset: MediaAsset = res.data;
        setAssets((prev) => [uploadedAsset, ...prev.filter((a) => a.url !== uploadedAsset.url)]);
        setTempSelectedAsset(uploadedAsset);
        setShowModalUploader(false);
        toast.success(res.message || `Map "${uploadedAsset.name || file.name}" uploaded to media library!`);
      } else {
        toast.error(res?.message || "Failed to upload map image.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err?.message || "Failed to upload map image.");
    } finally {
      setIsUploading(false);
    }
  };

  const loadMedia = async (page: number, catId: string, search?: string) => {
    setIsLibraryLoading(true);
    try {
      const res = await MediaService.getAllMedia({
        limit: MEDIA_LIMIT,
        page,
        categoryId: catId !== "All" ? catId : undefined,
        search: search?.trim() || undefined,
      });
      const mediaList: MediaAsset[] = Array.isArray(res) ? res : ((res as any)?.data ?? []);
      const pagination = res.pagination ?? (res as any)?.pagination;

      setAssets(mediaList);
      if (pagination) {
        setMediaTotalPages(pagination.lastPage ?? pagination.pageCount ?? 1);
        setMediaTotalItems(pagination.count ?? pagination.total ?? mediaList.length);
      } else {
        setMediaTotalPages(1);
        setMediaTotalItems(mediaList.length);
      }

      // Preselect current map asset if matching URL or ID exists
      if (!tempSelectedAsset) {
        const current = mediaList.find(
          (a) => (mapMediaId && a.id === mapMediaId) || (mapImage && a.url === mapImage)
        );
        if (current) setTempSelectedAsset(current);
      }
    } catch (e) {
      console.warn("Failed to load media for route map:", e);
      setAssets([]);
    } finally {
      setIsLibraryLoading(false);
    }
  };

  // Load categories once when library modal opens
  useEffect(() => {
    if (isLibraryOpen) {
      CategoryService.getAll({ limit: 100 })
        .then((catRes: any) => {
          const catList = Array.isArray(catRes) ? catRes : (Array.isArray(catRes?.data) ? catRes.data : []);
          setCategories(catList.map((c: any) => ({ id: c.id, name: c.name || c.title || "" })));
        })
        .catch(() => {});
    }
  }, [isLibraryOpen]);

  useEffect(() => {
    if (isLibraryOpen) {
      loadMedia(mediaPage, selectedCategory, debouncedSearch);
    }
  }, [isLibraryOpen, mediaPage, selectedCategory, debouncedSearch]);

  useEffect(() => {
    if (isLibraryOpen) setMediaPage(1);
  }, [selectedCategory, debouncedSearch]);

  const handleConfirmSelection = () => {
    if (tempSelectedAsset) {
      onChange(tempSelectedAsset.url, tempSelectedAsset.id);
      setIsLibraryOpen(false);
      toast.success("Route map selected from media library");
    }
  };

  const handleRemove = () => {
    onChange("", "");
    toast.info("Route map removed");
  };

  const filteredAssets = assets;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>Route Map</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Elevation chart or geographical route map selected from your Media Library.
          </p>
        </div>

        {!readOnly && (
          <Button
            type="button"
            size="sm"
            onClick={() => setIsLibraryOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 px-3.5 gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{mapImage ? "Change Route Map" : "Browse Media Library"}</span>
          </Button>
        )}
      </div>

      {/* Map Image Preview Box */}
      {mapImage ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Compact Map Thumbnail with Lightbox click */}
            <div
              onClick={(e) =>
                openSingleImage(mapImage, `${packageTitle} Trek Route Map`, e.currentTarget)
              }
              className="relative w-36 h-20 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-950 group cursor-pointer shadow-xs"
              title="Click for Lightbox Full View"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mapImage}
                alt={`${packageTitle} Trek Map`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-4 h-4 text-white drop-shadow-xs" />
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-500" />
                Route Map Set
              </span>
              <p className="text-xs font-bold text-slate-900 truncate max-w-[180px] sm:max-w-[240px]">
                {mapImage.split("/").pop() || "route-map.jpg"}
              </p>
              <button
                type="button"
                onClick={(e) =>
                  openSingleImage(mapImage, `${packageTitle} Trek Route Map`, e.currentTarget)
                }
                className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 underline flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
                View Fullscreen
              </button>
            </div>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsLibraryOpen(true)}
                className="text-xs font-semibold h-8 px-2.5 gap-1.5 border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Change</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs font-semibold h-8 px-2 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                title="Remove Route Map"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !readOnly && setIsLibraryOpen(true)}
          className={`p-8 text-center bg-slate-50/70 border border-dashed border-slate-200 rounded-xl space-y-3 ${
            !readOnly ? "cursor-pointer hover:bg-slate-100/60 transition-colors" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">No Route Map Assigned</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
              Select an elevation profile, route topology, or waypoint map from your centralized Media Library.
            </p>
          </div>
          {!readOnly && (
            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLibraryOpen(true);
                }}
                className="text-xs font-bold h-8 px-3.5 bg-white border-slate-300 hover:bg-slate-50 text-slate-800 shadow-2xs cursor-pointer gap-1.5 mx-auto"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>Select from Media Library</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Media Library Selector Modal */}
      {isLibraryOpen && (
        <AdminModal
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          title="Select Route Map from Media Library"
          description="Browse and choose a map image asset for this package."
          maxWidth="3xl"
        >
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search map images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 text-xs pl-9 pr-3 rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-colors"
                />
              </div>

              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-9 bg-white border border-slate-300 text-slate-900 text-xs rounded-md px-2.5 focus:outline-none focus:border-slate-900 transition-colors cursor-pointer sm:w-44"
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}

              <Button
                type="button"
                size="sm"
                onClick={() => setShowModalUploader(!showModalUploader)}
                className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-3 cursor-pointer shadow-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showModalUploader ? "Hide" : "Upload New"}</span>
              </Button>
            </div>

            {/* Inline Modal Uploader Box */}
            {showModalUploader && (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 relative cursor-pointer animate-in fade-in-0 duration-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFile}
                  disabled={isUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2 text-slate-700 font-semibold text-xs py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Uploading map image to media library...</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadCloud className="w-5 h-5 text-slate-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-900">
                      Drop route map image here or click to upload
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Map will be added to your Media Library and selected automatically.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Media Assets Grid */}
            <div className="max-h-80 overflow-y-auto min-h-[160px] p-1">
              {isLibraryLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                  <span>Loading media library...</span>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  No matching map media found in library.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {filteredAssets.map((asset) => {
                    const isSelected = tempSelectedAsset?.id === asset.id;
                    return (
                      <div
                        key={asset.id}
                        onClick={() => setTempSelectedAsset(asset)}
                        className={`group rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-amber-500 ring-2 ring-amber-500/30 shadow-md"
                            : "border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        <div className="relative h-24 bg-slate-900 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset.url}
                            alt={asset.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-10">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openSingleImage(asset.url, asset.title, e.currentTarget);
                              }}
                              className="w-7 h-7 rounded-full bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center shadow-md cursor-pointer"
                              title="Preview Fullscreen"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-slate-900 text-white p-0.5 rounded-full shadow z-20">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div className="p-1.5 bg-white">
                          <p className="text-[11px] font-bold text-slate-900 truncate">
                            {asset.title}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Pagination Controls ── */}
            {!isLibraryLoading && mediaTotalPages > 1 && (
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2">
                <p className="text-[11px] text-slate-600 font-semibold shrink-0">
                  Page {mediaPage} of {mediaTotalPages} ({mediaTotalItems} items)
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={mediaPage <= 1}
                    onClick={() => setMediaPage((p) => Math.max(1, p - 1))}
                    className="h-7 px-2.5 text-xs font-semibold"
                  >
                    ← Prev
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={mediaPage >= mediaTotalPages}
                    onClick={() => setMediaPage((p) => Math.min(mediaTotalPages, p + 1))}
                    className="h-7 px-2.5 text-xs font-semibold"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between w-full">
              <span className="text-xs text-slate-600 font-medium">
                {tempSelectedAsset ? `Selected: ${tempSelectedAsset.title}` : "Select a map image"}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLibraryOpen(false)}
                  className="text-xs font-semibold h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!tempSelectedAsset}
                  onClick={handleConfirmSelection}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-8 cursor-pointer disabled:opacity-50"
                >
                  Use Selected Map
                </Button>
              </div>
            </DialogFooter>
          </div>
        </AdminModal>
      )}

      {/* Confirmation Modal */}
      <AdminConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          handleRemove();
          setShowDeleteConfirm(false);
        }}
        title="Remove Route Map"
        description="Are you sure you want to remove the route map from this package? This action cannot be undone."
        confirmText="Remove Map"
        variant="danger"
      />
    </div>
  );
}
