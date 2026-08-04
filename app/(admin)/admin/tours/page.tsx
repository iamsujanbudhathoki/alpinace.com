"use client";

import { useState } from "react";
import { Plus, Compass, Clock, Edit, Trash2, Eye } from "lucide-react";
import { mockPackages, PackageItem } from "@/lib/admin-data";
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
  AdminTableActions,
  AdminActionButton,
} from "@/components/admin/ui/admin-table";

export default function AdminToursPage() {
  const initialTours = mockPackages.filter((p) => p.category === "Tour");
  const [tours, setTours] = useState<PackageItem[]>(initialTours);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTour, setActiveTour] = useState<PackageItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingTour, setDeletingTour] = useState<PackageItem | null>(null);

  const filteredTours = tours.filter((tur) => {
    const matchesSearch =
      tur.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tur.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || tur.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveTour = (savedTour: PackageItem) => {
    const exists = tours.some((t) => t.id === savedTour.id);
    if (exists) {
      setTours(tours.map((t) => (t.id === savedTour.id ? savedTour : t)));
    } else {
      setTours([savedTour, ...tours]);
    }
  };

  const handleDeleteTour = (id: string) => {
    setTours(tours.filter((t) => t.id !== id));
    setDeletingTour(null);
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
          <span className="text-slate-700 font-bold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
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
            {filteredTours.length > 0 ? (
              filteredTours.map((tur) => (
                <AdminTableRow key={tur.id}>
                  <AdminTableCell>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{tur.title}</span>
                    </div>
                    <div className="text-xs text-slate-700 mt-0.5 font-medium">
                      Inclusions: {tur.permitsRequired.join(", ")}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="font-bold text-slate-900">{tur.region}</div>
                    <div className="flex items-center gap-1 text-slate-700 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-700" />
                      <span>{tur.durationDays} Days</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="font-extrabold text-slate-900 text-sm">
                    ${tur.priceUSD.toLocaleString()} USD
                  </AdminTableCell>
                  <AdminTableCell className="font-bold text-slate-900">
                    {tur.totalBookings} Guests
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
