"use client";

import { useState } from "react";
import { Plus, Footprints, Clock, TrendingUp, ShieldCheck } from "lucide-react";
import { mockPackages } from "@/lib/admin-data";
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

export default function AdminTreksPage() {
  const trekItems = mockPackages.filter((p) => p.category === "Trekking");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTreks = trekItems.filter((trk) =>
    trk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trk.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Treks Management"
        description="Manage high-altitude Himalayan trekking routes, permits required, and pricing."
      >
        <Button
          size="sm"
          onClick={() => alert("Opening Add New Trek form...")}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
          Add New Trek Route
        </Button>
      </AdminPageHeader>

      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search trek name or region..."
      />

      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="font-bold text-slate-700 text-xs">Trek Route Title</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Region & Duration</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Max Altitude</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Price (USD)</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Bookings</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Status</TableHead>
              <TableHead className="text-right font-bold text-slate-700 text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs">
            {filteredTreks.map((trk) => (
              <TableRow key={trk.id} className="hover:bg-slate-50/80 transition-colors">
                <TableCell className="py-3.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{trk.title}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    Permits: {trk.permitsRequired.join(", ")}
                  </div>
                </TableCell>

                <TableCell className="py-3.5">
                  <div className="font-semibold text-slate-800">{trk.region}</div>
                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {trk.durationDays} Days
                  </div>
                </TableCell>

                <TableCell className="py-3.5 font-semibold text-slate-800">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>{trk.maxAltitudeMeters}m</span>
                  </div>
                </TableCell>

                <TableCell className="py-3.5 font-bold text-slate-900">
                  ${trk.priceUSD.toLocaleString()}
                </TableCell>

                <TableCell className="py-3.5 font-semibold text-slate-800">
                  {trk.totalBookings} guest reservations
                </TableCell>

                <TableCell className="py-3.5">
                  <AdminStatusBadge status={trk.status} />
                </TableCell>

                <TableCell className="py-3.5 text-right">
                  <Button variant="outline" size="sm" className="text-xs font-semibold h-8">
                    Edit Route
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
