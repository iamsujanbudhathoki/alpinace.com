"use client";

import { useEffect, useState } from "react";
import { Plus, Compass, Clock } from "lucide-react";
import { toast } from "sonner";
import { PackageItem } from "@/lib/admin-data";
import { TourService } from "@/lib/services/admin-service";
import { ApiResponse } from "@/lib/services/api-client";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
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
} from "@/components/admin/ui/admin-table";

export default function AdminToursPage() {
  const [tours, setTours] = useState<PackageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTour, setActiveTour] = useState<PackageItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingTour, setDeletingTour] = useState<PackageItem | null>(null);

  useEffect(() => {
    async function loadTours() {
      try {
        const data = await TourService.getAll();
        setTours(data);
      } catch (err) {
        console.error("Failed to load tours:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTours();
  }, []);

  const filteredTours = tours.filter((tur) => {
    const matchesSearch =
      tur.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tur.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || tur.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveTour = async (savedTour: PackageItem): Promise<boolean> => {
    try {
      let res: ApiResponse<PackageItem>;
      if (isEditing && activeTour) {
        res = await TourService.update(activeTour.id, savedTour as any);
        if (res.success) {
          setTours((prev) => prev.map((t) => (t.id === activeTour.id ? res.data : t)));
        }
      } else {
        res = await TourService.create(savedTour as any);
        if (res.success) {
          setTours((prev) => [res.data, ...prev]);
        }
      }
      if (res.success) {
        toast.success(res.message || "Tour package saved successfully");
        setIsFormOpen(false);
        return true;
      } else {
        toast.error(res.message || "Failed to save tour package");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save tour package");
      return false;
    }
  };

  const handleDeleteTour = async (id: string) => {
    try {
      const res = await TourService.delete(id);
      setTours((prev) => prev.filter((t) => t.id !== id));
      setDeletingTour(null);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete tour package");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tours & Sightseeing Management"
        description="Manage cultural tours, heritage itineraries, and luxury helicopter packages."
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
          Add New Tour Package
        </Button>
      </AdminPageHeader>

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
            <option value="Active">Active</option>
            <option value="Featured">Featured</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </AdminFilterBar>

      {/* Tours Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead>Tour Package Title</AdminTableHead>
              <AdminTableHead>Destination &amp; Duration</AdminTableHead>
              <AdminTableHead>Price (USD)</AdminTableHead>
              <AdminTableHead>Total Bookings</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <AdminTableLoading colSpan={6} rows={5} />
            ) : filteredTours.length > 0 ? (
              filteredTours.map((tur) => (
                <AdminTableRow key={tur.id}>
                  <AdminTableCell>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{tur.title}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 font-normal">
                      Inclusions: {tur.permitsRequired ? tur.permitsRequired.join(", ") : "Heritage Entrance Fees"}
                    </div>
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
                    <AdminStatusBadge status={tur.status} />
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
              ))
            ) : (
              <AdminTableEmpty
                colSpan={6}
                title="No tours found"
                description="No tour packages match your search query or status filter."
              />
            )}
          </AdminTableBody>
        </AdminTable>
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
