"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInputField } from "@/components/admin/forms/admin-form-fields";
import { GroupPricingTier, validateGroupPricingTiers } from "@/lib/pricing-util";

export interface TripGroupPricingManagerProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  tiers: GroupPricingTier[];
  onChange: (tiers: GroupPricingTier[]) => void;
  readOnly?: boolean;
}

export function TripGroupPricingManager({
  enabled = false,
  onEnabledChange,
  tiers = [],
  onChange,
  readOnly = false,
}: TripGroupPricingManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<GroupPricingTier>({
    minTravelers: 1,
    maxTravelers: 1,
    pricePerPerson: 1000,
  });
  const [editError, setEditError] = useState<string | null>(null);

  // Validate current configuration
  const validation = validateGroupPricingTiers(tiers, enabled);

  const handleStartAdd = () => {
    // Automatically suggest next contiguous range
    const lastTier = tiers.length > 0 ? tiers[tiers.length - 1] : null;
    const nextMin = lastTier ? Number(lastTier.maxTravelers) + 1 : 1;
    const nextMax = lastTier ? nextMin + 2 : 1;
    const nextPrice = lastTier ? Math.max(1, Number(lastTier.pricePerPerson) - 50) : 1000;

    setFormData({
      id: `tier-${Date.now()}`,
      minTravelers: nextMin,
      maxTravelers: nextMax,
      pricePerPerson: nextPrice,
    });
    setEditError(null);
    setEditingIndex(-1);
  };

  const handleStartEdit = (index: number) => {
    const item = tiers[index];
    setFormData({ ...item });
    setEditError(null);
    setEditingIndex(index);
  };

  const handleSaveTier = () => {
    const min = Number(formData.minTravelers);
    const max = Number(formData.maxTravelers);
    const price = Number(formData.pricePerPerson);

    if (isNaN(min) || min < 1) {
      setEditError("Minimum travelers must be at least 1");
      return;
    }
    if (isNaN(max) || max < min) {
      setEditError(`Maximum travelers must be at least ${min}`);
      return;
    }
    if (isNaN(price) || price <= 0) {
      setEditError("Price per person must be greater than 0");
      return;
    }

    const nextTiers = [...tiers];
    const newTier: GroupPricingTier = {
      id: formData.id || `tier-${Date.now()}`,
      minTravelers: min,
      maxTravelers: max,
      pricePerPerson: price,
    };

    if (editingIndex === -1) {
      nextTiers.push(newTier);
    } else if (editingIndex !== null && editingIndex >= 0) {
      nextTiers[editingIndex] = newTier;
    }

    // Sort by minTravelers ascending
    nextTiers.sort((a, b) => Number(a.minTravelers) - Number(b.minTravelers));

    // Check if the proposed change creates an invalid configuration
    const testValidation = validateGroupPricingTiers(nextTiers, true);
    if (!testValidation.valid) {
      setEditError(testValidation.error || "Invalid tier range");
      return;
    }

    onChange(nextTiers);
    setEditingIndex(null);
    setEditError(null);
  };

  const handleDeleteTier = (index: number) => {
    const nextTiers = tiers.filter((_, i) => i !== index);
    onChange(nextTiers);
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditError(null);
    }
  };

  const handleMoveTier = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === tiers.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const nextTiers = [...tiers];
    const temp = nextTiers[index];
    nextTiers[index] = nextTiers[targetIndex];
    nextTiers[targetIndex] = temp;
    onChange(nextTiers);
  };

  return (
    <div className="space-y-4">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Group Pricing
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure tiered per-person rates based on group size.
          </p>
        </div>

        {!readOnly && (
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white shadow-xs cursor-pointer hover:bg-slate-50 transition-colors select-none">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onEnabledChange(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800">
              Enable group pricing
            </span>
          </label>
        )}
      </div>

      {enabled ? (
        <div className="space-y-3">
          {/* Validation Alert */}
          {!validation.valid && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Configuration Error</p>
                <p className="mt-0.5">{validation.error}</p>
              </div>
            </div>
          )}

          {/* Valid Summary */}
          {validation.valid && tiers.length > 0 && (
            <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium">
                  Valid continuous coverage: <strong>{tiers[0].minTravelers}</strong> to{" "}
                  <strong>{tiers[tiers.length - 1].maxTravelers}</strong> travelers ({tiers.length}{" "}
                  {tiers.length === 1 ? "tier" : "tiers"}).
                </span>
              </div>
            </div>
          )}

          {/* Pricing Tiers Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
            <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pricing Tiers
              </span>
              {!readOnly && editingIndex === null && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleStartAdd}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 text-xs h-7.5 px-2.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add pricing tier</span>
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/60 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Traveler Range</th>
                    <th className="py-2.5 px-4">Price Per Person</th>
                    {!readOnly && (
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tiers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={readOnly ? 2 : 3}
                        className="py-8 text-center text-slate-500 font-medium"
                      >
                        <p className="text-sm font-semibold text-slate-700">No pricing tiers configured yet</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Click &quot;Add pricing tier&quot; to set up tiered rates for your groups.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    tiers.map((tier, idx) => {
                      const rangeLabel =
                        Number(tier.minTravelers) === Number(tier.maxTravelers)
                          ? `${tier.minTravelers} traveler`
                          : `${tier.minTravelers} – ${tier.maxTravelers} travelers`;

                      return (
                        <tr
                          key={tier.id || idx}
                          className={`hover:bg-slate-50/60 transition-colors ${
                            editingIndex === idx ? "bg-amber-50/40" : ""
                          }`}
                        >
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            <span className="inline-block bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs border border-slate-200">
                              {rangeLabel}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-700 text-sm">
                              US${Number(tier.pricePerPerson).toLocaleString()}
                            </span>
                            <span className="text-slate-500 text-[11px] ml-1">
                              / person
                            </span>
                          </td>
                          {!readOnly && (
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveTier(idx, "up")}
                                  title="Move up"
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 cursor-pointer"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === tiers.length - 1}
                                  onClick={() => handleMoveTier(idx, "down")}
                                  title="Move down"
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 cursor-pointer"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(idx)}
                                  title="Edit tier"
                                  className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer ml-1"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTier(idx)}
                                  title="Delete tier"
                                  className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions when empty and not editing */}
            {!readOnly && tiers.length === 0 && editingIndex === null && (
              <div className="p-3 bg-slate-50/60 border-t border-slate-200 flex justify-center">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleStartAdd}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 text-xs h-8 px-4"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add pricing tier</span>
                </Button>
              </div>
            )}
          </div>

          {/* Clean Inline Add / Edit Drawer */}
          {editingIndex !== null && !readOnly && (
            <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-xs font-bold text-slate-900">
                  {editingIndex === -1 ? "Add Pricing Tier" : "Edit Pricing Tier"}
                </h4>
                <span className="text-[11px] text-slate-500">
                  Continuous coverage required
                </span>
              </div>

              {editError && (
                <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <AdminInputField
                  label="Minimum Travelers"
                  type="number"
                  min={1}
                  required
                  value={formData.minTravelers}
                  onChange={(e) =>
                    setFormData({ ...formData, minTravelers: Number(e.target.value) })
                  }
                />
                <AdminInputField
                  label="Maximum Travelers"
                  type="number"
                  min={formData.minTravelers}
                  required
                  value={formData.maxTravelers}
                  onChange={(e) =>
                    setFormData({ ...formData, maxTravelers: Number(e.target.value) })
                  }
                />
                <AdminInputField
                  label="Price Per Person (USD)"
                  type="number"
                  min={1}
                  required
                  value={formData.pricePerPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerPerson: Number(e.target.value) })
                  }
                />
              </div>

              {/* Helpful preview sentence */}
              <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded border border-slate-200">
                Summary:{" "}
                <strong className="text-slate-800">
                  {formData.minTravelers === formData.maxTravelers
                    ? `${formData.minTravelers} traveler`
                    : `${formData.minTravelers} – ${formData.maxTravelers} travelers`}
                </strong>{" "}
                will be charged{" "}
                <strong className="text-emerald-700">
                  US${Number(formData.pricePerPerson || 0).toLocaleString()}
                </strong>{" "}
                per person.
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingIndex(null);
                    setEditError(null);
                  }}
                  className="h-8 text-xs px-3"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveTier}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white h-8 text-xs px-4"
                >
                  {editingIndex === -1 ? "Save Tier" : "Update Tier"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 bg-slate-50/50">
          <Info className="w-4 h-4 mx-auto mb-1 text-slate-400" />
          Group pricing is currently disabled. The package will use the standard base price per person for all group sizes.
        </div>
      )}
    </div>
  );
}
