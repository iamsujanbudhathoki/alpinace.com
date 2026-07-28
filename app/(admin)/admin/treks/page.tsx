"use client";

import { useState } from "react";
import { Plus, Footprints, Clock, TrendingUp, ShieldCheck, Star } from "lucide-react";
import { initialTreksData, TrekItem } from "@/lib/trek-data";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminTreksPage() {
  const [treks, setTreks] = useState<TrekItem[]>(initialTreksData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [activeTrekModal, setActiveTrekModal] = useState<TrekItem | null>(null);

  const filteredTreks = treks.filter((trk) => {
    const matchesSearch =
      trk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trk.region.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty =
      selectedDifficulty === "All" || trk.difficulty === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Treks Management"
        description="Manage high-altitude Himalayan trekking itineraries, pricing, difficulty levels, and permit rules."
      >
        <Button
          size="sm"
          onClick={() => alert("Opening Add New Trek form...")}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
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
          <span className="text-slate-600 font-semibold">Difficulty:</span>
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
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="font-bold text-slate-700 text-xs">Trek Package Title</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Region &amp; Duration</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Difficulty Level</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Best Season</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Starting Price</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Rating</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Status</TableHead>
              <TableHead className="text-right font-bold text-slate-700 text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs">
            {filteredTreks.map((trk) => (
              <TableRow
                key={trk.id}
                onClick={() => setActiveTrekModal(trk)}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <TableCell className="py-3.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{trk.title}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Permits: {trk.permitsRequired.join(", ")}
                  </div>
                </TableCell>

                <TableCell className="py-3.5">
                  <div className="font-semibold text-slate-800">{trk.region}</div>
                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {trk.durationDays} Days Journey
                  </div>
                </TableCell>

                <TableCell className="py-3.5 font-semibold text-slate-800">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px]">
                    <TrendingUp className="w-3 h-3 text-amber-600" />
                    {trk.difficulty}
                  </span>
                </TableCell>

                <TableCell className="py-3.5 text-slate-600 font-medium max-w-[160px] truncate">
                  {trk.bestSeason}
                </TableCell>

                <TableCell className="py-3.5 font-bold text-slate-900">
                  ${trk.priceUSD.toLocaleString()} USD
                </TableCell>

                <TableCell className="py-3.5 font-semibold text-slate-800">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{trk.rating} ({trk.reviewsCount})</span>
                  </div>
                </TableCell>

                <TableCell className="py-3.5">
                  <AdminStatusBadge status={trk.status} />
                </TableCell>

                <TableCell className="py-3.5 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTrekModal(trk);
                    }}
                    className="text-xs font-semibold h-8"
                  >
                    Edit Fields
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Edit / Inspect Modal */}
      {activeTrekModal && (
        <Dialog open={!!activeTrekModal} onOpenChange={(open) => !open && setActiveTrekModal(null)}>
          <DialogContent className="sm:max-w-xl bg-white border-slate-200 p-6 space-y-4">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-lg font-bold text-slate-900">
                {activeTrekModal.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Trekking itinerary details, permits required, and pricing fields.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Region &amp; Duration</span>
                <div className="font-bold text-slate-900 mt-1">{activeTrekModal.region} • {activeTrekModal.durationDays} Days</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Starting Price</span>
                <div className="font-extrabold text-slate-900 text-base mt-1">${activeTrekModal.priceUSD} USD</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Difficulty Level</span>
                <div className="font-semibold text-slate-900 mt-1">{activeTrekModal.difficulty}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Best Trekking Season</span>
                <div className="font-semibold text-slate-900 mt-1">{activeTrekModal.bestSeason}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Permits Required</span>
              <p className="font-semibold text-slate-800 mt-1">{activeTrekModal.permitsRequired.join(" • ")}</p>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setActiveTrekModal(null)}>
                Close
              </Button>
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                Save Package Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
