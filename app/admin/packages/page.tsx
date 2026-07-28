"use client";

import { useState } from "react";
import {
  Compass,
  Plus,
  Search,
  MapPin,
  Mountain,
  Clock,
  DollarSign,
  Star,
  ShieldCheck,
  Edit,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";
import { mockPackages, PackageItem } from "@/lib/admin-data";

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-offwhite-50">
            Expeditions & Package Catalog
          </h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Manage itineraries, pricing tiers, max altitudes, and permits required for Nepal routes.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-xs font-bold text-charcoal-950 transition-colors shadow-lg shadow-gold-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Package</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trip title or region..."
            className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 placeholder-charcoal-400 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["All", "Trekking", "Expedition", "Tour"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? "bg-gold-500 text-charcoal-950 font-bold"
                  : "bg-charcoal-950 border border-charcoal-700 text-offwhite-200 hover:border-gold-500/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between hover:border-gold-500/40 transition-all space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold-400 bg-gold-500/10 border border-gold-500/20 px-2 py-0.5 rounded">
                  {pkg.category} • {pkg.region}
                </span>
                <button
                  onClick={() => togglePackageStatus(pkg.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    pkg.status === "Featured"
                      ? "bg-gold-500 text-charcoal-950"
                      : pkg.status === "Active"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-charcoal-700 text-charcoal-400"
                  }`}
                  title="Click to toggle status"
                >
                  {pkg.status}
                </button>
              </div>

              <h3 className="font-bold text-base text-offwhite-50 group-hover:text-gold-400 transition-colors line-clamp-2">
                {pkg.title}
              </h3>

              {/* Attributes */}
              <div className="grid grid-cols-2 gap-2 py-2 border-y border-charcoal-800 text-xs text-charcoal-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold-400" />
                  <span>{pkg.durationDays} Days</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mountain className="w-3.5 h-3.5 text-gold-400" />
                  <span>{pkg.maxAltitudeMeters}m Peak</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                  <span className="text-amber-400 font-semibold">{pkg.difficulty}</span>
                </div>
              </div>

              {/* Permits required */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-charcoal-400 uppercase">
                  Required Permits:
                </span>
                <div className="flex flex-wrap gap-1">
                  {pkg.permitsRequired.map((p, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-charcoal-950 border border-charcoal-800 text-charcoal-300 px-2 py-0.5 rounded"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Pricing & Actions */}
            <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-charcoal-400">Price starting at</span>
                <div className="text-lg font-extrabold text-offwhite-50">
                  ${pkg.priceUSD.toLocaleString()}
                  <span className="text-xs font-normal text-charcoal-400"> / pax</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Edit mode for ${pkg.title}`)}
                  className="p-2 rounded-lg bg-charcoal-800 hover:bg-gold-500 hover:text-charcoal-950 text-offwhite-200 transition-colors"
                  title="Edit Package"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Package Creator Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePackage}
            className="w-full max-w-lg bg-charcoal-900 border border-charcoal-700 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <h2 className="text-lg font-bold text-offwhite-50 flex items-center gap-2">
                <Compass className="w-5 h-5 text-gold-400" />
                <span>Create New Trek / Expedition Package</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-charcoal-400 hover:text-offwhite-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-charcoal-400 font-semibold mb-1">Package Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Langtang Valley & Kyanjin Ri Trek"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-charcoal-400 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="Trekking">Trekking</option>
                    <option value="Expedition">Expedition</option>
                    <option value="Tour">Tour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-charcoal-400 font-semibold mb-1">Region</label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value as any)}
                    className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none"
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
                  <label className="block text-charcoal-400 font-semibold mb-1">Price (USD)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-charcoal-400 font-semibold mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-charcoal-400 font-semibold mb-1">Max Altitude (m)</label>
                  <input
                    type="number"
                    value={newAltitude}
                    onChange={(e) => setNewAltitude(e.target.value)}
                    className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-charcoal-400 font-semibold mb-1">Difficulty Level</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as any)}
                  className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Challenging">Challenging</option>
                  <option value="Extreme (8000m+)">Extreme (8000m+)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg bg-charcoal-800 text-offwhite-200 hover:bg-charcoal-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gold-500 text-charcoal-950 hover:bg-gold-400 text-xs font-bold shadow"
              >
                Publish Package
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
