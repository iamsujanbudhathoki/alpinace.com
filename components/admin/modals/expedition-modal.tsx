"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Image as ImageIcon, Search, Info } from "lucide-react";
import { PackageItem } from "@/lib/admin-data";
import { CategoryService } from "@/lib/services/admin-service";
import { expeditionSchema, ExpeditionFormValues } from "@/lib/admin-schemas";
import { AdminInputField, AdminSelectField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface ExpeditionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expedition: PackageItem) => void;
  initialData?: PackageItem | null;
  isEditing?: boolean;
}

export function ExpeditionFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: ExpeditionFormModalProps) {
  const [editingMode, setEditingMode] = useState(isEditing);
  const [activeTab, setActiveTab] = useState<"general" | "media" | "seo">("general");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<ExpeditionFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(expeditionSchema) as any,
    defaultValues: {
      title: "",
      region: "Everest",
      maxAltitudeMeters: 7129,
      durationDays: 30,
      priceUSD: 11500,
      status: "Active",
      startEndLocation: "Kathmandu to Base Camp",
      accommodation: "High Altitude Tents & Luxury Basecamp",
      meals: "Full Basecamp & High Altitude Expedition Meals",
      groupSizeRange: "1 to 8 Climbers",
      permitsText: "NMA Climbing Permit, Sagarmatha NP Permit, Garbage Deposit",
      inclusionsText: "IFMGA Sherpa Ratio 1:1, Oxygen Bottles & Masks, Basecamp Heated Tents, Climbing Permits",
      exclusionsText: "Personal Summit Bonus, International Flights, Personal Summit Down Suit",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      metaTitle: "",
      metaDescription: "",
      keywords: "Peak Expedition Nepal, 7000m Climbing, Sherpa Mountain Guides",
    },
  });

  const watchTitle = watch("title");
  const watchMetaDesc = watch("metaDescription");

  const [expeditionCategories, setExpeditionCategories] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      CategoryService.getByType("Expeditions").then((cats) => {
        if (cats && cats.length > 0) {
          setExpeditionCategories(cats.map((c) => ({ label: c.name, value: c.id })));
          if (!initialData) setValue("categoryId", cats[0].id);
        }
      });
    }
  }, [isOpen, initialData, setValue]);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        categoryId: initialData.categoryId || "",
        region: (initialData.region as ExpeditionFormValues["region"]) || "Everest",
        maxAltitudeMeters: initialData.maxAltitudeMeters,
        durationDays: initialData.durationDays,
        priceUSD: initialData.priceUSD,
        status: initialData.status,
        startEndLocation: "Kathmandu to Base Camp",
        accommodation: "High Altitude Tents & Basecamp Luxury",
        meals: "Full Expedition Basecamp Meals",
        groupSizeRange: "1 to 8 Climbers",
        permitsText: initialData.permitsRequired ? initialData.permitsRequired.join(", ") : "",
        inclusionsText: "1:1 Sherpa Summit Ratio, Supplemental Oxygen, High Altitude Tents, All Permits",
        exclusionsText: "Summit Bonus ($1,500), Personal Down Suit & Boots, International Flights",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
        metaTitle: `${initialData.title} - Alpine Ace Peak Expeditions`,
        metaDescription: `Join expert Sherpa guides for high-altitude technical climbing on ${initialData.title}.`,
        keywords: "Mountain Climbing Nepal, Technical Peak Expedition, High Altitude Summit",
      });
    } else {
      reset({
        title: "",
        categoryId: expeditionCategories[0]?.value || "",
        region: "Everest",
        maxAltitudeMeters: 7129,
        durationDays: 30,
        priceUSD: 11500,
        status: "Active",
        startEndLocation: "Kathmandu to Base Camp",
        accommodation: "High Altitude Tents & Luxury Basecamp",
        meals: "Full Basecamp & High Altitude Expedition Meals",
        groupSizeRange: "1 to 8 Climbers",
        permitsText: "NMA Climbing Permit, Sagarmatha NP Permit, Garbage Deposit",
        inclusionsText: "IFMGA Sherpa Ratio 1:1, Oxygen Bottles & Masks, Basecamp Heated Tents, Climbing Permits",
        exclusionsText: "Personal Summit Bonus, International Flights, Personal Summit Down Suit",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
        metaTitle: "",
        metaDescription: "",
        keywords: "Peak Expedition Nepal, 7000m Climbing, Sherpa Mountain Guides",
      });
    }
    setEditingMode(isEditing || !initialData);
    setActiveTab("general");
  }, [initialData, isEditing, isOpen, reset, expeditionCategories]);

  const onSubmit = (values: ExpeditionFormValues) => {
    const permitsArray = values.permitsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const expToSave: PackageItem = {
      id: initialData?.id || `pkg-exp-${Date.now()}`,
      title: values.title,
      slug: initialData?.slug || values.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: initialData?.category || "Expedition",
      categoryId: values.categoryId,
      region: values.region,
      durationDays: Number(values.durationDays),
      maxAltitudeMeters: Number(values.maxAltitudeMeters),
      difficulty: "Extreme (8000m+)",
      priceUSD: Number(values.priceUSD),
      status: values.status,
      totalBookings: initialData?.totalBookings || 0,
      rating: initialData?.rating || 5.0,
      permitsRequired: permitsArray.length > 0 ? permitsArray : ["NMA Climbing Permit"],
    };

    onSave(expToSave);
    onClose();
  };

  const modalTitle = !initialData
    ? "Add Peak Expedition"
    : editingMode
    ? `Edit: ${initialData.title}`
    : initialData.title;

  const modalDescription = !initialData
    ? "Configure peak climbing specs, inclusions, media assets, and SEO metadata."
    : editingMode
    ? "Modify peak elevation, cover image, and SEO parameters."
    : "Technical expedition specs and permits.";

  const editFooter = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {activeTab !== "general" && (
          <Button type="button" variant="outline" onClick={() => setActiveTab(activeTab === "seo" ? "media" : "general")} className="text-xs font-semibold cursor-pointer">Back</Button>
        )}
        {activeTab !== "seo" && (
          <Button type="button" variant="outline" onClick={() => setActiveTab(activeTab === "general" ? "media" : "seo")} className="text-xs font-semibold cursor-pointer text-slate-800">Next Tab</Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={onClose} className="text-xs font-semibold cursor-pointer">Cancel</Button>
        <Button type="submit" form="expedition-form" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors">Save Expedition</Button>
      </div>
    </div>
  );

  const viewFooter = (
    <div className="flex justify-end">
      <Button onClick={() => setEditingMode(true)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors">
        <Edit className="w-3.5 h-3.5 mr-1 text-amber-400" />
        Edit Expedition
      </Button>
    </div>
  );

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={modalTitle} description={modalDescription} maxWidth="2xl" footer={editingMode ? editFooter : viewFooter}>
      {editingMode ? (
        <div className="space-y-4 py-1 text-xs">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "general"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              General Details &amp; Specs
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "media"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
              Media &amp; Cover Image
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "seo"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Search className="w-3.5 h-3.5 text-emerald-500" />
              SEO &amp; Search Metadata
            </button>
          </div>

          <form id="expedition-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <AdminInputField
                    label="Expedition Peak Title"
                    required
                    placeholder="e.g. Pumori (7,161m) Technical Expedition"
                    error={errors.title?.message}
                    {...register("title")}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <AdminSelectField
                    label="Category"
                    required
                    error={errors.categoryId?.message}
                    options={expeditionCategories}
                    {...register("categoryId")}
                  />
                </div>

                <div>
                  <AdminSelectField
                    label="Region"
                    required
                    error={errors.region?.message}
                    options={[
                      { label: "Everest Region", value: "Everest" },
                      { label: "Annapurna Region", value: "Annapurna" },
                      { label: "Manaslu Region", value: "Manaslu" },
                    ]}
                    {...register("region")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Summit Elevation (Meters)"
                    type="number"
                    required
                    error={errors.maxAltitudeMeters?.message}
                    {...register("maxAltitudeMeters")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Duration (Days)"
                    type="number"
                    required
                    error={errors.durationDays?.message}
                    {...register("durationDays")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Price (USD)"
                    type="number"
                    required
                    error={errors.priceUSD?.message}
                    {...register("priceUSD")}
                  />
                </div>

                <div>
                  <AdminSelectField
                    label="Status"
                    required
                    error={errors.status?.message}
                    options={[
                      { label: "Active", value: "Active" },
                      { label: "Featured", value: "Featured" },
                      { label: "Draft", value: "Draft" },
                    ]}
                    {...register("status")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Start & End Route Location"
                    placeholder="Kathmandu to Base Camp"
                    {...register("startEndLocation")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Accommodation Type"
                    placeholder="High Altitude Tents & Luxury Basecamp"
                    {...register("accommodation")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Meals Plan"
                    placeholder="Full Expedition Meals Included"
                    {...register("meals")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminInputField
                    label="Permits Required (Comma Separated)"
                    required
                    placeholder="e.g. NMA Climbing Permit, Garbage Deposit"
                    error={errors.permitsText?.message}
                    {...register("permitsText")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminTextareaField
                    label="What's Included (Comma Separated)"
                    rows={2}
                    placeholder="IFMGA Sherpa Ratio 1:1, Oxygen Bottles, Heated Basecamp Tents"
                    {...register("inclusionsText")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminTextareaField
                    label="What's Excluded (Comma Separated)"
                    rows={2}
                    placeholder="Personal Summit Bonus, International Flights, Down Suit"
                    {...register("exclusionsText")}
                  />
                </div>
              </div>
            )}

            {/* MEDIA TAB */}
            {activeTab === "media" && (
              <div className="space-y-4">
                <Controller
                  name="image"
                  control={control}
                  render={({ field }) => (
                    <AdminImageUpload
                      label="Main Peak Expedition Cover Image"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.image?.message}
                    />
                  )}
                />
              </div>
            )}

            {/* SEO TAB */}
            {activeTab === "seo" && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="font-extrabold text-slate-950 text-xs block">Google Search Preview Snippet</span>
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1">
                    <div className="text-xs font-bold text-emerald-800 truncate">
                      https://alpineace.com/expeditions/{watchTitle ? watchTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "peak-slug"}
                    </div>
                    <div className="text-sm font-extrabold text-blue-700 truncate hover:underline cursor-pointer">
                      {watchTitle ? `${watchTitle} | Alpine Ace Expeditions` : "Expedition Peak Title Preview"}
                    </div>
                    <div className="text-xs text-slate-800 font-semibold line-clamp-2 leading-relaxed">
                      {watchMetaDesc || "Configure meta description below to preview how search engine crawlers index this peak climbing expedition."}
                    </div>
                  </div>
                </div>

                <AdminInputField
                  label="Meta Search Title Tag"
                  placeholder="e.g. Ama Dablam 6812m Climbing Expedition | Alpine Ace"
                  {...register("metaTitle")}
                />

                <AdminTextareaField
                  label="Meta Search Description Snippet"
                  rows={3}
                  placeholder="Compelling 150-character summary for Google SERP display..."
                  {...register("metaDescription")}
                />

                <AdminInputField
                  label="Focus SEO Keywords (Comma Separated)"
                  placeholder="e.g. Ama Dablam Expedition, Himalayan Peak Climbing, Sherpa Guides"
                  {...register("keywords")}
                />
              </div>
            )}

          </form>
        </div>
      ) : (
        <div className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-950 font-bold block">Summit Elevation:</span>
              <span className="text-slate-950 font-black">{initialData?.maxAltitudeMeters.toLocaleString()}m</span>
            </div>
            <div>
              <span className="text-slate-950 font-bold block">Duration:</span>
              <span className="text-slate-950 font-black">{initialData?.durationDays} Days</span>
            </div>
            <div>
              <span className="text-slate-950 font-bold block">Price:</span>
              <span className="text-slate-950 font-black">${initialData?.priceUSD.toLocaleString()} USD</span>
            </div>
            <div>
              <span className="text-slate-950 font-bold block">Status:</span>
              <AdminStatusBadge status={initialData?.status || "Active"} />
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-extrabold text-slate-950 block">Required Permits:</span>
            <div className="flex flex-wrap gap-1.5">
              {initialData?.permitsRequired.map((p, i) => (
                <span key={i} className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-950 font-bold">
                  {p}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}
    </AdminModal>
  );
}

interface DeleteExpeditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  expeditionTitle?: string;
}

export function DeleteExpeditionModal({ isOpen, onClose, onConfirm, expeditionTitle }: DeleteExpeditionModalProps) {
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Deletion"
      description={`Are you sure you want to delete "${expeditionTitle}"?`}
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="text-xs font-semibold cursor-pointer">Cancel</Button>
          <Button onClick={() => { onConfirm(); onClose(); }} className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer">Delete Peak Expedition</Button>
        </div>
      }
    >
      <div className="text-sm text-slate-700 py-2">This action cannot be undone.</div>
    </AdminModal>
  );
}
