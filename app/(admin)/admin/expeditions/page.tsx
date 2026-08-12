"use client";

import { useEffect, useState } from "react";
import { Plus, Mountain, TrendingUp } from "lucide-react";
import { PackageItem } from "@/lib/admin-data";
import { toast } from "sonner";
import { ExpeditionService } from "@/lib/services/admin-service";
import { ApiResponse } from "@/lib/services/api-client";
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
  const [expeditions, setExpeditions] = useState<PackageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeExp, setActiveExp] = useState<PackageItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingExp, setDeletingExp] = useState<PackageItem | null>(null);

  useEffect(() => {
    async function loadExpeditions() {
      try {
        const data = await ExpeditionService.getAll();
        setExpeditions(data);
      } catch (err) {
        console.error("Failed to load expeditions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExpeditions();
  }, []);

  const filteredExpeditions = expeditions.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || exp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveExpedition = async (savedExp: PackageItem): Promise<boolean> => {
    try {
      let res: ApiResponse<PackageItem>;
      if (isEditing && activeExp) {
        res = await ExpeditionService.update(activeExp.id, savedExp as any);
        if (res.success) {
          setExpeditions((prev) => prev.map((e) => (e.id === activeExp.id ? res.data : e)));
        }
      } else {
        res = await ExpeditionService.create(savedExp as any);
        if (res.success) {
          setExpeditions((prev) => [res.data, ...prev]);
        }
      }
      if (res.success) {
        toast.success(res.message || "Expedition saved successfully");
        setIsFormOpen(false);
        return true;
      } else {
        toast.error(res.message || "Failed to save expedition");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save expedition");
      return false;
    }
  };

  const handleDeleteExpedition = async (id: string) => {
    try {
      const res = await ExpeditionService.delete(id);
      setExpeditions((prev) => prev.filter((eItem) => eItem.id !== id));
      setDeletingExp(null);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete expedition");
    }
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
                    <div className="text-xs text-slate-600 mt-0.5 font-normal">
                      Permits: {exp.permitsRequired ? exp.permitsRequired.join(", ") : "NMA Summit Permit"}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                      <span>{(exp.maxAltitudeMeters || 6000).toLocaleString()}m</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="font-medium text-slate-800">{exp.durationDays} Days</AdminTableCell>
                  <AdminTableCell className="font-bold text-slate-900 text-sm">
                    ${exp.priceUSD.toLocaleString()} USD
                  </AdminTableCell>
                  <AdminTableCell className="font-medium text-slate-800">
                    {exp.totalBookings || 0} Climbers
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
