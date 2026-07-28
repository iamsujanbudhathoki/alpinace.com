"use client";

import { useState } from "react";
import { Plus, Mountain, TrendingUp, ShieldCheck } from "lucide-react";
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

export default function AdminExpeditionsPage() {
  const expeditionItems = mockPackages.filter((p) => p.category === "Expedition");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExpeditions = expeditionItems.filter((exp) =>
    exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Peak Expeditions Management"
        description="Manage 6000m - 8000m technical peak climbing logistics, Sherpa ratios, and permits."
      >
        <Button
          size="sm"
          onClick={() => alert("Opening Add New Expedition form...")}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
          Add Peak Expedition
        </Button>
      </AdminPageHeader>

      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search peak name or region..."
      />

      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="font-bold text-slate-700 text-xs">Peak / Expedition Title</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Summit Elevation</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Duration</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Price (USD)</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Climber Reservations</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Status</TableHead>
              <TableHead className="text-right font-bold text-slate-700 text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs">
            {filteredExpeditions.map((exp) => (
              <TableRow key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                <TableCell className="py-3.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Mountain className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{exp.title}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Permits: {exp.permitsRequired.join(", ")}
                  </div>
                </TableCell>

                <TableCell className="py-3.5 font-bold text-slate-900">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>{exp.maxAltitudeMeters} meters</span>
                  </div>
                </TableCell>

                <TableCell className="py-3.5 font-semibold text-slate-800">
                  {exp.durationDays} Days
                </TableCell>

                <TableCell className="py-3.5 font-bold text-slate-900">
                  ${exp.priceUSD.toLocaleString()}
                </TableCell>

                <TableCell className="py-3.5 font-semibold text-slate-800">
                  {exp.totalBookings} expedition members
                </TableCell>

                <TableCell className="py-3.5">
                  <AdminStatusBadge status={exp.status} />
                </TableCell>

                <TableCell className="py-3.5 text-right">
                  <Button variant="outline" size="sm" className="text-xs font-semibold h-8">
                    Edit Logistics
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
