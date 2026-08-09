"use client";

import { useEffect, useState } from "react";
import { Plus, Footprints, Clock, TrendingUp, Star } from "lucide-react";
import { TrekItem } from "@/lib/trek-data";
import { toast } from "sonner";
import { TrekService } from "@/lib/services/admin-service";
import { ApiResponse } from "@/lib/services/api-client";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
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
  AdminTableActions,
  AdminActionButton,
} from "@/components/admin/ui/admin-table";

export default function AdminTreksPage() {
  const [treks, setTreks] = useState<TrekItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTrek, setActiveTrek] = useState<TrekItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingTrek, setDeletingTrek] = useState<TrekItem | null>(null);

  useEffect(() => {
    async function loadTreks() {
      try {
        const data = await TrekService.getAll();
        setTreks(data);
      } catch (err) {
        console.error("Failed to load treks:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTreks();
  }, []);

  const filteredTreks = treks.filter((trk) => {
    const matchesSearch =
      trk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trk.region.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty =
      selectedDifficulty === "All" || trk.difficulty === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  const handleSaveTrek = async (savedTrek: TrekItem) => {
    try {
      let res: ApiResponse<TrekItem>;
      if (isEditing && activeTrek) {
        res = await TrekService.update(activeTrek.id, savedTrek as any);
        if (res.success) {
          setTreks((prev) => prev.map((t) => (t.id === activeTrek.id ? res.data : t)));
        }
      } else {
        res = await TrekService.create(savedTrek as any);
        if (res.success) {
          setTreks((prev) => [res.data, ...prev]);
        }
      }
      if (res.success) {
        toast.success(res.message);
        setIsFormOpen(false);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save trek itinerary");
    }
  };

  const handleDeleteTrek = async (id: string) => {
    try {
      const res = await TrekService.delete(id);
      setTreks((prev) => prev.filter((t) => t.id !== id));
      setDeletingTrek(null);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete trek itinerary");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Treks Management"
        description="Manage high-altitude Himalayan trekking itineraries, pricing, difficulty levels, and permit rules."
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
            <option value="Moderate Trek">Moderate Trek</option>
            <option value="Challenging Trek">Challenging Trek</option>
            <option value="Strenuous Trek">Strenuous Trek</option>
          </select>
        </div>
      </AdminFilterBar>

      {/* Treks Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead>Trek Package Title</AdminTableHead>
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
            {filteredTreks.length > 0 ? (
              filteredTreks.map((trk) => (
                <AdminTableRow key={trk.id}>
                  <AdminTableCell>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <Footprints className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{trk.title}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 font-normal">
                      Permits: {trk.permitsRequired ? trk.permitsRequired.join(", ") : "Standard Permits"}
                    </div>
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
                    <AdminStatusBadge status={trk.status} />
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
              ))
            ) : (
              <AdminTableEmpty
                colSpan={8}
                title="No trekking packages found"
                description="No trek itineraries match your search query or difficulty filter."
              />
            )}
          </AdminTableBody>
        </AdminTable>
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
