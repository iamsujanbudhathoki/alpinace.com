"use client";

import React, { useState } from "react";
import { Plus, Trash2, Sparkles, DollarSign, CheckCircle2, EyeOff, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { PackageAddonItem } from "@/lib/admin-data";
import { toast } from "sonner";
import {
  AddonPreset,
  COMMON_ADDON_PRESETS,
} from "@/lib/constants/package-presets";

interface TripAddonsManagerProps {
  addons?: PackageAddonItem[];
  onChange: (addons: PackageAddonItem[]) => void;
}

export function TripAddonsManager({
  addons = [],
  onChange,
}: TripAddonsManagerProps) {
  const [addonToDelete, setAddonToDelete] = useState<{
    index: number;
    addon: PackageAddonItem;
  } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...addons];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    onChange(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
    toast.success("Add-on order updated");
  };

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

  const handleApplyPreset = (preset: AddonPreset) => {
    const exists = addons.some(
      (a) => a.title.trim().toLowerCase() === preset.title.trim().toLowerCase()
    );
    if (exists) {
      toast.info(`"${preset.title}" is already in your add-ons list.`);
      return;
    }
    const newAddon: PackageAddonItem = {
      id: `addon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: preset.title,
      description: preset.description,
      priceUSD: preset.priceUSD,
      isActive: true,
    };
    onChange([...addons, newAddon]);
    toast.success(`Added "${preset.title}" to add-ons.`);
  };

  const handleAutofillStandard = () => {
    const standardPresets = [COMMON_ADDON_PRESETS[0], COMMON_ADDON_PRESETS[1]];
    const toAdd: PackageAddonItem[] = [];

    for (const preset of standardPresets) {
      const exists = addons.some(
        (a) => a.title.trim().toLowerCase() === preset.title.trim().toLowerCase()
      );
      if (!exists) {
        toAdd.push({
          id: `addon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: preset.title,
          description: preset.description,
          priceUSD: preset.priceUSD,
          isActive: true,
        });
      }
    }

    if (toAdd.length === 0) {
      toast.info("Personal Porter and Helicopter Return are already added.");
      return;
    }

    onChange([...addons, ...toAdd]);
    toast.success(`Autofilled ${toAdd.length} common add-on(s).`);
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

  const handleConfirmDelete = () => {
    if (addonToDelete !== null) {
      const title = addonToDelete.addon.title;
      onChange(addons.filter((_, i) => i !== addonToDelete.index));
      toast.success(title ? `Add-on "${title}" removed.` : "Add-on removed.");
      setAddonToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Configured Add-ons
          </h4>
          <p className="text-xs text-slate-500">
            Optional upgrades available during booking (e.g. helicopter flights, porter service).
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutofillStandard}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold flex items-center gap-1.5 cursor-pointer text-xs h-9 shadow-2xs"
            title="Autofill Personal Porter Service and Helicopter Return Flight"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Autofill Common</span>
          </Button>

          <Button
            type="button"
            onClick={handleAdd}
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs text-xs h-9"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            Add Add-on
          </Button>
        </div>
      </div>

      {/* Quick Preset Template Bar */}
      <div className="flex items-center gap-1.5 flex-wrap bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
        <span className="text-[11px] font-bold text-slate-600 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Quick Add:
        </span>
        {COMMON_ADDON_PRESETS.map((preset) => {
          const isAdded = addons.some(
            (a) => a.title.trim().toLowerCase() === preset.title.trim().toLowerCase()
          );
          return (
            <button
              key={preset.id}
              type="button"
              disabled={isAdded}
              onClick={() => handleApplyPreset(preset)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                isAdded
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-default"
                  : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 cursor-pointer shadow-2xs"
              }`}
              title={isAdded ? `"${preset.title}" already added` : `Add ${preset.title} ($${preset.priceUSD})`}
            >
              <Plus className={`w-3 h-3 ${isAdded ? "text-slate-400" : "text-amber-500"}`} />
              <span>{preset.title}</span>
              <span className={`text-[10px] ml-0.5 ${isAdded ? "text-slate-400" : "text-amber-600 font-bold"}`}>
                (${preset.priceUSD})
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {addons.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md">
            <h5 className="text-sm font-bold text-slate-800">No Add-ons Configured</h5>
            <p className="text-xs text-slate-500 mt-1">
              Add-ons allow clients to customize their booking with extra upgrades and gear.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
            <Button
              type="button"
              size="sm"
              onClick={handleAutofillStandard}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer text-xs h-8 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Autofill Common Add-ons
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAdd}
              className="cursor-pointer font-semibold text-slate-800 hover:bg-slate-100 text-xs h-8"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-slate-600" />
              Add Blank Add-on
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {addons.map((addon, index) => {
            const isActive = addon.isActive !== false;
            const isDragging = draggedIndex === index;
            const isOver = dragOverIndex === index;

            return (
              <div
                key={addon.id || index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className={`p-4 rounded-xl border transition-all ${
                  isDragging
                    ? "opacity-40 bg-amber-50/50 border-dashed border-amber-300"
                    : isOver
                    ? "border-t-2 border-amber-500 bg-amber-50/20"
                    : isActive
                    ? "bg-white border-slate-200/90 shadow-xs"
                    : "bg-slate-50/70 border-slate-200 opacity-75"
                }`}
              >
                {/* Header row inside card */}
                <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div
                      className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
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
                        className="w-3.5 h-3.5 accent-slate-900 rounded cursor-pointer"
                      />
                      <span>Active</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setAddonToDelete({ index, addon })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
                    <label className="text-xs font-semibold text-slate-700 block">
                      Add-on Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addon.title}
                      onChange={(e) => handleUpdate(index, "title", e.target.value)}
                      placeholder="e.g. Helicopter Return from Gorak Shep to Lukla"
                      className="w-full text-xs px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all font-medium text-slate-900"
                    />
                  </div>

                  {/* Price */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Price (USD) <span className="text-rose-500">*</span>
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
                        className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-12 space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Description / Details
                    </label>
                    <textarea
                      rows={2}
                      value={addon.description || ""}
                      onChange={(e) =>
                        handleUpdate(index, "description", e.target.value)
                      }
                      placeholder="e.g. Skip the 3-day return trek and take a scenic chartered helicopter flight directly to Lukla airport."
                      className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all text-slate-700 resize-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <AdminConfirmModal
        isOpen={addonToDelete !== null}
        onClose={() => setAddonToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Add-on"
        description={
          addonToDelete?.addon.title
            ? `Are you sure you want to remove "${addonToDelete.addon.title}"? This action cannot be undone.`
            : "Are you sure you want to remove this add-on? This action cannot be undone."
        }
        confirmText="Delete Add-on"
        variant="danger"
      />
    </div>
  );
}
