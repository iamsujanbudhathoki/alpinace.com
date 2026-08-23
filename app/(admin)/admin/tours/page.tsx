"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Compass, Clock, Tag, ExternalLink, Maximize2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { PackageItem, PackageStatus, CategoryType, CategoryItem } from "@/lib/admin-data";
import { TourService, CategoryService } from "@/lib/services/admin-service";
import { ApiResponse } from "@/lib/services/api-client";
import { openSingleImage } from "@/lib/utils/lightbox";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminInlineSelect, InlineSelectOption } from "@/components/admin/ui/admin-inline-select";
import { TourFormModal, DeleteTourModal } from "@/components/admin/modals/tour-modal";
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

export default function AdminToursPage() {
  const searchParams = useSearchParams();
  const viewId = searchParams?.get("viewId");

  const [tours, setTours] = useState<PackageItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTour, setActiveTour] = useState<PackageItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingTour, setDeletingTour] = useState<PackageItem | null>(null);

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const catsData = await CategoryService.getByType(CategoryType.TOURS);
        setCategories(catsData);
      } catch (err) {
        console.error("Failed to load tour categories:", err);
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

  // Reset page to 1 on filter or search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // Load tours from backend
  const loadTours = async () => {
    setLoading(true);
    try {
      const data = await TourService.getAdminAll({
        search: debouncedSearch,
        status: statusFilter === "All" ? undefined : statusFilter,
        page,
        limit,
      });
      setTours(data);
      if ((data as any).pagination) {
        setTotalItems((data as any).pagination.count);
        setTotalPages((data as any).pagination.lastPage);
      } else {
        setTotalItems(data.length);
        setTotalPages(Math.max(1, Math.ceil(data.length / limit)));
      }
    } catch (err) {
      console.error("Failed to load tours:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTours();
  }, [debouncedSearch, statusFilter, page, limit]);

  // Auto-open view modal when viewId is in query params & remove viewId from URL
  useEffect(() => {
    if (viewId && tours.length > 0) {
      const match = tours.find((t) => t.id === viewId || t.slug === viewId);
      if (match) {
        setActiveTour(match);
        setIsEditing(false);
        setIsFormOpen(true);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }
  }, [viewId, tours]);

  const categoryOptions: InlineSelectOption[] = categories.map((c) => ({
    value: c.id,
    label: c.name,
    icon: <Tag className="w-3 h-3 opacity-70" />,
  }));

  const handleSaveTour = async (savedTour: PackageItem): Promise<boolean> => {
    try {
      let res: ApiResponse<PackageItem>;
      if (isEditing && activeTour) {
        res = await TourService.update(activeTour.id, savedTour as any);
      } else {
        res = await TourService.create(savedTour as any);
      }
      if (res.success) {
        toast.success(res.message || "Tour package saved successfully");
        setIsFormOpen(false);
        await loadTours();
        return true;
      } else {
        toast.error(res.message || "Failed to save tour package");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
      return false;
    }
  };

  const handleDeleteTour = async (id: string) => {
    try {
      const res = await TourService.delete(id);
      if (res.success) {
        toast.success(res.message || "Tour package deleted successfully");
        setDeletingTour(null);
        await loadTours();
      } else {
        toast.error(res.message || "Failed to delete tour");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete tour");
    }
  };

  const handleInlineStatusChange = async (tur: PackageItem, newStatus: string) => {
    try {
      const res = await TourService.update(tur.id, { status: newStatus as PackageStatus });
      if (res.success) {
        setTours((prev) =>
          prev.map((t) => (t.id === tur.id ? { ...t, status: newStatus as PackageStatus } : t))
        );
        toast.success(`Updated "${tur.title}" status to ${newStatus}`);
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleInlineCategoryChange = async (tur: PackageItem, newCategoryId: string) => {
    const selectedCat = categories.find((c) => c.id === newCategoryId);
    try {
      const res = await TourService.update(tur.id, {
        categoryId: newCategoryId,
        category: selectedCat?.name || tur.category,
      } as any);
      if (res.success) {
        setTours((prev) =>
          prev.map((t) =>
            t.id === tur.id
              ? { ...t, categoryId: newCategoryId, category: selectedCat?.name || t.category }
              : t
          )
        );
        toast.success(`Updated "${tur.title}" category to ${selectedCat?.name || newCategoryId}`);
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
        title="Tours"
        description="Manage tour packages and itineraries."
      >
        <Button
          size="sm"
          onClick={() => {
            setActiveTour(null);
            setIsEditing(true);
            setIsFormOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
          Add New Tour Itinerary
        </Button>
      </AdminPageHeader>

      {/* Filter Bar */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search tour title or location..."
      >
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-slate-700 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value={PackageStatus.ACTIVE}>Active</option>
            <option value={PackageStatus.FEATURED}>Featured</option>
            <option value={PackageStatus.DRAFT}>Draft</option>
          </select>
        </div>
      </AdminFilterBar>

      {/* Tours Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead className="w-14 text-center">S.N.</AdminTableHead>
              <AdminTableHead>Tour Package Title</AdminTableHead>
              <AdminTableHead>Category</AdminTableHead>
              <AdminTableHead>Destination &amp; Duration</AdminTableHead>
              <AdminTableHead>Price (USD)</AdminTableHead>
              <AdminTableHead>Total Bookings</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <AdminTableLoading colSpan={8} rows={limit > 10 ? 10 : limit} />
            ) : tours.length > 0 ? (
              tours.map((tur, idx) => {
                const currentCatId =
                  tur.categoryId ||
                  categories.find((c) => c.name.toLowerCase() === (tur.category || "").toLowerCase())?.id ||
                  "";
                const serialNumber = (page - 1) * limit + idx + 1;

                return (
                  <AdminTableRow key={tur.id}>
                    <AdminTableCell className="text-center font-semibold text-slate-500">
                      {serialNumber}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        {tur.image ? (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              openSingleImage(tur.image!, tur.title, e.currentTarget);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                openSingleImage(tur.image!, tur.title, e.currentTarget);
                              }
                            }}
                            className="relative w-12 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 cursor-zoom-in group/thumb shadow-2xs hover:border-amber-400 transition-all"
                            title="Click to view image in lightbox"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={tur.image}
                              alt={tur.title}
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
                            href={`/tours/${tur.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link inline-flex items-center gap-1.5 font-bold text-slate-900 hover:text-amber-600 transition-colors"
                            title="Open tour in public marketing page"
                          >
                            <span className="line-clamp-1 underline decoration-transparent group-hover/link:decoration-amber-500 underline-offset-2 transition-all">
                              {tur.title}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-amber-600 opacity-0 group-hover/link:opacity-100 transition-all shrink-0" />
                          </Link>
                          <div className="text-xs text-slate-600 mt-0.5 font-normal">
                            Inclusions: {tur.permitsRequired ? tur.permitsRequired.join(", ") : "Heritage Entrance Fees"}
                          </div>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminInlineSelect
                        value={currentCatId}
                        options={categoryOptions}
                        onChange={(newVal) => handleInlineCategoryChange(tur, newVal)}
                        variant="category"
                        placeholder={tur.category || "Select category"}
                        title="Click to change tour category"
                      />
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="font-semibold text-slate-900">{tur.region}</div>
                      <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        <span>{tur.durationDays} Days</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="font-bold text-slate-900 text-sm">
                      ${tur.priceUSD.toLocaleString()} USD
                    </AdminTableCell>
                    <AdminTableCell className="font-medium text-slate-800">
                      {tur.totalBookings || 0} Guests
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminInlineSelect
                        value={tur.status}
                        options={STATUS_OPTIONS}
                        onChange={(newVal) => handleInlineStatusChange(tur, newVal)}
                        variant="badge"
                        title="Click to change tour status"
                      />
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <AdminTableActions>
                        <AdminActionButton
                          variant="view"
                          onClick={() => {
                            setActiveTour(tur);
                            setIsEditing(false);
                            setIsFormOpen(true);
                          }}
                          title="View Tour"
                        />
                        <AdminActionButton
                          variant="edit"
                          onClick={() => {
                            setActiveTour(tur);
                            setIsEditing(true);
                            setIsFormOpen(true);
                          }}
                          title="Edit Tour"
                        />
                        <AdminActionButton
                          variant="delete"
                          onClick={() => setDeletingTour(tur)}
                          title="Delete Tour"
                        />
                      </AdminTableActions>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            ) : (
              <AdminTableEmpty
                colSpan={8}
                title="No tours found"
                description="No tour packages match your search query or status filter."
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
      <TourFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveTour}
        initialData={activeTour}
        isEditing={isEditing}
      />

      <DeleteTourModal
        isOpen={deletingTour !== null}
        onClose={() => setDeletingTour(null)}
        onConfirm={() => deletingTour && handleDeleteTour(deletingTour.id)}
        tourTitle={deletingTour?.title}
      />
    </div>
  );
}

