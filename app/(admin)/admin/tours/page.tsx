"use client";

import { useState } from "react";
import { Plus, Compass, Clock, MapPin } from "lucide-react";
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

export default function AdminToursPage() {
  const tourItems = mockPackages.filter((p) => p.category === "Tour");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTours = tourItems.filter((tur) =>
    tur.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tur.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tours & Sightseeing Management"
        description="Manage cultural tours, heritage itineraries, and luxury helicopter packages."
      >
        <Button
          size="sm"
          onClick={() => alert("Opening Add New Tour form...")}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
          Add New Tour Package
        </Button>
      </AdminPageHeader>

      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search tour title or location..."
      />

      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="font-bold text-slate-700 text-xs">Tour Package Title</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Destination & Duration</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Price (USD)</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Total Bookings</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Status</TableHead>
              <TableHead className="text-right font-bold text-slate-700 text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs">
            {filteredTours.map((tur) => (
              <TableRow key={tur.id} className="hover:bg-slate-50/80 transition-colors">
                <TableCell className="py-3.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{tur.title}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    Inclusions: {tur.permitsRequired.join(", ")}
                  </div>
                </TableCell>

                <TableCell className="py-3.5">
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tur.region}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {tur.durationDays} Days
                  </div>
                </TableCell>

                <TableCell className="py-3.5 font-bold text-slate-900">
                  ${tur.priceUSD.toLocaleString()}
                </TableCell>

                <TableCell className="py-3.5 font-semibold text-slate-800">
                  {tur.totalBookings} guest reservations
                </TableCell>

                <TableCell className="py-3.5">
                  <AdminStatusBadge status={tur.status} />
                </TableCell>

                <TableCell className="py-3.5 text-right">
                  <Button variant="outline" size="sm" className="text-xs font-semibold h-8">
                    Edit Tour
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
