"use client";

import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  UploadCloud,
  FolderOpen,
  Loader2,
  Check,
  Search,
  Maximize2,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { DialogFooter } from "@/components/ui/dialog";
import { MediaService } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";

interface TripGalleryManagerProps {
  images: string[];
  galleryMediaIds?: string[];
  onChange: (images: string[], mediaIds?: string[]) => void;
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
  const [isUploading, setIsUploading] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isDirectUrlOpen, setIsDirectUrlOpen] = useState(false);
  const [directUrlInput, setDirectUrlInput] = useState("");
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  // Load backend media library
  useEffect(() => {
    if (isLibraryOpen) {
      MediaService.getAllMedia()
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            setMediaAssets(
              res.map((m: any) => ({
                id: m.id || Math.random().toString(),
                title: m.title || m.originalName || "Media Asset",
                url: m.url,
                category: m.category,
              }))
            );
          }
        })
        .catch((e) => console.warn("Failed to load media assets:", e));
    }
  }, [isLibraryOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const uploadedUrls: string[] = [];
    const uploadedMediaIds: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await MediaService.uploadFile(file);
        const url = res?.data?.url || (res as any)?.url;
        const mediaId = res?.data?.id;

        if (url) uploadedUrls.push(url);
        if (mediaId) uploadedMediaIds.push(mediaId);
      }
      if (uploadedUrls.length > 0) {
        const nextImages = [...images, ...uploadedUrls];
        const nextMediaIds = Array.from(new Set([...galleryMediaIds, ...uploadedMediaIds]));
        onChange(nextImages, nextMediaIds);
        toast.success(`${uploadedUrls.length} image(s) uploaded to gallery`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image(s)");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleAddDirectUrl = () => {
    if (!directUrlInput.trim()) return;
    const url = directUrlInput.trim();
    if (!images.includes(url)) {
      const nextImages = [...images, url];
      onChange(nextImages, galleryMediaIds);
      toast.success("Image URL added to gallery");
    }
    setDirectUrlInput("");
    setIsDirectUrlOpen(false);
  };

  const handleRemoveImage = (index: number) => {
    const nextImages = images.filter((_, i) => i !== index);
    const nextMediaIds = galleryMediaIds.filter((_, i) => i !== index);
    onChange(nextImages, nextMediaIds);
    toast.info("Image removed from gallery");
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

    const nextMediaIds = [...galleryMediaIds];
    if (index < nextMediaIds.length && targetIdx < nextMediaIds.length) {
      const tempId = nextMediaIds[index];
      nextMediaIds[index] = nextMediaIds[targetIdx];
      nextMediaIds[targetIdx] = tempId;
    }
    onChange(nextImages, nextMediaIds);
  };

  const handleConfirmLibrarySelection = () => {
    const nextImages = Array.from(new Set([...images, ...selectedUrls]));
    const nextMediaIds = Array.from(new Set([...galleryMediaIds, ...selectedMediaIds]));
    onChange(nextImages, nextMediaIds);
    setSelectedUrls([]);
    setSelectedMediaIds([]);
    setIsLibraryOpen(false);
    toast.success("Selected media added to package gallery");
  };

  const toggleLibrarySelection = (asset: MediaAsset) => {
    const url = asset.url;

    if (selectedUrls.includes(url)) {
      setSelectedUrls(selectedUrls.filter((u) => u !== url));
      if (asset.id) {
        setSelectedMediaIds(selectedMediaIds.filter((id) => id !== asset.id));
      }
    } else {
      setSelectedUrls([...selectedUrls, url]);
      if (asset.id) {
        setSelectedMediaIds([...selectedMediaIds, asset.id]);
      }
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
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>Package Image Gallery ({images.length})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload multiple photos to showcase the complete visual journey for this package.
          </p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors">
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5" />
                )}
                <span>Upload Photos</span>
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLibraryOpen(true)}
              className="text-xs h-9 px-3 gap-1.5 border-slate-300 hover:bg-slate-100"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Media Library</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDirectUrlOpen(true)}
              className="text-xs h-9 px-2.5 text-slate-600 hover:bg-slate-200"
              title="Add Image URL"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Images Grid */}
      {images.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/70 border border-dashed border-slate-200 rounded-xl">
          <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">No Gallery Images Uploaded</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
            The single Cover Image is set separately under the Media section. Add photos here to create a rich photo gallery for Marketing Associates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs"
            >
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
                    className="p-1 text-white hover:text-emerald-400 transition-colors"
                    title="Zoom Image"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!readOnly && (
                  <div className="flex items-center justify-end gap-1">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, "up")}
                        className="p-1 bg-white/20 hover:bg-white/40 text-white rounded-md text-xs"
                        title="Move Previous"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, "down")}
                        className="p-1 bg-white/20 hover:bg-white/40 text-white rounded-md text-xs"
                        title="Move Next"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-md text-xs"
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

      {/* Direct URL Modal */}
      {isDirectUrlOpen && (
        <AdminModal
          isOpen={isDirectUrlOpen}
          onClose={() => setIsDirectUrlOpen(false)}
          title="Add Image via URL"
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Paste a public image URL to add it directly to this package&apos;s gallery.
            </p>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={directUrlInput}
              onChange={(e) => setDirectUrlInput(e.target.value)}
              className="w-full h-9 text-xs px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDirectUrlOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddDirectUrl}
                disabled={!directUrlInput.trim()}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8"
              >
                Add Image
              </Button>
            </DialogFooter>
          </div>
        </AdminModal>
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
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 text-xs pl-9 pr-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="max-h-80 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
              {filteredAssets.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-400">
                  No matching media found in library.
                </div>
              ) : (
                filteredAssets.map((asset) => {
                  const isSelected = selectedUrls.includes(asset.url);
                  const isAlreadyInGallery = images.includes(asset.url);

                  return (
                    <button
                      key={asset.id}
                      type="button"
                      disabled={isAlreadyInGallery}
                      onClick={() => toggleLibrarySelection(asset)}
                      className={`group relative aspect-4/3 rounded-lg overflow-hidden border text-left transition-all ${
                        isAlreadyInGallery
                          ? "opacity-40 cursor-not-allowed border-slate-200"
                          : isSelected
                          ? "border-emerald-600 ring-2 ring-emerald-500/30"
                          : "border-slate-200 hover:border-emerald-400"
                      }`}
                    >
                      <img
                        src={asset.url}
                        alt={asset.title}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white bg-emerald-600 rounded-full p-1 shadow-md" />
                        </div>
                      )}
                      {isAlreadyInGallery && (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded-full">
                            Added
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsLibraryOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmLibrarySelection}
                disabled={selectedUrls.length === 0}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8"
              >
                Add {selectedUrls.length} Photo(s)
              </Button>
            </DialogFooter>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
