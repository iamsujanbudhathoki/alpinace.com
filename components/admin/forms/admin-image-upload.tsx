"use client";

import { useEffect, useState } from "react";
import { UploadCloud, Image as ImageIcon, Check, FolderOpen, Search, Eye, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { MediaService } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";

interface AdminImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
}

interface MediaAsset {
  id: string;
  title: string;
  category: "Everest & Peaks" | "Annapurna & Lakes" | "Cultural Heritage" | "Helicopter Charters";
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
  {
    id: "media-6",
    title: "Kathmandu Durbar Square & Swayambhunath Temple",
    category: "Cultural Heritage",
    url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  },
];

export function AdminImageUpload({
  label = "Cover Image",
  value,
  onChange,
  error,
}: AdminImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const [showModalUploader, setShowModalUploader] = useState(false);
  const [isDirectUrlOpen, setIsDirectUrlOpen] = useState(false);
  const [directUrlInput, setDirectUrlInput] = useState("");

  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_MEDIA_LIBRARY);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [tempSelectedUrl, setTempSelectedUrl] = useState<string>(value);

  // Load real media assets from backend when library opens
  useEffect(() => {
    if (isLibraryOpen) {
      setTempSelectedUrl(value);
      MediaService.getAllMedia()
        .then((mediaList) => {
          if (Array.isArray(mediaList) && mediaList.length > 0) {
            const mapped: MediaAsset[] = mediaList.map((m: any) => ({
              id: m.id || `media-${Math.random()}`,
              title: m.title || m.originalName || "Uploaded Media",
              category: m.category || "Everest & Peaks",
              url: m.url,
            }));
            setAssets(mapped);
          }
        })
        .catch((e) => console.warn("Failed to load real media assets:", e));
    }
  }, [isLibraryOpen, value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fromModal = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await MediaService.uploadFile(file);
      const url = res?.data?.url || URL.createObjectURL(file);
      if (fromModal) {
        const newAsset: MediaAsset = {
          id: `media-upload-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          category: "Everest & Peaks",
          url: url,
        };
        setAssets([newAsset, ...assets]);
        setTempSelectedUrl(url);
        setShowModalUploader(false);
        if (res.success) {
          toast.success(res.message || `Photo "${file.name}" uploaded to server!`);
        } else {
          toast.error(res.message || "Failed to upload image to server.");
        }
      } else {
        onChange(url);
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
        /* ── Active Image Preview Card ── */
        <div className="rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden shadow-xs">
          <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Cover Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

            {/* Quick Overlay Action on Hover */}
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => openSingleImage(value, label, e.currentTarget)}
                title="View Fullscreen"
                className="h-8 px-3 rounded-lg bg-white/90 hover:bg-white text-slate-900 font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmRemoveOpen(true)}
                title="Remove Image"
                className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Action Bar Beneath Preview */}
          <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, false)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                className="text-xs font-semibold h-8 px-3 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1.5"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>Replace File</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsLibraryOpen(true)}
                className="text-xs font-semibold h-8 px-3 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1.5"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>Media Library</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmRemoveOpen(true)}
                className="text-xs font-semibold h-8 px-2.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Empty State Modern Upload Dropzone ── */
        <div className="space-y-3">
          <div className="relative rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-400/80 bg-slate-50/70 hover:bg-amber-500/5 transition-all p-6 text-center flex flex-col items-center justify-center group cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, false)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-amber-600 font-bold text-xs py-3">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span>Uploading image to Cloudflare R2...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-900">
                  Drag &amp; drop an image here, or <span className="text-amber-600 underline">browse files</span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  PNG, JPG, WebP up to 10MB (16:9 ratio recommended)
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLibraryOpen(true)}
              className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border-slate-200 font-semibold text-xs h-8.5 rounded-xl cursor-pointer shadow-2xs inline-flex items-center justify-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Choose from Media Library</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDirectUrlOpen(!isDirectUrlOpen)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 h-8.5 px-3 rounded-xl cursor-pointer"
            >
              Paste URL
            </Button>
          </div>

          {/* Optional Direct URL Input Accordion */}
          {isDirectUrlOpen && (
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="url"
                value={directUrlInput}
                onChange={(e) => setDirectUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/... or https://..."
                className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleApplyDirectUrl}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-8 px-3 rounded-lg cursor-pointer"
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs font-bold text-rose-600 mt-1">{error}</p>}



      {/* CONFIRM IMAGE REMOVAL MODAL */}
      <AdminModal
        isOpen={isConfirmRemoveOpen}
        onClose={() => setIsConfirmRemoveOpen(false)}
        title="Remove Cover Image"
        description="Are you sure you want to remove this cover image? You can upload a new photo or select from the Media Library at any time."
        maxWidth="md"
      >
        <DialogFooter className="pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsConfirmRemoveOpen(false)}
            className="text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onChange("");
              setIsConfirmRemoveOpen(false);
              toast.info("Cover image removed.");
            }}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
          >
            Remove Image
          </Button>
        </DialogFooter>
      </AdminModal>

      {/* MEDIA LIBRARY MODAL */}
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
        <div className="space-y-4 py-2 text-xs">
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

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-black text-slate-950 uppercase tracking-wider whitespace-nowrap">
                  Category:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-950 font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
                >
                  <option value="All">All Categories</option>
                  <option value="Everest & Peaks">Everest &amp; Peaks</option>
                  <option value="Annapurna & Lakes">Annapurna &amp; Lakes</option>
                  <option value="Cultural Heritage">Cultural Heritage &amp; Resorts</option>
                  <option value="Helicopter Charters">Helicopter Charters</option>
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
                  <p className="text-xs text-slate-700 font-semibold mt-0.5">Uploaded file will be instantly added to gallery and highlighted below.</p>
                </>
              )}
            </div>
          )}

          {/* Spacious Taller 4-column Media Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[520px] min-h-[320px] overflow-y-auto p-1">
            {filteredAssets.map((asset) => {
              const isSelected = tempSelectedUrl === asset.url;
              return (
                <div
                  key={asset.id}
                  onClick={() => setTempSelectedUrl(asset.url)}
                  className={`group relative aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    isSelected ? "border-amber-500 ring-2 ring-amber-500/30 scale-[1.02]" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.url} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-2 flex flex-col justify-end">
                    <span className="text-xs font-bold text-white leading-tight drop-shadow-xs line-clamp-1">
                      {asset.title}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 p-1 rounded-full shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explicit Bottom Right Footer Action Bar */}
          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-900 font-extrabold">
              {tempSelectedUrl ? "1 Image Asset Highlighted" : "No asset selected"}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLibraryOpen(false)}
                className="text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={() => {
                  if (tempSelectedUrl) {
                    onChange(tempSelectedUrl);
                    toast.success("Cover image applied successfully!");
                  }
                  setIsLibraryOpen(false);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Select Image &amp; Apply
              </Button>
            </div>
          </DialogFooter>
        </div>
      </AdminModal>
    </div>
  );
}
