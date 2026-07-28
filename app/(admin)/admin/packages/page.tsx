"use client";

import { useState } from "react";
import {
  Compass,
  Plus,
  Mountain,
  Clock,
  ShieldCheck,
  Edit,
} from "lucide-react";
import { mockPackages, PackageItem } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>(mockPackages);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New package form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"Trekking" | "Expedition" | "Tour">("Trekking");
  const [newRegion, setNewRegion] = useState<"Everest" | "Annapurna" | "Langtang" | "Manaslu" | "Kathmandu & Pokhara">("Everest");
  const [newPrice, setNewPrice] = useState("2500");
  const [newDuration, setNewDuration] = useState("14");
  const [newAltitude, setNewAltitude] = useState("5364");
  const [newDifficulty, setNewDifficulty] = useState<"Easy" | "Moderate" | "Challenging" | "Extreme (8000m+)">("Challenging");

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || pkg.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const togglePackageStatus = (id: string) => {
    setPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id === id) {
          const nextStatus =
            pkg.status === "Active"
              ? "Draft"
              : pkg.status === "Draft"
              ? "Featured"
              : "Active";
          return { ...pkg, status: nextStatus };
        }
        return pkg;
      })
    );
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const createdPkg: PackageItem = {
      id: `pkg-${Date.now()}`,
      title: newTitle,
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: newCategory,
      region: newRegion,
      durationDays: parseInt(newDuration) || 10,
      maxAltitudeMeters: parseInt(newAltitude) || 5000,
      difficulty: newDifficulty,
      priceUSD: parseInt(newPrice) || 2000,
      status: "Active",
      totalBookings: 0,
      rating: 5.0,
      permitsRequired: ["Trekking Permit", "TIMS Card"],
    };

    setPackages([createdPkg, ...packages]);
    setShowCreateModal(false);
    setNewTitle("");
  };

  return (
    <div className="space-y-6">
      {/* Header Component */}
      <AdminPageHeader
        title="Expeditions & Package Catalog"
        description="Manage itineraries, pricing tiers, max altitudes, and permits required for Nepal routes."
      >
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
          Add New Package
        </Button>
      </AdminPageHeader>

      {/* Filter Bar Component */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search trip title or region..."
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {["All", "Trekking", "Expedition", "Tour"].map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs h-8 whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-slate-900 text-white font-bold"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </AdminFilterBar>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <Card
            key={pkg.id}
            className="p-5 bg-white border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 border-amber-200">
                  {pkg.category} • {pkg.region}
                </Badge>
                <button
                  onClick={() => togglePackageStatus(pkg.id)}
                  title="Click to toggle status"
                  className="cursor-pointer"
                >
                  <AdminStatusBadge status={pkg.status} />
                </button>
              </div>

              <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                {pkg.title}
              </h3>

              {/* Attributes */}
              <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{pkg.durationDays} Days</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mountain className="w-3.5 h-3.5 text-amber-600" />
                  <span>{pkg.maxAltitudeMeters}m Peak</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-700 font-semibold">{pkg.difficulty}</span>
                </div>
              </div>

              {/* Permits required */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                  Required Permits:
                </span>
                <div className="flex flex-wrap gap-1">
                  {pkg.permitsRequired.map((p, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Pricing & Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Price starting at</span>
                <div className="text-lg font-extrabold text-slate-900">
                  ${pkg.priceUSD.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500"> / pax</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert(`Edit mode for ${pkg.title}`)}
                className="h-8 px-2.5"
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* New Package Dialog Modal */}
      {showCreateModal && (
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-lg bg-white border-slate-200 p-6 space-y-4">
            <form onSubmit={handleCreatePackage} className="space-y-4">
              <DialogHeader className="border-b border-slate-100 pb-3">
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-600" />
                  <span>Create New Trek / Expedition Package</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Define itinerary parameters and permit requirements.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Package Title</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Langtang Valley & Kyanjin Ri Trek"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="text-xs bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-md px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="Trekking">Trekking</option>
                      <option value="Expedition">Expedition</option>
                      <option value="Tour">Tour</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Region</label>
                    <select
                      value={newRegion}
                      onChange={(e) => setNewRegion(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-md px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="Everest">Everest</option>
                      <option value="Annapurna">Annapurna</option>
                      <option value="Langtang">Langtang</option>
                      <option value="Manaslu">Manaslu</option>
                      <option value="Kathmandu & Pokhara">Kathmandu & Pokhara</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Price (USD)</label>
                    <Input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="text-xs bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Duration (Days)</label>
                    <Input
                      type="number"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="text-xs bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Max Altitude (m)</label>
                    <Input
                      type="number"
                      value={newAltitude}
                      onChange={(e) => setNewAltitude(e.target.value)}
                      className="text-xs bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Difficulty Level</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-md px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                    <option value="Extreme (8000m+)">Extreme (8000m+)</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                  Publish Package
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
