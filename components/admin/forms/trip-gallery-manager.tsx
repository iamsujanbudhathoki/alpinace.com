"use client";

import { useState, useEffect } from "react";
import {
  FolderOpen,
  Image as ImageIcon,
  Maximize2,
  MoveDown,
  MoveUp,
  Search,
  Trash2,
  Check,
  Plus,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { DialogFooter } from "@/components/ui/dialog";
import { MediaService } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";

interface TripGalleryManagerProps {
  images: string[];
  galleryMediaIds?: string[];
  onChange: (images: string[], mediaIds: string[]) => void;
  readOnly?: boolean;
}

interface MediaAsset {
  id: string;
  title: string;
  url: string;
  category?: string;
}

export function TripGalleryManager({
  images = [],
  galleryMediaIds = [],
  onChange,
  readOnly = false,
}: TripGalleryManagerProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showModalUploader, setShowModalUploader] = useState(false);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await MediaService.uploadFile(file);
      if (res.success && res.data?.url) {
        const url = res.data.url;
        const mediaId = res.data.id;
        const newAsset: MediaAsset = {
          id: mediaId,
          title: file.name.replace(/\.[^/.]+$/, ""),
          category: "General",
          url: url,
        };
        setMediaAssets((prev) => [newAsset, ...prev.filter((a) => a.url !== url)]);
        if (!selectedUrls.includes(url)) {
          setSelectedUrls((prev) => [...prev, url]);
          setSelectedMediaIds((prev) => [...prev, mediaId]);
        }
        setShowModalUploader(false);
        toast.success(res.message || `Photo "${file.name}" uploaded to media library!`);
      } else {
        toast.error(res?.message || "Failed to upload photo.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err?.message || "Failed to upload photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const MEDIA_LIMIT = 12;
  const [mediaPage, setMediaPage] = useState(1);
  const [mediaTotalPages, setMediaTotalPages] = useState(1);
  const [mediaTotalItems, setMediaTotalItems] = useState(0);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadMedia = async (page: number, search?: string) => {
    setIsLibraryLoading(true);
    try {
      const res: any = await MediaService.getAllMedia({
        limit: MEDIA_LIMIT,
        page,
        search: search?.trim() || undefined,
      });
      const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      const pagination = (res as any).pagination ?? res?.pagination;
      const mapped: MediaAsset[] = items.map((m: any) => ({
        id: m.id || `media-${Math.random()}`,
        title: m.title || m.name || m.originalName || "Media Asset",
        category: m.categoryName || m.category?.name || m.category,
        url: m.url,
      }));
      setMediaAssets(mapped);
      if (pagination) {
        setMediaTotalPages(pagination.lastPage ?? pagination.pageCount ?? 1);
        setMediaTotalItems(pagination.count ?? pagination.total ?? mapped.length);
      } else {
        setMediaTotalPages(1);
        setMediaTotalItems(mapped.length);
      }
    } catch (e) {
      console.warn("Failed to load media assets:", e);
      setMediaAssets([]);
    } finally {
      setIsLibraryLoading(false);
    }
  };

  useEffect(() => {
    if (isLibraryOpen) {
      loadMedia(mediaPage, debouncedSearch);
    }
  }, [isLibraryOpen, mediaPage, debouncedSearch]);

  useEffect(() => {
    if (isLibraryOpen) setMediaPage(1);
  }, [debouncedSearch]);

  const [imageToDelete, setImageToDelete] = useState<{
    index: number;
    url: string;
  } | null>(null);

  const handleConfirmRemoveImage = () => {
    if (imageToDelete !== null) {
      const nextImages = images.filter((_, i) => i !== imageToDelete.index);
      const nextMediaIds = (galleryMediaIds || []).filter((_, i) => i !== imageToDelete.index);
      onChange(nextImages, nextMediaIds);
      toast.info("Image removed from gallery");
      setImageToDelete(null);
    }
  };

  const handleMoveImage = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === images.length - 1)
    ) {
      return;
    }
    const nextImages = [...images];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = nextImages[index];
    nextImages[index] = nextImages[targetIdx];
    nextImages[targetIdx] = temp;

    const nextMediaIds = [...(galleryMediaIds || [])];
    if (index < nextMediaIds.length && targetIdx < nextMediaIds.length) {
      const tempId = nextMediaIds[index];
      nextMediaIds[index] = nextMediaIds[targetIdx];
      nextMediaIds[targetIdx] = tempId;
    }
    onChange(nextImages, nextMediaIds);
  };

  const handleConfirmLibrarySelection = () => {
    const nextImages = [...images];
    const nextMediaIds = [...(galleryMediaIds || [])];

    selectedUrls.forEach((url, i) => {
      if (!nextImages.includes(url)) {
        nextImages.push(url);
        const id = selectedMediaIds[i];
        if (id) nextMediaIds.push(id);
      }
    });

    onChange(nextImages, nextMediaIds);
    setSelectedUrls([]);
    setSelectedMediaIds([]);
    setIsLibraryOpen(false);
    toast.success("Selected media added to package gallery");
  };

  const toggleLibrarySelection = (asset: MediaAsset) => {
    const url = asset.url;
    const assetId = asset.id;

    if (selectedUrls.includes(url)) {
      setSelectedUrls(selectedUrls.filter((u) => u !== url));
      setSelectedMediaIds(selectedMediaIds.filter((id) => id !== assetId));
    } else {
      setSelectedUrls([...selectedUrls, url]);
      setSelectedMediaIds([...selectedMediaIds, assetId]);
    }
  };

  const filteredAssets = mediaAssets.filter(
    (a) =>
      !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <span>Package Image Gallery ({images.length})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select photos from your Media Library to showcase the complete visual journey for this package.
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
            <span>Browse Media Library</span>
          </Button>
        )}
      </div>

      {/* Images Grid */}
      {images.length === 0 ? (
        <div
          onClick={() => !readOnly && setIsLibraryOpen(true)}
          className={`p-8 text-center bg-slate-50/70 border border-dashed border-slate-200 rounded-xl space-y-3 ${
            !readOnly ? "cursor-pointer hover:bg-slate-100/60 transition-colors" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">No Gallery Images Added</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
              The single Cover Image is set separately. Choose photos here from your Media Library to create a rich photo gallery.
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
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Gallery Photo ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Overlay Badges & Actions */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white bg-slate-900/80 px-1.5 py-0.5 rounded-md">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => openSingleImage(url, `Gallery Image ${idx + 1}`)}
                    className="p-1 bg-white/80 hover:bg-white text-slate-900 rounded-md text-xs cursor-pointer"
                    title="Fullscreen Lightbox"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>

                {!readOnly && (
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveImage(idx, "up")}
                        className="p-1 bg-white/80 hover:bg-white text-slate-900 rounded-md text-xs disabled:opacity-30 cursor-pointer"
                        title="Move Earlier"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => handleMoveImage(idx, "down")}
                        className="p-1 bg-white/80 hover:bg-white text-slate-900 rounded-md text-xs disabled:opacity-30 cursor-pointer"
                        title="Move Later"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setImageToDelete({ index: idx, url })}
                      className="p-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-md text-xs cursor-pointer"
                      title="Remove Image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Library Selector Modal */}
      {isLibraryOpen && (
        <AdminModal
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          title="Select Photos from Media Library"
          maxWidth="3xl"
        >
          <div className="space-y-4">
            {/* Toolbar: Search + Upload New Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 text-xs pl-9 pr-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 dark:focus:border-slate-400 dark:focus:ring-slate-400/10 transition-colors"
                />
              </div>
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
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center bg-slate-50 dark:bg-slate-900/50 relative cursor-pointer animate-in fade-in-0 duration-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFile}
                  disabled={isUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200 font-semibold text-xs py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Uploading photo to media library...</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadCloud className="w-5 h-5 text-slate-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Drop photo here or click to upload
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Photo will be added to your Media Library and selected automatically.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Media Grid ── */}
            {isLibraryLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 p-1">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse overflow-hidden">
                    <div style={{ height: 90 }} className="bg-slate-200/80 dark:bg-slate-700 w-full" />
                    <div className="p-2 space-y-1.5">
                      <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-slate-400">
                No matching media found in library.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto p-1">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedUrls.includes(asset.url);
                  const isAlreadyInGallery = images.includes(asset.url);

                  return (
                    <button
                      key={asset.id}
                      type="button"
                      disabled={isAlreadyInGallery}
                      onClick={() => toggleLibrarySelection(asset)}
                      className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all block w-full cursor-pointer ${
                        isAlreadyInGallery
                          ? "opacity-40 cursor-not-allowed border-slate-200"
                          : isSelected
                          ? "border-amber-500 ring-2 ring-amber-500/30 shadow-md"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <div className="relative h-24 bg-slate-800 overflow-hidden">
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
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-slate-900 text-white p-1 rounded-full shadow-md z-10">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        {isAlreadyInGallery && (
                          <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded">
                              Added
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-1.5 bg-white dark:bg-slate-900">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                          {asset.title}
                        </p>
                        {asset.category && (
                          <p className="text-[9px] text-slate-500 truncate mt-0.5">
                            {asset.category}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

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

            <DialogFooter className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-600 font-semibold">
                {selectedUrls.length} image(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLibraryOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={selectedUrls.length === 0}
                  onClick={handleConfirmLibrarySelection}
                  className="bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  Add Selected Images
                </Button>
              </div>
            </DialogFooter>
          </div>
        </AdminModal>
      )}

      {/* Delete Single Photo Confirmation */}
      {imageToDelete && (
        <AdminConfirmModal
          isOpen={!!imageToDelete}
          onClose={() => setImageToDelete(null)}
          onConfirm={handleConfirmRemoveImage}
          title="Remove Photo from Gallery"
          description="Are you sure you want to remove this photo from the package gallery? You can always re-add it from the media library later."
          confirmText="Remove Photo"
          variant="danger"
        />
      )}
    </div>
  );
}
