"use client";

import { useState } from "react";
import { Plus, Mountain, TrendingUp, Edit, Trash2, Eye } from "lucide-react";
import { mockPackages, PackageItem } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { ExpeditionFormModal, DeleteExpeditionModal } from "@/components/admin/modals/expedition-modal";
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

export default function AdminExpeditionsPage() {
  const initialExpeditions = mockPackages.filter((p) => p.category === "Expedition");
  const [expeditions, setExpeditions] = useState<PackageItem[]>(initialExpeditions);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeExp, setActiveExp] = useState<PackageItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingExp, setDeletingExp] = useState<PackageItem | null>(null);

  const filteredExpeditions = expeditions.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || exp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveExpedition = (savedExp: PackageItem) => {
    const exists = expeditions.some((e) => e.id === savedExp.id);
    if (exists) {
      setExpeditions(expeditions.map((e) => (e.id === savedExp.id ? savedExp : e)));
    } else {
      setExpeditions([savedExp, ...expeditions]);
    }
  };

  const handleDeleteExpedition = (id: string) => {
    setExpeditions(expeditions.filter((eItem) => eItem.id !== id));
    setDeletingExp(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Peak Expeditions Management"
        description="Manage 6000m - 8000m technical peak climbing logistics, Sherpa ratios, and permits."
      >
        <Button
          size="sm"
          onClick={() => {
            setActiveExp(null);
            setIsEditing(true);
            setIsFormOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
          Add Peak Expedition
        </Button>
      </AdminPageHeader>

      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search peak name or region..."
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

      {/* Expeditions Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead>Peak / Expedition Title</AdminTableHead>
              <AdminTableHead>Summit Elevation</AdminTableHead>
              <AdminTableHead>Duration</AdminTableHead>
              <AdminTableHead>Price (USD)</AdminTableHead>
              <AdminTableHead>Climber Reservations</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {filteredExpeditions.length > 0 ? (
              filteredExpeditions.map((exp) => (
                <AdminTableRow key={exp.id}>
                  <AdminTableCell>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <Mountain className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{exp.title}</span>
                    </div>
                    <div className="text-xs text-slate-700 mt-0.5 font-medium">
                      Permits: {exp.permitsRequired.join(", ")}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="font-extrabold text-slate-900">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                      <span>{exp.maxAltitudeMeters.toLocaleString()}m</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="font-semibold text-slate-700">{exp.durationDays} Days</AdminTableCell>
                  <AdminTableCell className="font-extrabold text-slate-900 text-sm">
                    ${exp.priceUSD.toLocaleString()} USD
                  </AdminTableCell>
                  <AdminTableCell className="font-bold text-slate-900">
                    {exp.totalBookings} Climbers
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusBadge status={exp.status} />
                  </AdminTableCell>
                  <AdminTableCell align="right">
                    <AdminTableActions>
                      <AdminActionButton
                        variant="view"
                        onClick={() => {
                          setActiveExp(exp);
                          setIsEditing(false);
                          setIsFormOpen(true);
                        }}
                        title="View Expedition"
                      />
                      <AdminActionButton
                        variant="edit"
                        onClick={() => {
                          setActiveExp(exp);
                          setIsEditing(true);
                          setIsFormOpen(true);
                        }}
                        title="Edit Expedition"
                      />
                      <AdminActionButton
                        variant="delete"
                        onClick={() => setDeletingExp(exp)}
                        title="Delete Expedition"
                      />
                    </AdminTableActions>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            ) : (
              <AdminTableEmpty
                colSpan={7}
                title="No expeditions found"
                description="No peak climbing packages match your search query or status filter."
              />
            )}
          </AdminTableBody>
        </AdminTable>
      </AdminTableContainer>

      {/* MODALS */}
      <ExpeditionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveExpedition}
        initialData={activeExp}
        isEditing={isEditing}
      />

      <DeleteExpeditionModal
        isOpen={deletingExp !== null}
        onClose={() => setDeletingExp(null)}
        onConfirm={() => deletingExp && handleDeleteExpedition(deletingExp.id)}
        expeditionTitle={deletingExp?.title}
      />
    </div>
  );
}
