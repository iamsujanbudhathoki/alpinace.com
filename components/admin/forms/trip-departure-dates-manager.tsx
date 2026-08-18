"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar, DollarSign, Users, AlertCircle, CheckCircle2, Info, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripDepartureDate } from "@/lib/admin-data";

interface TripDepartureDatesManagerProps {
  dates: TripDepartureDate[];
  onChange: (dates: TripDepartureDate[]) => void;
  readOnly?: boolean;
  defaultPrice?: number;
}

const STATUS_OPTIONS = [
  { value: "guaranteed", label: "Guaranteed Departure", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "available", label: "Available", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "limited", label: "Limited Seats", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "full", label: "Fully Booked", color: "bg-rose-100 text-rose-800 border-rose-300" },
];

export function TripDepartureDatesManager({
  dates = [],
  onChange,
  readOnly = false,
  defaultPrice,
}: TripDepartureDatesManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<TripDepartureDate>({
    startDate: "",
    endDate: "",
    priceUSD: defaultPrice || undefined,
    status: "guaranteed",
    seatsAvailable: 10,
    notes: "",
  });

  const handleStartAdd = () => {
    setFormData({
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      priceUSD: defaultPrice || undefined,
      status: "guaranteed",
      seatsAvailable: 10,
      notes: "",
    });
    setEditingIndex(-1);
  };

  const handleStartEdit = (index: number) => {
    const item = dates[index];
    setFormData({ ...item });
    setEditingIndex(index);
  };

  const handleSave = () => {
    if (!formData.startDate || !formData.endDate) return;
    const nextDates = [...dates];
    if (editingIndex === -1) {
      nextDates.push({ ...formData, id: `dep-${Date.now()}` });
    } else if (editingIndex !== null && editingIndex >= 0) {
      nextDates[editingIndex] = { ...formData };
    }
    onChange(nextDates);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const nextDates = dates.filter((_, i) => i !== index);
    onChange(nextDates);
    if (editingIndex === index) setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Fixed Departure Dates &amp; Availability</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage upcoming scheduled departures for travelers to join.
          </p>
        </div>
        {!readOnly && editingIndex === null && (
          <Button
            type="button"
            onClick={handleStartAdd}
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 text-xs h-9 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Departure Date</span>
          </Button>
        )}
      </div>

      {/* Form Drawer / Card */}
      {editingIndex !== null && !readOnly && (
        <div className="p-4 sm:p-5 bg-white border border-emerald-200 shadow-sm rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{editingIndex === -1 ? "New Departure Date Slot" : "Edit Departure Date Slot"}</span>
            </h4>
            <span className="text-xs text-slate-400">Step {editingIndex === -1 ? "1" : "2"} of 2</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full h-9 text-xs px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full h-9 text-xs px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price (USD)
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="number"
                  placeholder={defaultPrice ? `${defaultPrice}` : "e.g. 1450"}
                  value={formData.priceUSD !== undefined ? formData.priceUSD : ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceUSD: e.target.value !== "" ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full h-9 text-xs pl-8 pr-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Availability Status
              </label>
              <select
                value={formData.status || "guaranteed"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-9 text-xs px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Available Seats / Capacity
              </label>
              <div className="relative">
                <Users className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="number"
                  placeholder="e.g. 8"
                  value={formData.seatsAvailable !== undefined ? formData.seatsAvailable : ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seatsAvailable: e.target.value !== "" ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full h-9 text-xs pl-8 pr-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes / Special Offer (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Early Bird Discount Available"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full h-9 text-xs px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingIndex(null)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!formData.startDate || !formData.endDate}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 px-4"
            >
              {editingIndex === -1 ? "Save Date Slot" : "Update Date Slot"}
            </Button>
          </div>
        </div>
      )}

      {/* Dates List Table / Grid */}
      {dates.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/70 border border-dashed border-slate-200 rounded-xl">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">No Departure Dates Scheduled</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
            Add fixed departure date slots so prospective travelers and Marketing Associates can view upcoming departures.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
          {dates.map((item, idx) => {
            const statusConfig =
              STATUS_OPTIONS.find((s) => s.value === item.status) || STATUS_OPTIONS[0];

            return (
              <div
                key={item.id || idx}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-700 shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {item.startDate} &rarr; {item.endDate}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                      {item.priceUSD !== undefined && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ${item.priceUSD.toLocaleString()} USD
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                      {item.seatsAvailable !== undefined && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{item.seatsAvailable} seats available</span>
                        </span>
                      )}
                      {item.notes && (
                        <span className="flex items-center gap-1 italic text-slate-600">
                          <Info className="w-3 h-3 text-amber-500" />
                          <span>{item.notes}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(idx)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors text-xs flex items-center gap-1"
                      title="Edit Date Slot"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors text-xs"
                      title="Delete Date Slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
