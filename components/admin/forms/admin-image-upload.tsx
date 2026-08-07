"use client";

import { useEffect, useState } from "react";
import { UploadCloud, Image as ImageIcon, Check, FolderOpen, Search, Eye, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { MediaService } from "@/lib/services/admin-service";

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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const [showModalUploader, setShowModalUploader] = useState(false);

  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_MEDIA_LIBRARY);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [tempSelectedUrl, setTempSelectedUrl] = useState<string>(value);

  useEffect(() => {
    if (isLibraryOpen) {
      setTempSelectedUrl(value);
    }
  }, [isLibraryOpen, value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fromModal = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await MediaService.uploadFile(file);
      const url = res?.data?.url  || URL.createObjectURL(file);
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
        toast.success(res.message || `Photo "${file.name}" uploaded to server! Click "Select Image & Apply" below.`);
      } else {
        onChange(url);
        toast.success(res.message || "Cover image file uploaded to server successfully!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || asset.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-2">
      <label className="font-bold text-slate-800 block text-xs">{label}</label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Preview Thumbnail Box with Hover Actions */}
        <div className="relative aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center group shadow-xs">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-3">
              <ImageIcon className="w-6 h-6 text-slate-700 mx-auto mb-1" />
              <span className="text-xs text-slate-800 font-bold">No Cover Image Selected</span>
            </div>
          )}

          {/* Hover Quick Actions Overlay */}
          {value && (
            <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                title="View Fullscreen Image"
                className="w-9 h-9 bg-white text-slate-800 hover:bg-slate-100 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-amber-600" />
              </button>

              <button
                type="button"
                onClick={() => setIsConfirmRemoveOpen(true)}
                title="Remove Cover Image"
                className="w-9 h-9 bg-rose-600 text-white hover:bg-rose-500 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Upload Controls & Media Library Button */}
        <div className="col-span-2 space-y-3">
          <div className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-3 text-center transition-colors bg-slate-50 relative cursor-pointer flex flex-col items-center justify-center min-h-[90px]">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, false)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            {isUploading ? (
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading local file to server...</span>
              </div>
            ) : (
              <>
                <UploadCloud className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-900">
                  Click or Drag &amp; Drop Image File
                </p>
                <p className="text-xs text-slate-700 font-semibold mt-0.5">Supports PNG, JPG, WebP up to 10MB</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLibraryOpen(true)}
              className="w-full bg-white hover:bg-slate-50 text-slate-900 border-slate-300 font-bold text-xs cursor-pointer shadow-xs py-2 flex items-center justify-center gap-2"
            >
              <FolderOpen className="w-4 h-4 text-amber-500" />
              Browse Media Library &amp; Gallery
            </Button>
          </div>
        </div>
      </div>

      {error && <p className="text-xs font-bold text-rose-600 mt-0.5">{error}</p>}

      {/* ULTRA-CLEAN FULLSCREEN LIGHTBOX MODAL */}
      <AdminModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        maxWidth="full"
        hideHeader={true}
        variant="dark"
        preventOutsideClose={false}
      >
        <div className="w-full h-[85vh] flex items-center justify-center p-2 rounded-xl bg-slate-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Enlarged Cover Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
      </AdminModal>

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
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-700" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photo asset title..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">
                  Category:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-900 font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
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
            <div className="text-xs text-slate-700 font-bold">
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
