"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Footprints, Clock, TrendingUp, Star, Tag, ExternalLink, Maximize2, Image as ImageIcon } from "lucide-react";
import { TrekItem } from "@/lib/trek-data";
import { TripDifficulty, PackageStatus, CategoryType, CategoryItem } from "@/lib/admin-data";
import { toast } from "sonner";
import { TrekService, CategoryService } from "@/lib/services/admin-service";
import { ApiResponse } from "@/lib/services/api-client";
import { openSingleImage } from "@/lib/utils/lightbox";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminInlineSelect, InlineSelectOption } from "@/components/admin/ui/admin-inline-select";
import { TrekFormModal, DeleteTrekModal } from "@/components/admin/modals/trek-modal";
import { Button } from "@/components/ui/button";
import {
  AdminTableContainer,
  AdminTable,
  AdminTableHeader,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableLoading,
  AdminTableActions,
  AdminActionButton,
  AdminTablePagination,
} from "@/components/admin/ui/admin-table";

const STATUS_OPTIONS: InlineSelectOption[] = [
  { value: PackageStatus.ACTIVE, label: "Active" },
  { value: PackageStatus.FEATURED, label: "Featured" },
  { value: PackageStatus.DRAFT, label: "Draft" },
];

export default function AdminTreksPage() {
  const searchParams = useSearchParams();
  const viewId = searchParams?.get("viewId");

  const [treks, setTreks] = useState<TrekItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTrek, setActiveTrek] = useState<TrekItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingTrek, setDeletingTrek] = useState<TrekItem | null>(null);

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const catsData = await CategoryService.getByType(CategoryType.TREKKING);
        setCategories(catsData);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page to 1 when search or difficulty changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedDifficulty]);

  // Load treks from backend
  const loadTreks = async () => {
    setLoading(true);
    try {
      const data = await TrekService.getAll({
        search: debouncedSearch,
        difficulty: selectedDifficulty,
        page,
        limit,
      });
      setTreks(data);
      if ((data as any).pagination) {
        setTotalItems((data as any).pagination.count);
        setTotalPages((data as any).pagination.lastPage);
      } else {
        setTotalItems(data.length);
        setTotalPages(Math.max(1, Math.ceil(data.length / limit)));
      }
    } catch (err) {
      console.error("Failed to load treks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTreks();
  }, [debouncedSearch, selectedDifficulty, page, limit]);

  // Auto-open view modal when viewId is in query params & remove viewId from URL
  useEffect(() => {
    if (viewId && treks.length > 0) {
      const match = treks.find((t) => t.id === viewId || t.slug === viewId);
      if (match) {
        setActiveTrek(match);
        setIsEditing(false);
        setIsFormOpen(true);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }
  }, [viewId, treks]);

  const categoryOptions: InlineSelectOption[] = categories.map((c) => ({
    value: c.id,
    label: c.name,
    icon: <Tag className="w-3 h-3 opacity-70" />,
  }));

  const handleSaveTrek = async (savedTrek: TrekItem): Promise<boolean> => {
    try {
      let res: ApiResponse<TrekItem>;
      if (isEditing && activeTrek) {
        res = await TrekService.update(activeTrek.id, savedTrek as any);
      } else {
        res = await TrekService.create(savedTrek as any);
      }
      if (res.success) {
        toast.success(res.message || "Trek itinerary saved successfully");
        setIsFormOpen(false);
        await loadTreks();
        return true;
      } else {
        toast.error(res.message || "Failed to save trek itinerary");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
      return false;
    }
  };

  const handleDeleteTrek = async (id: string) => {
    try {
      const res = await TrekService.delete(id);
      if (res.success) {
        toast.success(res.message || "Trek itinerary deleted successfully");
        setDeletingTrek(null);
        await loadTreks();
      } else {
        toast.error(res.message || "Failed to delete trek");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete trek");
    }
  };

  const handleInlineStatusChange = async (trk: TrekItem, newStatus: string) => {
    try {
      const res = await TrekService.update(trk.id, { status: newStatus as PackageStatus });
      if (res.success) {
        setTreks((prev) =>
          prev.map((t) => (t.id === trk.id ? { ...t, status: newStatus as PackageStatus } : t))
        );
        toast.success(`Updated "${trk.title}" status to ${newStatus}`);
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleInlineCategoryChange = async (trk: TrekItem, newCategoryId: string) => {
    const selectedCat = categories.find((c) => c.id === newCategoryId);
    try {
      const res = await TrekService.update(trk.id, {
        categoryId: newCategoryId,
        category: selectedCat?.name || trk.category,
      } as any);
      if (res.success) {
        setTreks((prev) =>
          prev.map((t) =>
            t.id === trk.id
              ? { ...t, categoryId: newCategoryId, category: selectedCat?.name || t.category }
              : t
          )
        );
        toast.success(`Updated "${trk.title}" category to ${selectedCat?.name || newCategoryId}`);
      } else {
        toast.error(res.message || "Failed to update category");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update category");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Trekking Itineraries"
        description="Manage high-altitude routes, tea-house circuits, permits, and pricing."
      >
        <Button
          size="sm"
          onClick={() => {
            setActiveTrek(null);
            setIsEditing(true);
            setIsFormOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
          Add New Trek Itinerary
        </Button>
      </AdminPageHeader>

      {/* Filter Bar */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search trek title or region..."
      >
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-slate-700 font-semibold">Difficulty:</span>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Difficulties</option>
            <option value={TripDifficulty.EASY}>Easy</option>
            <option value={TripDifficulty.MODERATE}>Moderate</option>
            <option value={TripDifficulty.CHALLENGING}>Challenging</option>
            <option value={TripDifficulty.STRENUOUS}>Strenuous</option>
            <option value={TripDifficulty.EXTREME}>Extreme</option>
          </select>
        </div>
      </AdminFilterBar>

      {/* Treks Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead className="w-14 text-center">S.N.</AdminTableHead>
              <AdminTableHead>Trek Package Title</AdminTableHead>
              <AdminTableHead>Category</AdminTableHead>
              <AdminTableHead>Region &amp; Duration</AdminTableHead>
              <AdminTableHead>Difficulty Level</AdminTableHead>
              <AdminTableHead>Best Season</AdminTableHead>
              <AdminTableHead>Starting Price</AdminTableHead>
              <AdminTableHead>Rating</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <AdminTableLoading colSpan={10} rows={limit > 10 ? 10 : limit} />
            ) : treks.length > 0 ? (
              treks.map((trk, idx) => {
                const currentCatId =
                  trk.categoryId ||
                  categories.find((c) => c.name.toLowerCase() === (trk.category || "").toLowerCase())?.id ||
                  "";
                const serialNumber = (page - 1) * limit + idx + 1;

                return (
                  <AdminTableRow key={trk.id}>
                    <AdminTableCell className="text-center font-semibold text-slate-500">
                      {serialNumber}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        {trk.image ? (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              openSingleImage(trk.image!, trk.title, e.currentTarget);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                openSingleImage(trk.image!, trk.title, e.currentTarget);
                              }
                            }}
                            className="relative w-12 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 cursor-zoom-in group/thumb shadow-2xs hover:border-amber-400 transition-all"
                            title="Click to view image in lightbox"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={trk.image}
                              alt={trk.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                            />
                            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                              <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow-md" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/trekking/${trk.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link inline-flex items-center gap-1.5 font-bold text-slate-900 hover:text-amber-600 transition-colors"
                            title="Open trek in public marketing page"
                          >
                            <span className="line-clamp-1 underline decoration-transparent group-hover/link:decoration-amber-500 underline-offset-2 transition-all">
                              {trk.title}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-amber-600 opacity-0 group-hover/link:opacity-100 transition-all shrink-0" />
                          </Link>
                          <div className="text-xs text-slate-600 mt-0.5 font-normal">
                            Permits: {trk.permitsRequired ? trk.permitsRequired.join(", ") : "Standard Permits"}
                          </div>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminInlineSelect
                        value={currentCatId}
                        options={categoryOptions}
                        onChange={(newVal) => handleInlineCategoryChange(trk, newVal)}
                        variant="category"
                        placeholder={trk.category || "Select category"}
                        title="Click to change trek category"
                      />
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="font-semibold text-slate-900">{trk.region} Region</div>
                      <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        <span>{trk.durationDays} Days</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="font-medium text-slate-800">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                        <span>{trk.difficulty}</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="font-medium text-slate-800">{trk.bestSeason}</AdminTableCell>
                    <AdminTableCell className="font-bold text-slate-900 text-sm">
                      ${trk.priceUSD.toLocaleString()} USD
                    </AdminTableCell>
                    <AdminTableCell className="font-semibold text-slate-900">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{trk.rating || 5.0} ({trk.reviewsCount || 0})</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminInlineSelect
                        value={trk.status}
                        options={STATUS_OPTIONS}
                        onChange={(newVal) => handleInlineStatusChange(trk, newVal)}
                        variant="badge"
                        title="Click to change trek status"
                      />
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <AdminTableActions>
                        <AdminActionButton
                          variant="view"
                          onClick={() => {
                            setActiveTrek(trk);
                            setIsEditing(false);
                            setIsFormOpen(true);
                          }}
                          title="View Trek"
                        />
                        <AdminActionButton
                          variant="edit"
                          onClick={() => {
                            setActiveTrek(trk);
                            setIsEditing(true);
                            setIsFormOpen(true);
                          }}
                          title="Edit Trek"
                        />
                        <AdminActionButton
                          variant="delete"
                          onClick={() => setDeletingTrek(trk)}
                          title="Delete Trek"
                        />
                      </AdminTableActions>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            ) : (
              <AdminTableEmpty
                colSpan={10}
                title="No trekking packages found"
                description="No trek itineraries match your search query or difficulty filter."
              />
            )}
          </AdminTableBody>
        </AdminTable>
        <AdminTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={limit}
          onPageChange={setPage}
          onPageSizeChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </AdminTableContainer>

      {/* MODALS */}
      <TrekFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveTrek}
        initialData={activeTrek}
        isEditing={isEditing}
      />

      <DeleteTrekModal
        isOpen={deletingTrek !== null}
        onClose={() => setDeletingTrek(null)}
        onConfirm={() => deletingTrek && handleDeleteTrek(deletingTrek.id)}
        trekTitle={deletingTrek?.title}
      />
    </div>
  );
}

