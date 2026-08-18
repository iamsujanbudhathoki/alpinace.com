"use client";

import { useEffect, useState, useMemo } from "react";
import {
  UploadCloud,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Eye,
  Check,
  Search,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { DialogFooter } from "@/components/ui/dialog";
import { MediaService } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";

interface AdminImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string, mediaId?: string) => void;
  error?: string;
}

interface MediaAsset {
  id: string;
  title: string;
  categoryId?: string;
  categoryName?: string;
  category?: string;
  url: string;
}

const INITIAL_MEDIA_LIBRARY: MediaAsset[] = [
  {
    id: "media-1",
    title: "Everest Base Camp & Khumbu Glacier",
    category: "Everest & Peaks",
    url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "media-2",
    title: "Annapurna Range Sunrise over Machhapuchhre",
    category: "Annapurna & Lakes",
    url: "https://images.unsplash.com/photo-1585409677983-0f6c41ca913b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "media-3",
    title: "Langtang Rhododendron Alpine Valley",
    category: "Annapurna & Lakes",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "media-4",
    title: "Manaslu Larkya La Pass Wilderness",
    category: "Everest & Peaks",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "media-5",
    title: "Everest Luxury Helicopter Sightseeing Charter",
    category: "Helicopter Charters",
    url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
  },
];

// Helper to deduplicate assets by URL
const deduplicateAssets = (list: MediaAsset[]): MediaAsset[] => {
  const seen = new Set<string>();
  return list.filter((item) => {
    if (!item || !item.url) return false;
    const cleanUrl = item.url.trim();
    if (seen.has(cleanUrl)) return false;
    seen.add(cleanUrl);
    return true;
  });
};

