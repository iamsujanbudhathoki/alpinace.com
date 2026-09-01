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
  FolderTree,
  Info,
  GitMerge,
  Mountain,
  Compass,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { MenuCategoryDto, CategoryType } from "@/lib/admin-data";
import { CategoryService } from "@/lib/services/admin-service";
import { categoryCache } from "@/lib/services/category-cache";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { Button } from "@/components/ui/button";

const MARKETING_DOMAINS = [
  { label: "Trekking", value: CategoryType.TREKKING, icon: Mountain },
  { label: "Tours", value: CategoryType.TOURS, icon: Compass },
  { label: "Expeditions", value: CategoryType.EXPEDITIONS, icon: MapPin },
];

export default function CategoryMenuOrderingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [parentCategories, setParentCategories] = useState<MenuCategoryDto[]>([]);
  const [expandedParentId, setExpandedParentId] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<CategoryType>(CategoryType.TREKKING);

  // Drag & Drop State for Top-Level Parent Categories
  const [draggedParentIndex, setDraggedParentIndex] = useState<number | null>(null);
  const [dragOverParentIndex, setDragOverParentIndex] = useState<number | null>(null);

  // Drag & Drop State for Subcategories within Selected Parent
  const [draggedSubIndex, setDraggedSubIndex] = useState<number | null>(null);
  const [dragOverSubIndex, setDragOverSubIndex] = useState<number | null>(null);

  useEffect(() => {
    loadCategoryMenuStructure(selectedDomain);
  }, [selectedDomain]);

  const loadCategoryMenuStructure = async (domain: CategoryType) => {
    setLoading(true);
    try {
      const res = await CategoryService.getMenuOrderingStructure(domain);
      setParentCategories(res);
      if (res.length > 0) {
        setExpandedParentId(res[0].id);
      } else {
        setExpandedParentId(null);
      }
    } catch (err) {
      console.error("Failed to load category menu structure:", err);
      toast.error("Failed to load menu categories from server");
    } finally {
      setLoading(false);
    }
  };

  // Reorder Top-Level Parent Categories (Arrow Buttons)
  const moveParent = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= parentCategories.length) return;

    setParentCategories((prev) => {
      const newParents = [...prev];
      const temp = newParents[idx];
      newParents[idx] = newParents[targetIdx];
      newParents[targetIdx] = temp;
      return newParents;
    });
  };

  // Reorder Subcategories within a Parent (Arrow Buttons)
  const moveSubcategory = (parentId: string, subIndex: number, direction: "up" | "down") => {
    setParentCategories((prev) =>
      prev.map((parent) => {
        if (parent.id !== parentId || !parent.subcategories) return parent;

        const targetIndex = direction === "up" ? subIndex - 1 : subIndex + 1;
        if (targetIndex < 0 || targetIndex >= parent.subcategories.length) return parent;

        const newSubItems = [...parent.subcategories];
        const temp = newSubItems[subIndex];
        newSubItems[subIndex] = newSubItems[targetIndex];
        newSubItems[targetIndex] = temp;

        return { ...parent, subcategories: newSubItems };
      })
    );
  };

  // HTML5 Drag & Drop Handlers for Parent Categories
  const handleParentDragStart = (e: React.DragEvent, index: number) => {
    setDraggedParentIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleParentDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedParentIndex !== null && draggedParentIndex !== index) {
      setDragOverParentIndex(index);
    }
  };

  const handleParentDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedParentIndex === null || draggedParentIndex === targetIndex) {
      setDraggedParentIndex(null);
      setDragOverParentIndex(null);
      return;
    }

    setParentCategories((prev) => {
      const reordered = [...prev];
      const [movedItem] = reordered.splice(draggedParentIndex, 1);
      reordered.splice(targetIndex, 0, movedItem);
      return reordered;
    });

    setDraggedParentIndex(null);
    setDragOverParentIndex(null);
  };

  const handleParentDragEnd = () => {
    setDraggedParentIndex(null);
    setDragOverParentIndex(null);
  };

  // HTML5 Drag & Drop Handlers for Subcategories
  const handleSubDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSubIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSubDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSubIndex !== null && draggedSubIndex !== index) {
      setDragOverSubIndex(index);
    }
  };

  const handleSubDrop = (e: React.DragEvent, parentId: string, targetIndex: number) => {
    e.preventDefault();
    if (draggedSubIndex === null || draggedSubIndex === targetIndex) {
      setDraggedSubIndex(null);
      setDragOverSubIndex(null);
      return;
    }

    setParentCategories((prev) =>
      prev.map((parent) => {
        if (parent.id !== parentId || !parent.subcategories) return parent;

        const reordered = [...parent.subcategories];
        const [movedItem] = reordered.splice(draggedSubIndex, 1);
        reordered.splice(targetIndex, 0, movedItem);

        return { ...parent, subcategories: reordered };
      })
    );

    setDraggedSubIndex(null);
    setDragOverSubIndex(null);
  };

  const handleSubDragEnd = () => {
    setDraggedSubIndex(null);
    setDragOverSubIndex(null);
  };

  // Save Configured Menu Order per Target Domain to Backend
  const handleSaveMenuOrder = async () => {
    setSaving(true);
    try {
      const itemsToUpdate: { id: string; menuOrder: number }[] = [];

      parentCategories.forEach((parent, parentIdx) => {
        itemsToUpdate.push({ id: parent.id, menuOrder: parentIdx + 1 });

        if (parent.subcategories && parent.subcategories.length > 0) {
          parent.subcategories.forEach((sub, subIdx) => {
            itemsToUpdate.push({ id: sub.id, menuOrder: subIdx + 1 });
          });
        }
      });

      const res = await CategoryService.reorder(itemsToUpdate, selectedDomain);
      if (res.success) {
        categoryCache.clear();
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
        toast.success(`Marketing navbar menu order for ${selectedDomain} saved successfully!`);
      } else {
        toast.error(res.message || "Failed to save menu order.");
      }
    } catch (err: any) {
      console.error("Failed to save menu order:", err);
      toast.error(err.message || "Failed to save menu order to server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-700">Loading {selectedDomain} menu navigation structure...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <AdminPageHeader
        title="Marketing Menu Ordering"
        description="Organize the display sequence of Trekking, Tours, and Expeditions categories for the website header."
      >
        <Link href="/admin/categories">
          <Button variant="outline" size="sm" className="text-slate-700 border-slate-300 font-semibold text-xs">
            Manage All Categories
          </Button>
        </Link>
        <Button onClick={handleSaveMenuOrder} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Order...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Menu Order</span>
            </>
          )}
        </Button>
      </AdminPageHeader>

      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Marketing menu category order saved successfully! The website header navigation is updated.
          </span>
        </div>
      )}

      {/* Instructional Info Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3 text-xs text-slate-700">
        <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">
            Target Domain Menu Sequence Rule
          </p>
          <p className="text-slate-700 leading-relaxed font-normal">
            Select a target domain tab (<strong>Trekking</strong>, <strong>Tours</strong>, or <strong>Expeditions</strong>) to configure its dropdown menu sequence. Category ordering starts from #1 for each domain independently. Drag the handle <GripVertical className="w-3.5 h-3.5 inline text-slate-400" /> or use up/down arrows, then click <strong>Save Menu Order</strong>.
          </p>
        </div>
      </div>

      {/* Target Domain Navigation Tabs */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-bold text-slate-900 mr-2 uppercase tracking-wider text-[11px]">
          Target Domain:
        </span>
        {MARKETING_DOMAINS.map((tab) => {
          const isActive = selectedDomain === tab.value;
          const Icon = tab.icon;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedDomain(tab.value)}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-white/20 text-white">
                  {parentCategories.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Left = Parent Category Sequence for Selected Domain, Right = Selected Parent Subcategories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top-Level Menu Categories for Selected Domain (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-slate-700" />
                  <span className="capitalize">{selectedDomain} Categories ({parentCategories.length})</span>
                </h2>
                <p className="text-xs text-slate-700 font-normal">
                  Ordered display sequence in the {selectedDomain} dropdown menu
                </p>
              </div>
            </div>

            {parentCategories.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 font-medium border border-dashed border-slate-200 rounded-md">
                No active categories found under <span className="font-bold uppercase">"{selectedDomain}"</span>. Go to <Link href="/admin/categories" className="text-slate-900 underline font-semibold">All Categories</Link> to create categories for this domain.
              </div>
            ) : (
              <div className="space-y-2">
                {parentCategories.map((parent, fIdx) => {
                  const isExpanded = expandedParentId === parent.id;
                  const subCount = parent.subcategories?.length || 0;
                  const isDragging = draggedParentIndex === fIdx;
                  const isDragOver = dragOverParentIndex === fIdx;

                  return (
                    <div
                      key={parent.id}
                      draggable
                      onDragStart={(e) => handleParentDragStart(e, fIdx)}
                      onDragOver={(e) => handleParentDragOver(e, fIdx)}
                      onDrop={(e) => handleParentDrop(e, fIdx)}
                      onDragEnd={handleParentDragEnd}
                      onClick={() => setExpandedParentId(parent.id)}
                      className={`p-3 rounded-md border transition-colors duration-150 cursor-pointer select-none ${isDragging
                          ? "opacity-40 bg-slate-100 border-slate-300 shadow-inner"
                          : isDragOver
                            ? "border-amber-400 bg-amber-50/60 ring-1 ring-amber-400/50"
                            : isExpanded
                              ? "bg-amber-50/80 border-amber-400/90 ring-1 ring-amber-400/30 shadow-2xs"
                              : "bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${isExpanded ? "bg-amber-500 text-white shadow-2xs" : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                          >
                            {fIdx + 1}
                          </span>
                          <GripVertical
                            className={`w-4 h-4 shrink-0 cursor-grab active:cursor-grabbing ${isExpanded ? "text-amber-600/80" : "text-slate-400 hover:text-slate-600"
                              }`}
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-xs truncate flex items-center gap-2 text-slate-900">
                              <span>{parent.name}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors ${isExpanded ? "bg-amber-100 text-amber-900 border border-amber-300/70" : "bg-slate-100 text-slate-700 border border-slate-200"
                                  }`}
                              >
                                {subCount} {subCount === 1 ? "subcategory" : "subcategories"}
                              </span>
                              {!parent.showInMenu && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  Menu: OFF
                                </span>
                              )}
                            </div>
                            <div className={`text-[11px] font-normal truncate ${isExpanded ? "text-amber-800/80 font-medium" : "text-slate-600"}`}>
                              /{parent.slug}
                            </div>
                          </div>
                        </div>

                        {/* Reordering Controls */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => moveParent(fIdx, "up")}
                            disabled={fIdx === 0}
                            className="w-7 h-7 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-amber-100/60 hover:border-amber-300 disabled:opacity-30 transition-colors flex items-center justify-center"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveParent(fIdx, "down")}
                            disabled={fIdx === parentCategories.length - 1}
                            className="w-7 h-7 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-amber-100/60 hover:border-amber-300 disabled:opacity-30 transition-colors flex items-center justify-center"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Nested Subcategory Ordering for Selected Parent (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {(() => {
            const selectedParent = parentCategories.find((p) => p.id === expandedParentId);
            if (!selectedParent) {
              return (
                <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-xs text-slate-500 font-medium">
                  Select a parent category on the left to view and order its subcategories.
                </div>
              );
            }

            const subItems = selectedParent.subcategories || [];

            return (
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <GitMerge className="w-4 h-4 text-slate-700" />
                      <span>{selectedParent.name} Subcategories</span>
                    </h3>
                    <p className="text-xs text-slate-700 font-normal">
                      Nested subcategories shown in navbar dropdown menu ({subItems.length})
                    </p>
                  </div>
                  <Link
                    href={`/admin/categories?id=${selectedParent.id}`}
                    className="text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded border border-amber-200 transition-colors shrink-0"
                  >
                    Manage Category
                  </Link>
                </div>

                {subItems.length === 0 ? (
                  <div className="text-center py-8 px-4 text-xs text-slate-500 font-medium border border-dashed border-slate-200 rounded-md space-y-1.5">
                    <p className="font-bold text-slate-800">0 Subcategories Linked</p>
                    <p className="text-slate-600 font-normal leading-relaxed">
                      "{selectedParent.name}" is currently a standalone parent category without subcategories.
                    </p>
                    <p className="text-[11px] text-slate-500 font-normal pt-1">
                      To attach subcategories under this parent, edit subcategories in{" "}
                      <Link
                        href={`/admin/categories?id=${selectedParent.id}`}
                        className="text-slate-900 underline font-semibold hover:text-amber-800"
                      >
                        Category Management
                      </Link>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {subItems.map((sub, sIdx) => {
                      const isSubDragging = draggedSubIndex === sIdx;
                      const isSubDragOver = dragOverSubIndex === sIdx;

                      return (
                        <div
                          key={sub.id}
                          draggable
                          onDragStart={(e) => handleSubDragStart(e, sIdx)}
                          onDragOver={(e) => handleSubDragOver(e, sIdx)}
                          onDrop={(e) => handleSubDrop(e, selectedParent.id, sIdx)}
                          onDragEnd={handleSubDragEnd}
                          className={`p-3 rounded-md border flex items-center justify-between gap-3 text-xs transition-colors duration-150 select-none ${isSubDragging
                              ? "opacity-40 bg-slate-100 border-slate-300 shadow-inner"
                              : isSubDragOver
                                ? "border-amber-400 bg-amber-50/60 ring-1 ring-amber-400/50"
                                : "bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-amber-50/30"
                            }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {sIdx + 1}
                            </span>
                            <GripVertical
                              className="w-3.5 h-3.5 text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">{sub.name}</div>
                              <div className="text-[11px] text-slate-600 font-normal truncate">/{sub.slug}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveSubcategory(selectedParent.id, sIdx, "up")}
                              disabled={sIdx === 0}
                              className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-amber-100/60 hover:border-amber-300 disabled:opacity-30 transition-colors"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSubcategory(selectedParent.id, sIdx, "down")}
                              disabled={sIdx === subItems.length - 1}
                              className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-amber-100/60 hover:border-amber-300 disabled:opacity-30 transition-colors"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
