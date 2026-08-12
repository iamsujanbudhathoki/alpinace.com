"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Image as ImageIcon, Search, Info, Loader2 } from "lucide-react";
import { PackageItem, CategoryType } from "@/lib/admin-data";
import { CategoryService } from "@/lib/services/admin-service";
import { tourSchema, TourFormValues } from "@/lib/admin-schemas";
import { AdminInputField, AdminSelectField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface TourFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tour: PackageItem) => Promise<boolean | void> | boolean | void;
  initialData?: PackageItem | null;
  isEditing?: boolean;
}

export function TourFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: TourFormModalProps) {
  const [editingMode, setEditingMode] = useState(isEditing);
  const [activeTab, setActiveTab] = useState<"general" | "media" | "seo">("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<TourFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tourSchema) as any,
    defaultValues: {
      title: "",
      region: "Kathmandu & Pokhara",
      durationDays: 7,
      maxAltitudeMeters: 1400,
      priceUSD: 1250,
      status: "Active",
      startEndLocation: "Kathmandu to Pokhara",
      accommodation: "5-Star Luxury Resort & Heritage Hotel",
      meals: "All Breakfasts & Welcome/Farewell Dinners Included",
      groupSizeRange: "2 - 10 Guests",
      permitsText: "Monuments Entrance Fees, Tourist Bus Charter",
      inclusionsText: "Private Air-Conditioned Transport, UNESCO Heritage Entry Fees, Luxury Hotel Stay",
      exclusionsText: "International Flights, Personal Purchases, Alcoholic Beverages",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      metaTitle: "",
      metaDescription: "",
      keywords: "Kathmandu Tour, Nepal Sightseeing, Luxury Heli Tour",
    },
  });

  const watchTitle = watch("title");
  const watchMetaDesc = watch("metaDescription");

  const [tourCategories, setTourCategories] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      CategoryService.getByType(CategoryType.TOURS).then((cats) => {
        if (cats && cats.length > 0) {
          setTourCategories(cats.map((c) => ({ label: c.name, value: c.id })));
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
        region: (initialData.region as TourFormValues["region"]) || "Kathmandu & Pokhara",
        durationDays: initialData.durationDays,
        maxAltitudeMeters: initialData.maxAltitudeMeters || 1400,
        priceUSD: initialData.priceUSD,
        status: initialData.status,
        startEndLocation: "Kathmandu to Pokhara",
        accommodation: "5-Star Luxury Resort & Heritage Hotel",
        meals: "All Breakfasts & Welcome/Farewell Dinners",
        groupSizeRange: "2 - 10 Guests",
        permitsText: initialData.permitsRequired ? initialData.permitsRequired.join(", ") : "",
        inclusionsText: "Private Luxury Transport, UNESCO Monuments Permits, 5-Star Hotel Accommodations",
        exclusionsText: "International Flights, Travel Insurance, Personal Shopping Expenses",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
        metaTitle: `${initialData.title} - Alpine Ace Tours`,
        metaDescription: `Discover ${initialData.title} with luxury transportation and expert local guides.`,
        keywords: "Nepal Tour, Cultural Heritage, Pokhara Resort",
      });
    } else {
      reset({
        title: "",
        categoryId: tourCategories[0]?.value || "",
        region: "Kathmandu & Pokhara",
        durationDays: 7,
        maxAltitudeMeters: 1400,
        priceUSD: 1250,
        status: "Active",
        startEndLocation: "Kathmandu to Pokhara",
        accommodation: "5-Star Luxury Resort & Heritage Hotel",
        meals: "All Breakfasts & Welcome/Farewell Dinners Included",
        groupSizeRange: "2 - 10 Guests",
        permitsText: "Monuments Entrance Fees, Tourist Bus Charter",
        inclusionsText: "Private Air-Conditioned Transport, UNESCO Heritage Entry Fees, Luxury Hotel Stay",
        exclusionsText: "International Flights, Personal Purchases, Alcoholic Beverages",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
        metaTitle: "",
        metaDescription: "",
        keywords: "Nepal Tour, Cultural Heritage, Pokhara Resort",
      });
    }
    setEditingMode(isEditing || !initialData);
    setActiveTab("general");
  }, [initialData, isEditing, isOpen, reset, tourCategories]);

  const onSubmit = async (values: TourFormValues) => {
    setIsSubmitting(true);
    try {
      const permitsArray = values.permitsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const tourToSave: PackageItem = {
        id: initialData?.id || "",
        title: values.title,
        slug: initialData?.slug || "",
        category: initialData?.category || "Tour",
        categoryId: values.categoryId,
        region: values.region,
        durationDays: Number(values.durationDays),
        maxAltitudeMeters: Number(values.maxAltitudeMeters) || 1400,
        difficulty: "Easy",
        priceUSD: Number(values.priceUSD),
        status: values.status,
        totalBookings: initialData?.totalBookings || 0,
        rating: initialData?.rating || 5.0,
        permitsRequired: permitsArray.length > 0 ? permitsArray : ["Monuments Entrance Fees"],
      };

      const success = await onSave(tourToSave);
      if (success !== false) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = !initialData
    ? "Add New Tour Package"
    : editingMode
    ? `Edit: ${initialData.title}`
    : initialData.title;

  const modalDescription = !initialData
    ? "Configure tour specifications, inclusions, media assets, and SEO metadata."
    : editingMode
    ? "Modify tour attributes, cover image, and metadata."
    : "Tour package details and inclusions.";

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
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="text-xs font-semibold cursor-pointer">Cancel</Button>
        <Button 
          type="submit" 
          form="tour-form" 
          disabled={isSubmitting}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </span>
          ) : (
            "Save Tour"
          )}
        </Button>
      </div>
    </div>
  );

  const viewFooter = (
    <div className="flex justify-end">
      <Button onClick={() => setEditingMode(true)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors">
        <Edit className="w-3.5 h-3.5 mr-1 text-amber-400" />
        Edit Tour
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

          <form id="tour-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <AdminInputField
                    label="Tour Title"
                    required
                    placeholder="e.g. Kathmandu Valley Heritage & Pokhara Resort Tour"
                    error={errors.title?.message}
                    {...register("title")}
                  />
                </div>

                <div className="sm:col-span-1">
                  <AdminSelectField
                    label="Category"
                    required
                    error={errors.categoryId?.message}
                    options={tourCategories}
                    {...register("categoryId")}
                  />
                </div>

                <div className="sm:col-span-1">
                  <AdminSelectField
                    label="Destination Region"
                    required
                    error={errors.region?.message}
                    options={[
                      { label: "Kathmandu & Pokhara", value: "Kathmandu & Pokhara" },
                      { label: "Everest Helicopter", value: "Everest" },
                      { label: "Annapurna Valley", value: "Annapurna" },
                    ]}
                    {...register("region")}
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
                    label="Max Elevation Altitude (Meters)"
                    type="number"
                    required
                    placeholder="1400"
                    error={errors.maxAltitudeMeters?.message}
                    {...register("maxAltitudeMeters")}
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
                    placeholder="Kathmandu to Pokhara"
                    {...register("startEndLocation")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Accommodation Type"
                    placeholder="5-Star Resort & Heritage Hotel"
                    {...register("accommodation")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Meals Plan"
                    placeholder="All Breakfasts Included"
                    {...register("meals")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminInputField
                    label="Inclusions & Permits (Comma Separated)"
                    required
                    placeholder="e.g. Heritage Entrance Fees, Private Transport"
                    error={errors.permitsText?.message}
                    {...register("permitsText")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminTextareaField
                    label="What's Included (Comma Separated)"
                    rows={2}
                    placeholder="Private Air-Conditioned Transport, UNESCO Entry Fees, 5-Star Stay"
                    {...register("inclusionsText")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminTextareaField
                    label="What's Excluded (Comma Separated)"
                    rows={2}
                    placeholder="International Flights, Personal Purchases, Alcoholic Beverages"
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
                      label="Main Tour Cover Image"
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
                      https://alpineace.com/tours/{watchTitle ? watchTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "tour-slug"}
                    </div>
                    <div className="text-sm font-extrabold text-blue-700 truncate hover:underline cursor-pointer">
                      {watchTitle ? `${watchTitle} | Alpine Ace Sightseeing` : "Tour Package Title Preview"}
                    </div>
                    <div className="text-xs text-slate-800 font-semibold line-clamp-2 leading-relaxed">
                      {watchMetaDesc || "Configure meta description below to preview how search engine crawlers index this sightseeing tour."}
                    </div>
                  </div>
                </div>

                <AdminInputField
                  label="Meta Search Title Tag"
                  placeholder="e.g. Kathmandu Heritage & Pokhara Luxury Heli Tour | Alpine Ace"
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
                  placeholder="e.g. Kathmandu Sightseeing, Everest Helicopter Tour, Pokhara Luxury"
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
              <span className="text-slate-950 font-bold block">Destination:</span>
              <span className="text-slate-950 font-black">{initialData?.region}</span>
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
            <span className="font-extrabold text-slate-950 block">Included Services:</span>
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

interface DeleteTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tourTitle?: string;
}

export function DeleteTourModal({ isOpen, onClose, onConfirm, tourTitle }: DeleteTourModalProps) {
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Deletion"
      description={`Are you sure you want to delete "${tourTitle}"?`}
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="text-xs font-semibold cursor-pointer">Cancel</Button>
          <Button onClick={() => { onConfirm(); onClose(); }} className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer">Delete Tour</Button>
        </div>
      }
    >
      <div className="text-sm text-slate-700 py-2">This action cannot be undone.</div>
    </AdminModal>
  );
}
