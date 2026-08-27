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
import { CategoryService, MediaService } from "@/lib/services/admin-service";
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

// Helper to normalize URL for strict deduplication
const normalizeUrl = (url: string): string => {
  if (!url) return "";
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
};

// Deduplicate assets strictly by normalized URL
const deduplicateAssets = (list: MediaAsset[]): MediaAsset[] => {
  const seen = new Set<string>();
  return list.filter((item) => {
    if (!item || !item.url) return false;
    const key = normalizeUrl(item.url);
    if (seen.has(key)) return false;
    seen.add(key);
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
  const [showModalUploader, setShowModalUploader] = useState(false);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<MediaAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // selectedCategory stores categoryId or "All"
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [tempSelectedUrl, setTempSelectedUrl] = useState<string>(value);

  // Pagination state for modal media grid
  const [mediaPage, setMediaPage] = useState(1);
  const [mediaTotalPages, setMediaTotalPages] = useState(1);
  const [mediaTotalItems, setMediaTotalItems] = useState(0);
  const MEDIA_LIMIT = 12;
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 350ms debounce on search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadMedia = async (page: number, categoryId: string, search?: string) => {
    setIsLibraryLoading(true);
    try {
      const res: any = await MediaService.getAllMedia({
        categoryId: categoryId !== "All" ? categoryId : undefined,
        search: search?.trim() || undefined,
        limit: MEDIA_LIMIT,
        page,
      });
      const mediaList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      const pagination = (res as any).pagination ?? res?.pagination;
      const mapped: MediaAsset[] = mediaList.map((m: any) => ({
        id: m.id || `media-${Math.random()}`,
        title: m.title || m.name || "Uploaded Media",
        categoryId: m.categoryId ?? undefined,
        categoryName: m.categoryName ?? "",
        category: m.categoryName ?? "",
        url: m.url,
      }));
      setAssets(deduplicateAssets(mapped));
      if (pagination) {
        setMediaTotalPages(pagination.lastPage ?? pagination.pageCount ?? 1);
        setMediaTotalItems(pagination.count ?? pagination.total ?? mapped.length);
      } else {
        setMediaTotalPages(1);
        setMediaTotalItems(mapped.length);
      }
    } catch (e) {
      console.warn("Failed to load media:", e);
      setAssets([]);
    } finally {
      setIsLibraryLoading(false);
    }
  };

  // Open modal: reset state and load data
  useEffect(() => {
    if (isLibraryOpen) {
      setTempSelectedUrl(value);
      setMediaPage(1);
      setSelectedCategory("All");
      setSearchQuery("");
      // Load categories
      CategoryService.getAll({ limit: 100 })
        .then((res: any) => {
          const list = Array.isArray(res) ? res : [];
          setCategories(list.map((c: any) => ({ id: c.id, name: c.name ?? c.title ?? "" })));
        })
        .catch(() => {});
      loadMedia(1, "All");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLibraryOpen]);

  // Reload when page, category, or debounced search changes
  useEffect(() => {
    if (isLibraryOpen) {
      loadMedia(mediaPage, selectedCategory, debouncedSearch);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaPage, selectedCategory, debouncedSearch]);

  // Reset page to 1 when search or category changes
  useEffect(() => {
    if (isLibraryOpen) setMediaPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategory]);

  // Compute unique categories list from available assets (fallback if backend categories not loaded)
  const availableCategories = useMemo(() => {
    if (categories.length > 0) {
      return [{ id: "All", name: "All Categories" }, ...categories];
    }
    // Derive from assets
    const seen = new Map<string, string>();
    assets.forEach((a) => {
      if (a.categoryId && a.categoryName) seen.set(a.categoryId, a.categoryName);
    });
    const derived = Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
    return [{ id: "All", name: "All Categories" }, ...derived];
  }, [assets, categories]);

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

  const handleDeleteAsset = async () => {
    if (!deleteConfirmAsset) return;
    setIsDeleting(true);
    try {
      const res = await MediaService.delete(deleteConfirmAsset.id);
      if (res.success) {
        toast.success("Media asset deleted.");
        setAssets((prev) => prev.filter((a) => a.id !== deleteConfirmAsset.id));
        if (tempSelectedUrl === deleteConfirmAsset.url) setTempSelectedUrl("");
      } else {
        toast.error(res.message || "Failed to delete asset.");
      }
    } catch {
      toast.error("Failed to delete asset.");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmAsset(null);
    }
  };

  // All filtering (search + category) is server-side — use assets directly
  const filteredAssets = assets;

  return (
    <div className="space-y-2.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-900 text-xs tracking-tight">{label}</label>
          {value && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 inline-flex items-center gap-1">
              <Check className="w-3 h-3" />
              Image Active
            </span>
          )}
        </div>
      )}

      {value ? (
        /* ── Modern Responsive Active Image Card ── */
        <div className="group relative rounded-xl border border-slate-200 bg-slate-950 overflow-hidden shadow-xs">
          <div className="relative w-full h-40 sm:h-44 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label || "Cover Preview"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={(e) => openSingleImage(value, label || "Cover Image", e.currentTarget)}
              title="Click to view full image"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Top Lightbox Button */}
            <button
              type="button"
              onClick={(e) => openSingleImage(value, label || "Cover Image", e.currentTarget)}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-sm flex items-center justify-center transition-transform active:scale-95 cursor-pointer z-10"
              title="Full Screen View"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
            </button>

            {/* Bottom info bar & Action Buttons */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2 z-10">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate drop-shadow-xs max-w-[160px] sm:max-w-[220px]">
                  {value.split("/").pop() || "Cover Image"}
                </p>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Selected</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsLibraryOpen(true)}
                  className="h-7 px-2.5 text-[11px] font-bold bg-white/90 hover:bg-white text-slate-900 backdrop-blur-sm border-0 shadow-sm cursor-pointer"
                >
                  <FolderOpen className="w-3 h-3 mr-1 text-slate-700" />
                  <span>Change</span>
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onChange("");
                    toast.info("Cover image removed.");
                  }}
                  className="h-7 w-7 p-0 bg-rose-600/90 hover:bg-rose-600 text-white backdrop-blur-sm border-0 shadow-sm cursor-pointer flex items-center justify-center"
                  title="Remove Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Clean Compact Dropzone Box ── */
        <div className="border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-100/50 transition-colors relative flex flex-col items-center justify-center text-center group cursor-pointer">
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
                  Drop image here or click to upload
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  WebP, JPG, or PNG (Max 15MB)
                </p>
              </div>
              <div className="pt-1.5 flex items-center justify-center gap-2 z-20 relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLibraryOpen(true);
                  }}
                  className="text-xs font-bold h-7 px-3 bg-white border-slate-300 hover:bg-slate-100 shadow-2xs cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  <span>Choose from Library</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

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
          <div className="space-y-3 py-2 text-xs">
            {/* Header Action Bar */}
            <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {/* Row 1: Search */}
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search media..."
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-950 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
              {/* Row 2: Category + Upload button */}
              <div className="flex items-center gap-2 w-full">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 min-w-0 bg-white border border-slate-300 text-slate-950 font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowModalUploader(!showModalUploader)}
                  className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">{showModalUploader ? "Hide" : "Upload"}</span>
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

            {/* ── Media Grid ── */}
            {isLibraryLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 p-1">
                {Array.from({ length: MEDIA_LIMIT }).map((_, i) => (
                  <div key={i} className="rounded-xl bg-slate-100 border border-slate-200 animate-pulse overflow-hidden">
                    <div style={{ height: 90 }} className="bg-slate-200/80 w-full" />
                    <div className="p-2 space-y-1.5">
                      <div className="h-2.5 bg-slate-200 rounded w-3/4" />
                      <div className="h-2 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAssets.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 my-2"
                style={{ minHeight: 180 }}
              >
                <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-800">No media assets found</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Try a different category or upload new media.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 p-1">
                {filteredAssets.map((asset) => {
                  const isSelected = tempSelectedUrl === asset.url;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setTempSelectedUrl(asset.url)}
                      style={{ cursor: "pointer" }}
                      className={`group rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? "border-amber-500 ring-2 ring-amber-500/30 shadow-md"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {/* Fixed height image container — inline style for guaranteed height */}
                      <div className="relative overflow-hidden bg-slate-900" style={{ height: 90 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.url}
                          alt={asset.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          className="group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        {/* Hover action overlay */}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                          <button
                            type="button"
                            title="View fullscreen"
                            onClick={(e) => {
                              e.stopPropagation();
                              openSingleImage(asset.url, asset.title, e.currentTarget);
                            }}
                            className="w-8 h-8 rounded-full bg-white text-slate-900 hover:bg-amber-50 flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-600" />
                          </button>
                          <button
                            type="button"
                            title="Delete asset"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmAsset(asset);
                            }}
                            className="w-8 h-8 rounded-full bg-rose-600 text-white hover:bg-rose-500 flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow z-20">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      {/* Title + category label */}
                      <div className="px-2 py-1.5 bg-white">
                        <p className="text-[11px] font-bold text-slate-900 truncate leading-tight">{asset.title}</p>
                        {asset.category && (
                          <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{asset.category}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Pagination Controls ── */}
            {!isLibraryLoading && mediaTotalPages > 1 && (
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2">
                <p className="text-[11px] text-slate-600 font-semibold shrink-0">
                  <span className="hidden sm:inline">Page {mediaPage} of {mediaTotalPages} · </span>
                  {mediaTotalItems} items
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={mediaPage <= 1}
                    onClick={() => setMediaPage((p) => Math.max(1, p - 1))}
                    className="h-7 px-2 sm:px-2.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    ← <span className="hidden sm:inline">Prev</span>
                  </button>
                  {/* Page numbers — hidden on xs screens */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(mediaTotalPages, 5) }, (_, i) => {
                      const p = mediaPage <= 3
                        ? i + 1
                        : mediaPage >= mediaTotalPages - 2
                        ? mediaTotalPages - 4 + i
                        : mediaPage - 2 + i;
                      if (p < 1 || p > mediaTotalPages) return null;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setMediaPage(p)}
                          className={`h-7 w-7 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                            mediaPage === p
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "border-slate-200 text-slate-700 bg-white hover:bg-slate-100"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  {/* Mobile: just show current/total */}
                  <span className="sm:hidden text-[11px] font-bold text-slate-700 px-1">{mediaPage}/{mediaTotalPages}</span>
                  <button
                    type="button"
                    disabled={mediaPage >= mediaTotalPages}
                    onClick={() => setMediaPage((p) => Math.min(mediaTotalPages, p + 1))}
                    className="h-7 px-2 sm:px-2.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <span className="hidden sm:inline">Next</span> →
                  </button>
                </div>
              </div>
            )}

            {/* Footer: status + actions */}
            <DialogFooter className="pt-3 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full">
                <div className="text-xs text-slate-700 font-bold text-center sm:text-left">
                  {tempSelectedUrl ? "✓ 1 image selected" : "No image selected"}
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
                    className="flex-1 sm:flex-none text-xs font-bold h-8"
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
                    className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs h-8"
                  >
                    Use Selected Image
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </div>
        </AdminModal>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirmAsset && (
        <AdminModal
          isOpen={!!deleteConfirmAsset}
          onClose={() => !isDeleting && setDeleteConfirmAsset(null)}
          title="Delete Media Asset"
          description="This action is permanent and cannot be undone."
          maxWidth="sm"
        >
          <div className="space-y-4 py-2">
            {/* Preview thumbnail */}
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900" style={{ height: 140 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={deleteConfirmAsset.url}
                alt={deleteConfirmAsset.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs font-semibold text-rose-800">
              <p className="font-bold truncate mb-0.5">"{deleteConfirmAsset.title}"</p>
              <p>will be permanently deleted from the media library and cannot be recovered.</p>
            </div>
          </div>
          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeleteConfirmAsset(null)}
              className="text-xs font-bold h-8"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isDeleting}
              onClick={handleDeleteAsset}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-8"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </AdminModal>
      )}
    </div>
  );
}
