"use client";

import React from "react";
import { Plus, Trash2, Sparkles, DollarSign, CheckCircle2, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackageAddonItem } from "@/lib/admin-data";

interface TripAddonsManagerProps {
  addons?: PackageAddonItem[];
  onChange: (addons: PackageAddonItem[]) => void;
}

export function TripAddonsManager({
  addons = [],
  onChange,
}: TripAddonsManagerProps) {
  const handleAdd = () => {
    const newAddon: PackageAddonItem = {
      id: `addon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: "",
      description: "",
      priceUSD: 0,
      isActive: true,
    };
    onChange([...addons, newAddon]);
  };

  const handleUpdate = (
    index: number,
    field: keyof PackageAddonItem,
    value: string | number | boolean
  ) => {
    const next = [...addons];
    next[index] = {
      ...next[index],
      [field]: value,
    };
    onChange(next);
  };

  const handleDelete = (index: number) => {
    onChange(addons.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Trip Add-ons &amp; Upgrades
          </h4>
          <p className="text-xs text-slate-500">
            Define optional services (helicopter flights, equipment rental, room supplements) that clients can select during booking.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleAdd}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Add-on
        </Button>
      </div>

      {/* Empty State */}
      {addons.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md">
            <h5 className="text-sm font-bold text-slate-800">No Add-ons Configured</h5>
            <p className="text-xs text-slate-500 mt-1">
              Add-ons give your clients the flexibility to customize their trip during checkout with extra experiences, gear, or logistical upgrades.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 mt-1 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Add-on
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addons.map((addon, index) => {
            const isActive = addon.isActive !== false;
            return (
              <div
                key={addon.id || index}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? "bg-white border-slate-200/90 shadow-xs"
                    : "bg-slate-50/70 border-slate-200 opacity-75"
                }`}
              >
                {/* Header row inside card */}
                <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {addon.title ? addon.title : "Untitled Add-on"}
                    </span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        <EyeOff className="w-3 h-3" /> Hidden
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) =>
                          handleUpdate(index, "isActive", e.target.checked)
                        }
                        className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                      />
                      <span>Active</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Add-on"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  {/* Title */}
                  <div className="md:col-span-8 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Add-on Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addon.title}
                      onChange={(e) => handleUpdate(index, "title", e.target.value)}
                      placeholder="e.g. Helicopter Return from Gorak Shep to Lukla"
                      className="w-full text-xs px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-900"
                    />
                  </div>

                  {/* Price */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Price (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <DollarSign className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={addon.priceUSD ?? ""}
                        onChange={(e) =>
                          handleUpdate(
                            index,
                            "priceUSD",
                            e.target.value === "" ? 0 : Number(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-12 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Description / Details
                    </label>
                    <textarea
                      rows={2}
                      value={addon.description || ""}
                      onChange={(e) =>
                        handleUpdate(index, "description", e.target.value)
                      }
                      placeholder="e.g. Skip the 3-day return trek and take a scenic chartered helicopter flight directly to Lukla airport."
                      className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-700 resize-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
