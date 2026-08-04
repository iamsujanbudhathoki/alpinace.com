"use client";

import { useState } from "react";
import { Search, Plus, Eye, Edit, Trash2, Copy, UploadCloud, Image as ImageIcon, FolderOpen, Tag, Check } from "lucide-react";
import { toast } from "sonner";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface MediaAsset {
  id: string;
  title: string;
  category: "Everest & Peaks" | "Annapurna & Lakes" | "Cultural Heritage" | "Helicopter Charters";
  url: string;
  description?: string;
  altText?: string;
  fileSize: string;
  dimensions: string;
  createdAt: string;
}

const INITIAL_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: "med-1",
    title: "Everest Base Camp & Khumbu Glacier",
    category: "Everest & Peaks",
    url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    description: "Panoramic view of the Khumbu icefall and Everest Base Camp trekking trail.",
    altText: "Everest Base Camp trekking trail photo",
    fileSize: "2.4 MB",
    dimensions: "1920 x 1080",
    createdAt: "2026-08-01",
  },
  {
    id: "med-2",
    title: "Annapurna Range Sunrise over Machhapuchhre",
    category: "Annapurna & Lakes",
    url: "https://images.unsplash.com/photo-1585409677983-0f6c41ca913b?auto=format&fit=crop&w=1200&q=80",
    description: "Golden sunrise illumination on Fishtail mountain pinnacle from Sarangkot.",
    altText: "Machhapuchhre mountain sunrise Nepal",
    fileSize: "1.8 MB",
    dimensions: "1920 x 1080",
    createdAt: "2026-08-02",
  },
  {
    id: "med-3",
    title: "Langtang Rhododendron Alpine Valley",
    category: "Annapurna & Lakes",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    description: "Spring rhododendron blooming valley in Langtang National Park trail.",
    altText: "Langtang valley blooming flowers",
    fileSize: "3.1 MB",
    dimensions: "2400 x 1600",
    createdAt: "2026-08-02",
  },
  {
    id: "med-4",
    title: "Manaslu Larkya La Pass Wilderness",
    category: "Everest & Peaks",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    description: "High altitude snowy pass crossing at 5,106 meters altitude in Manaslu circuit.",
    altText: "Larkya La pass snowy summit view",
    fileSize: "2.9 MB",
    dimensions: "2048 x 1365",
    createdAt: "2026-08-03",
  },
  {
    id: "med-5",
    title: "Everest Luxury Helicopter Sightseeing Charter",
    category: "Helicopter Charters",
    url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    description: "VIP Eurocopter landing at Kala Patthar 5,545 meters with Everest backdrop.",
    altText: "Helicopter tour landing Kala Patthar Everest",
    fileSize: "4.2 MB",
    dimensions: "3840 x 2160",
    createdAt: "2026-08-03",
  },
  {
    id: "med-6",
    title: "Kathmandu Durbar Square & Swayambhunath Temple",
    category: "Cultural Heritage",
    url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    description: "UNESCO World Heritage ancient pagoda architecture in Kathmandu valley.",
    altText: "Kathmandu temple heritage architecture",
    fileSize: "1.5 MB",
    dimensions: "1920 x 1280",
    createdAt: "2026-08-04",
  },
];

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_MEDIA_ASSETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showUploader, setShowUploader] = useState(false);
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

  // Modal States
  const [activeAsset, setActiveAsset] = useState<MediaAsset | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit Form Fields State
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<MediaAsset["category"]>("Everest & Peaks");
  const [editDescription, setEditDescription] = useState("");
  const [editAltText, setEditAltText] = useState("");

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSimulatingUpload(true);
    const objectUrl = URL.createObjectURL(file);
    setTimeout(() => {
      const newAsset: MediaAsset = {
        id: `med-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        category: "Everest & Peaks",
        url: objectUrl,
        description: "Uploaded media asset photo for package gallery and cover displays.",
        altText: file.name.replace(/\.[^/.]+$/, ""),
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        dimensions: "1920 x 1080",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setAssets([newAsset, ...assets]);
      setIsSimulatingUpload(false);
      setShowUploader(false);
      toast.success(`Photo "${file.name}" uploaded to Media Catalog!`);
    }, 600);
  };

  const handleCopyUrl = (url: string, title: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`Image URL for "${title}" copied to clipboard!`);
  };

  const handleOpenLightbox = (asset: MediaAsset) => {
    setActiveAsset(asset);
    setIsLightboxOpen(true);
  };

  const handleOpenEdit = (asset: MediaAsset) => {
    setActiveAsset(asset);
    setEditTitle(asset.title);
    setEditCategory(asset.category);
    setEditDescription(asset.description || "");
    setEditAltText(asset.altText || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsset) return;

    setAssets((prev) =>
      prev.map((a) =>
        a.id === activeAsset.id
          ? {
              ...a,
              title: editTitle,
              category: editCategory,
              description: editDescription,
              altText: editAltText,
            }
          : a
      )
    );
    setIsEditModalOpen(false);
    toast.success(`Media asset "${editTitle}" updated successfully!`);
  };

  const handleDeletePrompt = (asset: MediaAsset) => {
    setActiveAsset(asset);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!activeAsset) return;
    const title = activeAsset.title;
    setAssets((prev) => prev.filter((a) => a.id !== activeAsset.id));
    setIsDeleteModalOpen(false);
    toast.info(`Media asset "${title}" deleted.`);
  };

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === "All" || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
            Media Library
          </h1>
          <p className="text-xs text-slate-700 font-semibold">
            Manage and organize tour photos, mountain covers, and gallery media
          </p>
        </div>

        <Button
          onClick={() => setShowUploader(!showUploader)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {showUploader ? "Hide Upload Box" : "Upload New Media"}
        </Button>
      </div>

      {/* Upload Drag & Drop Box */}
      {showUploader && (
        <div className="border-2 border-dashed border-amber-400 rounded-2xl p-6 text-center bg-amber-50/40 relative cursor-pointer shadow-xs animate-in fade-in-0 duration-200">
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadFile}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <UploadCloud className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <h3 className="text-sm font-extrabold text-slate-900">
            {isSimulatingUpload ? "Uploading & Processing Media Asset..." : "Drag & Drop Image Files or Click to Browse"}
          </h3>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Supports PNG, JPG, WebP up to 20MB. Automatically assigned to Central Media Taxonomy.
          </p>
        </div>
      )}

      {/* Category Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Everest Assets</div>
            <div className="text-lg font-extrabold text-slate-900">
              {assets.filter((a) => a.category === "Everest & Peaks").length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Annapurna Assets</div>
            <div className="text-lg font-extrabold text-slate-900">
              {assets.filter((a) => a.category === "Annapurna & Lakes").length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cultural Assets</div>
            <div className="text-lg font-extrabold text-slate-900">
              {assets.filter((a) => a.category === "Cultural Heritage").length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Helicopter Charters</div>
            <div className="text-lg font-extrabold text-slate-900">
              {assets.filter((a) => a.category === "Helicopter Charters").length}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Category Select Dropdown */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-700" />
            <input
              type="text"
              placeholder="Search photo asset by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">
              Category Filter:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
            >
              <option value="All">All Categories</option>
              <option value="Everest & Peaks">Everest &amp; Peaks</option>
              <option value="Annapurna & Lakes">Annapurna &amp; Lakes</option>
              <option value="Cultural Heritage">Cultural Heritage &amp; Resorts</option>
              <option value="Helicopter Charters">Helicopter Charters</option>
            </select>
          </div>
        </div>
      </div>

      {/* Media Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden group hover:border-slate-300 transition-all flex flex-col"
            >
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
                    onClick={() => handleOpenLightbox(asset)}
                    title="View Fullscreen Lightbox"
                    className="w-9 h-9 bg-white text-slate-900 hover:bg-slate-100 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-amber-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(asset)}
                    title="Edit Asset & Category"
                    className="w-9 h-9 bg-white text-slate-900 hover:bg-slate-100 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Edit className="w-4 h-4 text-emerald-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyUrl(asset.url, asset.title)}
                    title="Copy Image URL"
                    className="w-9 h-9 bg-white text-slate-900 hover:bg-slate-100 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-blue-600" />
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
                  <span className="bg-amber-500/10 text-amber-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-amber-500/20 w-fit block mb-1">
                    {asset.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-amber-600 transition-colors">
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
          ))
        ) : (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
            <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">No media assets match your query.</p>
          </div>
        )}
      </div>

      {/* EDIT MEDIA ASSET & CATEGORY MODAL */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Image"
        description="Update photo title, category, and description."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 py-2 text-xs">
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
            <label className="font-bold text-slate-800 block text-xs">Category</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as MediaAsset["category"])}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="Everest & Peaks">Everest &amp; Peaks</option>
              <option value="Annapurna & Lakes">Annapurna &amp; Lakes</option>
              <option value="Cultural Heritage">Cultural Heritage &amp; Resorts</option>
              <option value="Helicopter Charters">Helicopter Charters</option>
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
              onClick={() => setIsEditModalOpen(false)}
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
          <img src={activeAsset?.url} alt={activeAsset?.title} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
      </AdminModal>

      {/* DELETE CONFIRMATION MODAL */}
      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Media Asset"
        description={`Are you sure you want to delete "${activeAsset?.title}"? This photo will be removed from your catalog.`}
        maxWidth="md"
      >
        <DialogFooter className="pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
            className="text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmDelete}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
          >
            Delete Asset
          </Button>
        </DialogFooter>
      </AdminModal>
    </div>
  );
}
