"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Save,
  Check,
  Loader2,
  Sparkles,
  Info,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { ActivityItem } from "@/lib/admin-data";
import { ActivityService } from "@/lib/services/admin-service";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { Button } from "@/components/ui/button";

export default function ActivitiesOrderingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const res = await ActivityService.getAll({ limit: 100 });
      const items: ActivityItem[] = Array.isArray(res) ? [...res] : [];
      // Sort by menuOrder ascending
      items.sort((a: ActivityItem, b: ActivityItem) => (a.menuOrder ?? 0) - (b.menuOrder ?? 0));
      setActivities(items);
    } catch (err) {
      console.error("Failed to load activities for reordering:", err);
      toast.error("Failed to load activities from server.");
    } finally {
      setLoading(false);
    }
  };

  // Reorder via Arrow Buttons
  const moveActivity = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= activities.length) return;

    setActivities((prev) => {
      const list = [...prev];
      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;
      return list;
    });
  };

  // Drag & Drop Handlers
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== idx) {
      setDragOverIndex(idx);
    }
  };

  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;

    setActivities((prev) => {
      const list = [...prev];
      const draggedItem = list[draggedIndex];
      list.splice(draggedIndex, 1);
      list.splice(idx, 0, draggedItem);
      return list;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Save Ordering to Backend
  const handleSaveOrdering = async () => {
    setSaving(true);
    try {
      const items = activities.map((act, index) => ({
        id: act.id,
        menuOrder: index,
      }));

      const res = await ActivityService.reorder(items);
      if (res && res.success) {
        setSavedSuccess(true);
        toast.success("Activity display order saved successfully.");
        setTimeout(() => setSavedSuccess(false), 2500);
        await loadActivities();
      } else {
        toast.error(res?.message || "Failed to save order.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to save activity ordering.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Activity Display Ordering"
        description="Drag and drop or use arrow buttons to reorder how activities appear across the site."
      >
        <div className="flex items-center gap-2">
          <Link href="/admin/activities">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Activities
            </Button>
          </Link>

          <Button
            onClick={handleSaveOrdering}
            disabled={saving || loading || activities.length === 0}
            size="sm"
            className="bg-stone-900 hover:bg-stone-800 text-white text-xs gap-1.5 cursor-pointer min-w-[130px]"
          >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Order
                </>
              )}
            </Button>
        </div>
      </AdminPageHeader>

      <div className="bg-amber-50/70 border border-amber-200/80 rounded-sm p-4 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">Drag &amp; Drop Tip</span>
          Click and drag any activity row using the grip icon on the left to reorder. Click <strong>"Save Order"</strong> to apply the changes live.
        </div>
      </div>

      {/* Reorderable Activities List */}
      <div className="bg-white border border-stone-200 rounded-sm overflow-hidden shadow-xs">
        <div className="p-4 bg-stone-50 border-b border-stone-200 font-semibold text-xs text-stone-700 uppercase tracking-wider flex items-center justify-between">
          <span>Activity Name</span>
          <span>Position &amp; Reorder Actions</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-stone-600" />
            Loading activities...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            No activities available to reorder. Add activities first!
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {activities.map((act, index) => {
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={act.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`p-3.5 flex items-center justify-between transition-colors ${
                    isDragging
                      ? "bg-amber-50 border-2 border-dashed border-amber-300 opacity-60"
                      : isDragOver
                      ? "bg-stone-100 border-t-2 border-stone-900"
                      : "hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab active:cursor-grabbing text-stone-400 hover:text-stone-700">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {act.image ? (
                      <img
                        src={act.image}
                        alt={act.name}
                        className="w-8 h-8 rounded object-cover border border-stone-200 shrink-0 bg-stone-100"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-400 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-stone-900">
                        {act.name}
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono">
                        /{act.slug}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                      Position #{index + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={index === 0}
                        onClick={() => moveActivity(index, "up")}
                        className="h-7 w-7 text-stone-600 hover:text-stone-900"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={index === activities.length - 1}
                        onClick={() => moveActivity(index, "down")}
                        className="h-7 w-7 text-stone-600 hover:text-stone-900"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