export function AdminImageUpload({
  label = "Cover Image",
  value,
  onChange,
  error,
}: AdminImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const [showModalUploader, setShowModalUploader] = useState(false);
  const [isDirectUrlOpen, setIsDirectUrlOpen] = useState(false);
  const [directUrlInput, setDirectUrlInput] = useState("");

  const [assets, setAssets] = useState<MediaAsset[]>(deduplicateAssets(INITIAL_MEDIA_LIBRARY));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [tempSelectedUrl, setTempSelectedUrl] = useState<string>(value);

  // Load real media assets from backend when library opens
  useEffect(() => {
    if (isLibraryOpen) {
      setTempSelectedUrl(value);
      setIsLibraryLoading(true);
      MediaService.getAllMedia()
        .then((res: any) => {
          const mediaList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          if (mediaList.length > 0) {
            const mapped: MediaAsset[] = mediaList.map((m: any) => ({
              id: m.id || `media-${Math.random()}`,
              title: m.title || m.name || m.originalName || "Uploaded Media",
              categoryId: m.categoryId,
              categoryName: m.categoryName || m.category?.name || "General",
              category: m.categoryName || m.category?.name || "General",
              url: m.url,
            }));
            setAssets(deduplicateAssets(mapped));
          } else {
            setAssets(deduplicateAssets(INITIAL_MEDIA_LIBRARY));
          }
        })
        .catch((e) => {
          console.warn("Failed to load real media assets:", e);
          setAssets(deduplicateAssets(INITIAL_MEDIA_LIBRARY));
        })
        .finally(() => {
          setIsLibraryLoading(false);
        });
    }
  }, [isLibraryOpen, value]);

  // Compute unique categories list from available assets
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    assets.forEach((a) => {
      if (a.category && a.category !== "All") set.add(a.category);
    });
    return ["All", ...Array.from(set)];
  }, [assets]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fromModal = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await MediaService.uploadFile(file);
      const url = res?.data?.url || URL.createObjectURL(file);
      const mediaId = res?.data?.id;

      if (fromModal) {
        const newAsset: MediaAsset = {
          id: mediaId || `media-upload-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          category: "General",
          url: url,
        };
        setAssets((prev) => deduplicateAssets([newAsset, ...prev]));
        setTempSelectedUrl(url);
        setShowModalUploader(false);
        if (res.success) {
          toast.success(res.message || `Photo "${file.name}" uploaded to server!`);
        } else {
          toast.error(res.message || "Failed to upload image to server.");
        }
      } else {
        onChange(url, mediaId);
        if (res.success) {
          toast.success(res.message || "Cover image uploaded successfully!");
        } else {
          toast.error(res.message || "Failed to upload cover image.");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyDirectUrl = () => {
    if (!directUrlInput.trim()) return;
    onChange(directUrlInput.trim());
    setDirectUrlInput("");
    setIsDirectUrlOpen(false);
    toast.success("Image URL applied successfully!");
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || asset.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-900 text-xs tracking-tight">{label}</label>
        {value && (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 inline-flex items-center gap-1">
            <Check className="w-3 h-3" />
            Image Active
          </span>
        )}
      </div>

      {value ? (
        /* ── Compact Active Image Preview Card ── */
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Small Compact Thumbnail with Lightbox click */}
            <div
              onClick={(e) => openSingleImage(value, label, e.currentTarget)}
              className="relative w-36 h-20 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 group cursor-pointer shadow-xs"
              title="Click for Lightbox Full View"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Cover Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="min-w-0 space-y-1">
              <p className="text-xs font-bold text-slate-900 truncate max-w-[220px]">
                {value.split("/").pop() || "Cover Image"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => openSingleImage(value, label, e.currentTarget)}
                  className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>View Lightbox</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLibraryOpen(true)}
              className="text-xs font-bold h-8 px-3 border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 mr-1 text-slate-600" />
              Change Photo
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsConfirmRemoveOpen(true)}
              className="text-xs font-bold h-8 px-2.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
              title="Remove Cover Image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        /* ── Clean Compact Dropzone Box ── */
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-100/50 transition-colors relative flex flex-col items-center justify-center text-center group cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, false)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          {isUploading ? (
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading cover image...</span>
            </div>
          ) : (
            <div className="space-y-1.5 py-1">
              <div className="w-10 h-10 rounded-full bg-amber-100/80 border border-amber-200/80 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                <UploadCloud className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Click or drag image file here to upload
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  High-res WebP, JPG, or PNG (Max 5MB)
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-2 z-20 relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLibraryOpen(true);
                  }}
                  className="text-xs font-bold h-7 px-2.5 bg-white border-slate-300 hover:bg-slate-100 shadow-2xs cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Media Library
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDirectUrlOpen(true);
                  }}
                  className="text-xs font-bold h-7 px-2 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Image URL
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

      {/* DIRECT URL MODAL */}
      {isDirectUrlOpen && (
        <AdminModal
          isOpen={isDirectUrlOpen}
          onClose={() => setIsDirectUrlOpen(false)}
          title="Direct Cover Image URL"
          description="Paste an external image link (e.g. Unsplash or Cloudflare R2)."
          maxWidth="md"
        >
          <div className="space-y-3 py-2">
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={directUrlInput}
              onChange={(e) => setDirectUrlInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDirectUrlOpen(false)}
                className="text-xs font-bold h-8"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyDirectUrl}
                disabled={!directUrlInput.trim()}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs h-8"
              >
                Apply URL
              </Button>
            </DialogFooter>
          </div>
        </AdminModal>
      )}

      {/* CONFIRM REMOVE MODAL */}
      {isConfirmRemoveOpen && (
        <AdminModal
          isOpen={isConfirmRemoveOpen}
          onClose={() => setIsConfirmRemoveOpen(false)}
          title="Remove Cover Image?"
          description="Are you sure you want to remove the cover image selection?"
          maxWidth="sm"
        >
          <div className="pt-2">
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmRemoveOpen(false)}
                className="text-xs font-bold h-8"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onChange("");
                  setIsConfirmRemoveOpen(false);
                  toast.info("Cover image removed.");
                }}
                className="text-xs font-bold h-8"
              >
                Remove
              </Button>
            </DialogFooter>
          </div>
        </AdminModal>
      )}

      {/* MEDIA LIBRARY MODAL */}
      {isLibraryOpen && (
        <AdminModal
          isOpen={isLibraryOpen}
          onClose={() => {
            setIsLibraryOpen(false);
            setShowModalUploader(false);
          }}
          title="Media Library"
          description="Select a cover photo or upload new media."
          maxWidth="2xl"
        >
          <div className="space-y-4 py-2 text-xs flex-1 min-h-0 flex flex-col">
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-900" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search photo asset title..."
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-950 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-black text-slate-950 uppercase tracking-wider whitespace-nowrap">
                    Category:
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-950 font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "All" ? "All Categories" : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowModalUploader(!showModalUploader)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {showModalUploader ? "Hide Uploader" : "Upload New Media"}
                </Button>
              </div>
            </div>

            {/* Inline Modal Uploader Box */}
            {showModalUploader && (
              <div className="border-2 border-dashed border-amber-400 rounded-xl p-4 text-center bg-amber-50/50 relative cursor-pointer animate-in fade-in-0 duration-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, true)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2 text-amber-600 font-bold text-xs py-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading media file to server...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-900">
                      Drop new image file here or click to upload
                    </p>
                    <p className="text-xs text-slate-700 font-semibold mt-0.5">
                      Uploaded file will be instantly added to gallery and highlighted below.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* ── Media Grid with Loading Skeleton & Empty State ── */}
            {isLibraryLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 flex-1 min-h-[280px] overflow-y-auto p-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[16/10] rounded-xl bg-slate-100 border border-slate-200 animate-pulse flex flex-col justify-end p-2.5"
                  >
                    <div className="h-3 bg-slate-200 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 my-2">
                <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-800">No media assets found</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Try searching another title or upload a new photo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 flex-1 min-h-0 overflow-y-auto p-1">
                {filteredAssets.map((asset) => {
                  const isSelected = tempSelectedUrl === asset.url;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setTempSelectedUrl(asset.url)}
                      className={`group relative aspect-[16/10] rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-amber-500 ring-2 ring-amber-500/30 scale-[1.02]"
                          : "border-slate-200 hover:border-slate-400 bg-slate-900"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.url}
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80";
                        }}
                      />

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-2.5 pt-6 flex flex-col justify-end">
                        <span className="text-[11px] font-bold text-white leading-tight drop-shadow-sm line-clamp-1">
                          {asset.title}
                        </span>
                        {asset.category && (
                          <span className="text-[9px] font-semibold text-slate-300 tracking-wide uppercase line-clamp-1 mt-0.5">
                            {asset.category}
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 p-1 rounded-full shadow-md z-10">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Explicit Bottom Right Footer Action Bar */}
            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-900 font-extrabold">
                {tempSelectedUrl ? "1 Image Asset Highlighted" : "No asset selected"}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsLibraryOpen(false);
                    setShowModalUploader(false);
                  }}
                  className="text-xs font-bold h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!tempSelectedUrl}
                  onClick={() => {
                    const selectedObj = assets.find((a) => a.url === tempSelectedUrl);
                    onChange(tempSelectedUrl, selectedObj?.id);
                    setIsLibraryOpen(false);
                    setShowModalUploader(false);
                    toast.success("Cover image selected from media library!");
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs h-8"
                >
                  Use Selected Image
                </Button>
              </div>
            </DialogFooter>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
