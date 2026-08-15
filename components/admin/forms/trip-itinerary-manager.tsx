"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Mountain,
  BedDouble,
  Utensils,
  Tag,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TripItineraryDay, TripItineraryDetail } from "@/lib/trek-data";

interface TripItineraryManagerProps {
  itinerary: TripItineraryDay[];
  onChange: (days: TripItineraryDay[]) => void;
  durationDays?: number;
  errors?: any;
}

export function TripItineraryManager({
  itinerary = [],
  onChange,
  durationDays,
  errors,
}: TripItineraryManagerProps) {
  const [openDayIndices, setOpenDayIndices] = useState<number[]>([0]);

  // Find errors for a specific day only if React Hook Form has flagged it
  const getDayErrors = (index: number) => {
    if (!errors) return null;
    if (Array.isArray(errors) && errors[index]) return errors[index];
    if (typeof errors === "object" && errors[index]) return errors[index];
    return null;
  };

  const daysWithErrorsCount = itinerary.filter((_, idx) => !!getDayErrors(idx)).length;

  const toggleDayOpen = (index: number) => {
    setOpenDayIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const expandAll = () => {
    setOpenDayIndices(itinerary.map((_, i) => i));
  };

  const collapseAll = () => {
    setOpenDayIndices([]);
  };

  const expandErrorDays = () => {
    const errorIndices = itinerary
      .map((_, i) => (getDayErrors(i) ? i : -1))
      .filter((i) => i !== -1);
    setOpenDayIndices(errorIndices.length > 0 ? errorIndices : [0]);
  };

  const handleAddDay = () => {
    const nextDayNum = itinerary.length + 1;
    const newDay: TripItineraryDay = {
      day: nextDayNum,
      title: "",
      description: "",
      maxAltitude: "",
      accommodation: "",
      meals: "",
      details: [],
    };
    const nextList = [...itinerary, newDay];
    onChange(nextList);
    setOpenDayIndices([nextList.length - 1]);
  };

  const handleAutoGenerateFromDuration = () => {
    if (!durationDays || durationDays <= 0) return;
    const days: TripItineraryDay[] = Array.from({ length: durationDays }, (_, i) => ({
      day: i + 1,
      title: i === 0 ? "Arrive in Kathmandu" : i === durationDays - 1 ? "Final Departure" : `Trek Route - Day ${i + 1}`,
      description: i === 0 
        ? "Airport arrival reception and transfer to luxury hotel in Kathmandu. Welcome orientation and gear check."
        : i === durationDays - 1
        ? "Morning breakfast and transfer to Tribhuvan International Airport for scheduled departure."
        : `Scenic day on the trail progressing according to route itinerary and acclimatization pace.`,
      maxAltitude: i === 0 ? "Kathmandu (1,400 m)" : "",
      accommodation: i === 0 ? "Overnight in Kathmandu" : "Tea House / Mountain Lodge",
      meals: i === 0 ? "Meals not included" : "Breakfast, Lunch & Dinner",
      details: [],
    }));
    onChange(days);
    setOpenDayIndices([0]);
  };

  const handleUpdateDay = (index: number, field: keyof TripItineraryDay, value: any) => {
    const updated = itinerary.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(updated);
  };

  const handleRemoveDay = (index: number) => {
    const filtered = itinerary
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, day: i + 1 }));
    onChange(filtered);
  };

  const handleMoveDay = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === itinerary.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const nextList = [...itinerary];
    const temp = nextList[index];
    nextList[index] = nextList[targetIndex];
    nextList[targetIndex] = temp;

    // Renumber days in sequence
    const renumbered = nextList.map((item, i) => ({ ...item, day: i + 1 }));
    onChange(renumbered);
  };

  // Dynamic custom key-value details per day
  const handleAddDetail = (dayIndex: number) => {
    const currentDay = itinerary[dayIndex];
    const currentDetails = currentDay.details || [];
    const updatedDetails: TripItineraryDetail[] = [
      ...currentDetails,
      { label: "", value: "" },
    ];
    handleUpdateDay(dayIndex, "details", updatedDetails);
  };

  const handleUpdateDetail = (
    dayIndex: number,
    detailIndex: number,
    field: "label" | "value",
    val: string
  ) => {
    const currentDay = itinerary[dayIndex];
    const currentDetails = currentDay.details || [];
    const updatedDetails = currentDetails.map((det, dIdx) => {
      if (dIdx === detailIndex) {
        return { ...det, [field]: val };
      }
      return det;
    });
    handleUpdateDay(dayIndex, "details", updatedDetails);
  };

  const handleRemoveDetail = (dayIndex: number, detailIndex: number) => {
    const currentDay = itinerary[dayIndex];
    const currentDetails = currentDay.details || [];
    const updatedDetails = currentDetails.filter((_, dIdx) => dIdx !== detailIndex);
    handleUpdateDay(dayIndex, "details", updatedDetails);
  };

  const durationMismatch = durationDays && durationDays > 0 && itinerary.length > 0 && itinerary.length !== durationDays;

  return (
    <div className="space-y-4">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div>
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Detailed Itinerary ({itinerary.length} Days)</span>
          </h4>
          <p className="text-[11px] text-slate-600 font-medium">
            Configure day-by-day progression, summit heights, lodging, and flexible highlights.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {itinerary.length > 0 && (
            <div className="flex items-center gap-1.5 mr-1 text-xs">
              <button
                type="button"
                onClick={expandAll}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-200/60 cursor-pointer"
              >
                Expand All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-200/60 cursor-pointer"
              >
                Collapse All
              </button>
              {daysWithErrorsCount > 0 && (
                <>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={expandErrorDays}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-md hover:bg-rose-50 cursor-pointer flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3 text-rose-500" />
                    <span>Errors ({daysWithErrorsCount})</span>
                  </button>
                </>
              )}
            </div>
          )}

          {durationDays && durationDays > 0 && itinerary.length === 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoGenerateFromDuration}
              className="bg-white border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-semibold h-8 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Generate {durationDays} Days
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handleAddDay}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-8 px-3 rounded-lg cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-amber-400" />
            Add Day
          </Button>
        </div>
      </div>

      {/* Duration Mismatch Warning */}
      {durationMismatch && (
        <div className="flex items-center justify-between gap-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Duration Notice:</strong> Package duration is configured as <strong>{durationDays} days</strong>, but <strong>{itinerary.length} days</strong> are defined here.
            </span>
          </div>
          <button
            type="button"
            onClick={handleAutoGenerateFromDuration}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
          >
            Re-generate {durationDays} Days
          </button>
        </div>
      )}

      {/* Empty State */}
      {itinerary.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-xs font-bold text-slate-800">No itinerary days added yet</p>
            <p className="text-[11px] text-slate-500">
              Add day-by-day route details including descriptions, summit heights, overnight stays, and meal plans.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {durationDays && durationDays > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoGenerateFromDuration}
                className="text-xs font-semibold cursor-pointer border-amber-300 text-amber-900 hover:bg-amber-50"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Auto-generate {durationDays} Days
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleAddDay}
              className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Add Day 1
            </Button>
          </div>
        </div>
      ) : (
        /* Days List */
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {itinerary.map((dayItem, index) => {
            const isOpen = openDayIndices.includes(index);
            const formattedDayNumber = `Day ${String(dayItem.day || index + 1).padStart(2, "0")}`;
            const dayError = getDayErrors(index);
            const hasTitleError = !!dayError?.title;
            const hasDescError = !!dayError?.description;
            const hasDayError = !!dayError;

            return (
              <div
                key={index}
                className={`rounded-xl bg-white border shadow-2xs overflow-hidden transition-all duration-200 ${
                  hasDayError
                    ? "border-rose-300 ring-1 ring-rose-200"
                    : "border-slate-200"
                }`}
              >
                {/* Day Accordion Header */}
                <div
                  className={`p-3 border-b flex items-center justify-between gap-3 ${
                    hasDayError ? "bg-rose-50/50 border-rose-100" : "bg-slate-50/80 border-slate-100"
                  }`}
                >
                  <div
                    onClick={() => toggleDayOpen(index)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group"
                  >
                    <span
                      className={`shrink-0 border text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                        hasDayError
                          ? "bg-rose-100 text-rose-900 border-rose-300"
                          : "bg-amber-100 text-amber-900 border-amber-300/80"
                      }`}
                    >
                      {formattedDayNumber}
                    </span>

                    <span className="text-xs font-bold text-slate-800 truncate group-hover:text-amber-800 transition-colors">
                      {dayItem.title ? (
                        dayItem.title
                      ) : (
                        <span className="text-slate-400 font-normal italic">Untitled Day (click to edit)</span>
                      )}
                    </span>

                    {hasDayError && (
                      <span className="shrink-0 bg-rose-100 text-rose-700 border border-rose-300/80 text-[10px] font-bold px-1.5 py-0.2 rounded-md hidden sm:inline-flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" />
                        {hasTitleError && hasDescError
                          ? "Missing Title & Desc"
                          : hasTitleError
                          ? "Missing Title"
                          : "Missing Desc"}
                      </span>
                    )}
                  </div>

                  {/* Actions & Reorder buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveDay(index, "up")}
                      title="Move Day Up"
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === itinerary.length - 1}
                      onClick={() => handleMoveDay(index, "down")}
                      title="Move Day Down"
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveDay(index)}
                      title="Remove Day"
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDayOpen(index)}
                      className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors cursor-pointer ml-1"
                    >
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Day Expanded Form Body */}
                {isOpen && (
                  <div className="p-4 space-y-4 bg-white">
                    {/* Day Number and Title */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Day Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          min={1}
                          value={dayItem.day || index + 1}
                          onChange={(e) => handleUpdateDay(index, "day", Number(e.target.value))}
                          className="h-9 text-xs font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-9">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Day Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Arrive in Kathmandu / Trek to Namche Bazaar"
                          value={dayItem.title || ""}
                          onChange={(e) => handleUpdateDay(index, "title", e.target.value)}
                          className={`h-9 text-xs font-semibold ${
                            hasTitleError ? "border-rose-400 focus-visible:ring-rose-400" : ""
                          }`}
                        />
                        {hasTitleError && (
                          <p className="text-[10px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Day title is required</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Day Description */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Daily Description / Route Breakdown <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Detail the day's route, trail conditions, mountain viewpoints, Sherpa support, or acclimatization schedule..."
                        value={dayItem.description || ""}
                        onChange={(e) => handleUpdateDay(index, "description", e.target.value)}
                        className={`w-full text-xs bg-white border rounded-lg p-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 leading-relaxed ${
                          hasDescError
                            ? "border-rose-400 focus:ring-rose-400/30"
                            : "border-slate-200 focus:ring-amber-500/30"
                        }`}
                      />
                      {hasDescError && (
                        <p className="text-[10px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Daily route description is required</span>
                        </p>
                      )}
                    </div>

                    {/* Common Highlights / Fast Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Mountain className="w-3 h-3 text-amber-600" />
                          <span>Max. Altitude</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Kathmandu (1,400 m)"
                          value={dayItem.maxAltitude || ""}
                          onChange={(e) => handleUpdateDay(index, "maxAltitude", e.target.value)}
                          className="h-8 text-xs placeholder:text-slate-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <BedDouble className="w-3 h-3 text-amber-600" />
                          <span>Overnight / Lodging</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Overnight in Kathmandu"
                          value={dayItem.accommodation || ""}
                          onChange={(e) => handleUpdateDay(index, "accommodation", e.target.value)}
                          className="h-8 text-xs placeholder:text-slate-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Utensils className="w-3 h-3 text-amber-600" />
                          <span>Meals</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Meals not included / B, L, D"
                          value={dayItem.meals || ""}
                          onChange={(e) => handleUpdateDay(index, "meals", e.target.value)}
                          className="h-8 text-xs placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Dynamic Custom Key-Value Details */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                          <Tag className="w-3 h-3 text-amber-600" />
                          <span>Custom Day Highlights &amp; Specs ({dayItem.details?.length || 0})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddDetail(index)}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Custom Field</span>
                        </button>
                      </div>

                      {dayItem.details && dayItem.details.length > 0 && (
                        <div className="space-y-2 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/80">
                          {dayItem.details.map((det, dIdx) => (
                            <div key={dIdx} className="flex items-center gap-2">
                              <Input
                                type="text"
                                placeholder="Label (e.g. Walking Time / Distance)"
                                value={det.label || ""}
                                onChange={(e) =>
                                  handleUpdateDetail(index, dIdx, "label", e.target.value)
                                }
                                className="h-8 text-xs bg-white flex-1"
                              />
                              <Input
                                type="text"
                                placeholder="Value (e.g. 5-6 hours / 14 km)"
                                value={det.value || ""}
                                onChange={(e) =>
                                  handleUpdateDetail(index, dIdx, "value", e.target.value)
                                }
                                className="h-8 text-xs bg-white flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveDetail(index, dIdx)}
                                title="Remove Custom Field"
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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

