"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Eye, Edit, Trash2, Copy, UploadCloud, Image as ImageIcon, FolderOpen, Tag, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { AdminTablePagination } from "@/components/admin/ui/admin-table";
import { AdminFilterSelect } from "@/components/admin/forms/admin-form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { CategoryService, MediaService } from "@/lib/services/admin-service";
import { openLightbox } from "@/lib/utils/lightbox";

interface MediaAsset {
  id: string;
  title: string;
  categoryId?: string;
  categoryName?: string;
  category: string;
  url: string;
  description?: string;
  altText?: string;
  fileSize: string;
  dimensions: string;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [allAssetsForStats, setAllAssetsForStats] = useState<MediaAsset[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // selectedCategory stores the categoryId (or "All")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("All");
  const [showUploader, setShowUploader] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [activeAsset, setActiveAsset] = useState<MediaAsset | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit Form Fields State
  const [editTitle, setEditTitle] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [editDescription, setEditDescription] = useState("");
  const [editAltText, setEditAltText] = useState("");

  // Normalize a PaginatedList<T> (array with .pagination property) into list + pagination
  const parseMediaResponse = (res: any): { list: any[]; pagination?: any } => {
    if (Array.isArray(res)) {
      // PaginatedList<T> is an array extended with .pagination
      return { list: res, pagination: (res as any).pagination };
    }
    if (res && Array.isArray(res.data)) return { list: res.data, pagination: res.pagination ?? res.meta };
    return { list: [] };
  };

  // Deduplicate by URL (normalized)
  const deduplicateByUrl = (list: any[]): any[] => {
    const seen = new Set<string>();
    return list.filter((item) => {
      if (!item?.url) return false;
      const key = item.url.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const mapAsset = (m: any): MediaAsset => ({
    id: m.id,
    title: m.title ?? m.name ?? "Media Asset",
    categoryId: m.categoryId ?? "",
    categoryName: m.categoryName ?? "",
    category: m.categoryName ?? "",
    url: m.url,
    description: m.description ?? "",
    altText: m.altText ?? m.title ?? m.name ?? "",
    fileSize: m.fileSize ? `${(Number(m.fileSize) / 1024).toFixed(1)} KB` : "0 KB",
    dimensions: "1920 x 1080",
    createdAt: m.createdAt ? new Date(m.createdAt).toISOString().split("T")[0] : "",
  });

  // Load categories for filter dropdown
  const loadCategories = useCallback(async () => {
    try {
      const res = await CategoryService.getAll({ limit: 100 });
      const list = Array.isArray(res) ? res : [];
      setCategories(list.map((c: any) => ({ id: c.id, name: c.name ?? c.title ?? "" })));
    } catch (e) {
      console.warn("Failed to load categories:", e);
    }
  }, []);

  // Load all assets once for stat cards
  const loadStats = useCallback(async () => {
    try {
      const res = await MediaService.getAllMedia({ limit: 1000 });
      const { list } = parseMediaResponse(res);
      const unique = deduplicateByUrl(list);
      setAllAssetsForStats(unique.map(mapAsset));
    } catch (e) {
      console.warn("Failed to load media stats:", e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadStats();
    loadCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page to 1 on filter or search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategoryId]);

  const loadMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await MediaService.getAllMedia({
        categoryId: selectedCategoryId !== "All" ? selectedCategoryId : undefined,
        search: debouncedSearch || undefined,
        page,
        limit,
      });
      const { list, pagination } = parseMediaResponse(res);
      const unique = deduplicateByUrl(list);
      setAssets(unique.map(mapAsset));
      if (pagination) {
        setTotalItems(pagination.count ?? pagination.total ?? unique.length);
        setTotalPages(pagination.lastPage ?? pagination.pageCount ?? Math.max(1, Math.ceil((pagination.count ?? unique.length) / limit)));
      } else {
        setTotalItems(unique.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to load media assets:", err);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategoryId, page, limit]);

  useEffect(() => {
    loadMedia();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategoryId, page, limit]);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await MediaService.uploadFile(file);
      if (res?.success) {
        toast.success("File uploaded and registered to media database!");
        setShowUploader(false);
        await Promise.all([loadMedia(), loadStats()]);
      } else {
        toast.error(res?.message || "Failed to upload file");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file to backend");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = (url: string, title: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`Copied CDN URL for "${title}" to clipboard!`);
  };

  const handleOpenLightbox = (asset: MediaAsset, triggerEl?: HTMLElement) => {
    const position = assets.findIndex((a) => a.id === asset.id);
    openLightbox({
      items: assets.map((a) => ({
        img: a.url,
        thumb: a.url,
        caption: `${a.title}${a.dimensions ? ` • ${a.dimensions}` : ""}${a.category ? ` • ${a.category}` : ""}`,
        alt: a.altText || a.title,
      })),
      position: position >= 0 ? position : 0,
      el: triggerEl,
    });
  };

  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenEdit = (asset: MediaAsset) => {
    setActiveAsset(asset);
    setEditTitle(asset.title);
    setEditCategoryId(asset.categoryId || "");
    setEditDescription(asset.description || "");
    setEditAltText(asset.altText || "");
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditError(null);
    setIsEditModalOpen(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsset) return;
    setEditError(null);
    try {
      const res = await MediaService.update(activeAsset.id, {
        title: editTitle.trim(),
        categoryId: editCategoryId.trim() || undefined,
        description: editDescription.trim(),
        altText: editAltText.trim(),
      });
      if (res.success) {
        toast.success(res.message || "Media asset metadata updated successfully.");
        handleCloseEditModal();
        await Promise.all([loadMedia(), loadStats()]);
      } else {
        const msg = res.message || "Failed to update media asset.";
        setEditError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || "Failed to update asset metadata.";
      setEditError(msg);
      toast.error(msg);
    }
  };

  const handleDeletePrompt = (asset: MediaAsset) => {
    setActiveAsset(asset);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteError(null);
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!activeAsset) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await MediaService.delete(activeAsset.id);
      if (res.success) {
        toast.success(res.message || "Asset deleted successfully.");
        handleCloseDeleteModal();
        await Promise.all([loadMedia(), loadStats()]);
      } else {
        const msg = res.message || "Failed to delete asset.";
        setDeleteError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || "Failed to delete asset from server.";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-slate-700" />
            Media Library &amp; Gallery
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Upload, categorize, manage, and retrieve photography assets for packages and marketing.
          </p>
        </div>

        <Button
          onClick={() => setShowUploader(!showUploader)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer transition-colors"
        >
          <UploadCloud className="w-4 h-4 mr-1.5" />
          {showUploader ? "Close Upload Center" : "Upload New Assets"}
        </Button>
      </div>

      {/* Upload Zone */}
      {showUploader && (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-4 hover:border-slate-400 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-700" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {isUploading ? "Uploading file to server..." : "Upload photos directly to media library"}
            </h3>
            <p className="text-xs text-slate-700 max-w-sm mx-auto mt-1">
              Supports JPEG, PNG, WebP, and AVIF up to 15MB. Files will be saved into the database asset collection.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-md cursor-pointer transition-colors">
            <span>Browse Files</span>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handleUploadFile}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Total Assets</div>
            <div className="text-lg font-bold text-slate-900">{totalItems || allAssetsForStats.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Everest Assets</div>
            <div className="text-lg font-bold text-slate-900">
              {allAssetsForStats.filter((a) => a.category === "Everest & Peaks").length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Annapurna Assets</div>
            <div className="text-lg font-bold text-slate-900">
              {allAssetsForStats.filter((a) => a.category === "Annapurna Region").length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Helicopter Charters</div>
            <div className="text-lg font-bold text-slate-900">
              {allAssetsForStats.filter((a) => a.category === "Helicopter Charters").length}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Category Filter */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              type="text"
              placeholder="Search photo asset by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

            <AdminFilterSelect
              label="Category Filter:"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </AdminFilterSelect>
        </div>
      </div>

      {/* Media Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse flex flex-col"
            >
              <div className="aspect-video bg-slate-200/80"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : assets.length > 0 ? (
          assets.map((asset, idx) => {
            const serialNumber = (page - 1) * limit + idx + 1;
            return (
              <div
                key={asset.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden group hover:border-slate-300 transition-all flex flex-col relative"
              >
                {/* S.N. Badge */}
                <div className="absolute top-2.5 left-2.5 z-10 bg-slate-950/70 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md border border-white/20">
                  #{serialNumber}
                </div>

                {/* Media Thumbnail Container */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.url}
                    alt={asset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Circular Hover Actions */}
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={(e) => handleOpenLightbox(asset, e.currentTarget as HTMLElement)}
                      title="View Fullscreen Lightbox"
                      className="w-9 h-9 bg-white text-slate-900 hover:bg-slate-100 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-slate-700" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(asset)}
                      title="Edit Asset & Category"
                      className="w-9 h-9 bg-white text-slate-900 hover:bg-slate-100 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Edit className="w-4 h-4 text-slate-700" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyUrl(asset.url, asset.title)}
                      title="Copy Image URL"
                      className="w-9 h-9 bg-white text-slate-900 hover:bg-slate-100 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Copy className="w-4 h-4 text-slate-700" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePrompt(asset)}
                      title="Delete Media Asset"
                      className="w-9 h-9 bg-rose-600 text-white hover:bg-rose-500 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Asset Meta Specs */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    {asset.category && (
                      <span className="bg-slate-100 text-slate-700 font-semibold text-xs px-2.5 py-0.5 rounded-md border border-slate-200 w-fit block mb-1">
                        {asset.category}
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-slate-950 transition-colors">
                      {asset.title}
                    </h3>
                    {asset.description && (
                      <p className="text-xs text-slate-700 font-medium line-clamp-2 mt-1 leading-relaxed">
                        {asset.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-700 font-semibold pt-2 border-t border-slate-100">
                    <span>{asset.dimensions}</span>
                    <span>{asset.fileSize}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
            <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">No media assets match your query.</p>
          </div>
        )}
      </div>

      {/* Media Pagination */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <AdminTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={limit}
          pageSizeOptions={[12, 24, 48, 96]}
          onPageChange={setPage}
          onPageSizeChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </div>

      {/* EDIT MEDIA ASSET & CATEGORY MODAL */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Image Metadata & Category"
        description="Update photo title, category assignment, and alt text."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 py-2 text-xs">
          {editError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">
              {editError}
            </div>
          )}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block text-xs">Asset Title</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block text-xs">Category Taxonomy</label>
            <select
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="">Unassigned Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block text-xs">Description</label>
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Brief description of the photo..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block text-xs">Alt Text (For SEO)</label>
            <input
              type="text"
              value={editAltText}
              onChange={(e) => setEditAltText(e.target.value)}
              placeholder="Short description for accessibility and search engines..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseEditModal}
              className="text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </AdminModal>

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && activeAsset && (
        <AdminConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Delete Media Asset"
          description={`Are you sure you want to delete "${activeAsset.title}"? This photo will be removed from your catalog.`}
          confirmText="Delete Asset"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
          error={deleteError}
        />
      )}
    </div>
  );
}
