"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Image as ImageIcon, Search, Info } from "lucide-react";
import { TrekItem } from "@/lib/trek-data";
import { CategoryService } from "@/lib/services/admin-service";
import { trekSchema, TrekFormValues } from "@/lib/admin-schemas";
import { AdminInputField, AdminSelectField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface TrekFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trek: TrekItem) => void;
  initialData?: TrekItem | null;
  isEditing?: boolean;
}

export function TrekFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: TrekFormModalProps) {
  const [editingMode, setEditingMode] = useState(isEditing);
  const [activeTab, setActiveTab] = useState<"general" | "media" | "seo">("general");

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<TrekFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(trekSchema) as any,
    defaultValues: {
      title: "",
      region: "Everest",
      durationDays: 12,
      maxAltitudeMeters: 5364,
      difficulty: "Challenging Trek",
      priceUSD: 1800,
      bestSeason: "March - May & Sept - Nov",
      status: "Active",
      startEndLocation: "Kathmandu to Kathmandu",
      accommodation: "Luxury Lodges & Heritage Hotel",
      meals: "All Meals Included (Breakfast, Lunch, Dinner)",
      groupSizeRange: "2 - 12 Travelers",
      permitsText: "Sagarmatha NP Permit, TIMS Card",
      inclusionsText: "IFMGA Sherpa Guide, Luxury Lodges, Domestic Flights, All Permits",
      exclusionsText: "International Airfare, Travel Insurance, Personal Alcoholic Beverages",
      shortDesc: "Experience bespoke Himalayan trekking led by certified Sherpa guides.",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      metaTitle: "",
      metaDescription: "",
      keywords: "Everest Trekking, Nepal Trek, Sherpa Guides",
    },
  });

  const watchTitle = watch("title");
  const watchMetaDesc = watch("metaDescription");

  const [trekCategories, setTrekCategories] = useState<{ label: string; value: string }[]>([
    { label: "Everest & Khumbu Region", value: "Everest & Khumbu Region" },
    { label: "Annapurna Sanctuary", value: "Annapurna Sanctuary" },
    { label: "Langtang Alpine Valley", value: "Langtang Alpine Valley" },
    { label: "Manaslu Wilderness Circuit", value: "Manaslu Wilderness Circuit" },
    { label: "Mustang & Remote Dolpo", value: "Mustang & Remote Dolpo" },
  ]);

  useEffect(() => {
    if (isOpen) {
      CategoryService.getByType("Trekking").then((cats) => {
        if (cats && cats.length > 0) {
          setTrekCategories(cats.map((c) => ({ label: c.name, value: c.name })));
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        category: initialData.category || "Everest & Khumbu Region",
        region: initialData.region,
        durationDays: initialData.durationDays,
        maxAltitudeMeters: 5364,
        difficulty: initialData.difficulty,
        priceUSD: initialData.priceUSD,
        bestSeason: initialData.bestSeason,
        status: initialData.status,
        startEndLocation: "Kathmandu to Kathmandu",
        accommodation: "Luxury Lodges & Boutique Hotel",
        meals: "All Meals Included (Breakfast, Lunch, Dinner)",
        groupSizeRange: "2 - 12 Travelers",
        permitsText: initialData.permitsRequired ? initialData.permitsRequired.join(", ") : "",
        inclusionsText: "Private Helicopter Charter, IFMGA Sherpa Guide, Luxury Teahouse Lodging, Permits",
        exclusionsText: "International Flights, Personal Travel Insurance, Tips & Gratuities",
        shortDesc: initialData.shortDesc,
        image: initialData.image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
        metaTitle: `${initialData.title} - Alpine Ace Nepal`,
        metaDescription: initialData.shortDesc,
        keywords: `${initialData.region} Trekking, Luxury Nepal Trek, Sherpa Expedition`,
      });
    } else {
      reset({
        title: "",
        category: "Everest & Khumbu Region",
        region: "Everest",
        durationDays: 12,
        maxAltitudeMeters: 5364,
        difficulty: "Challenging Trek",
        priceUSD: 1800,
        bestSeason: "March - May & Sept - Nov",
        status: "Active",
        startEndLocation: "Kathmandu to Kathmandu",
        accommodation: "Luxury Lodges & Heritage Hotel",
        meals: "All Meals Included (Breakfast, Lunch, Dinner)",
        groupSizeRange: "2 - 12 Travelers",
        permitsText: "Sagarmatha NP Permit, TIMS Card",
        inclusionsText: "IFMGA Sherpa Guide, Luxury Lodges, Domestic Flights, All Permits",
        exclusionsText: "International Airfare, Travel Insurance, Personal Alcoholic Beverages",
        shortDesc: "Experience bespoke Himalayan trekking led by certified Sherpa guides.",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
        metaTitle: "",
        metaDescription: "",
        keywords: "Everest Trekking, Nepal Trek, Sherpa Guides",
      });
    }
    setEditingMode(isEditing || !initialData);
    setActiveTab("general");
  }, [initialData, isEditing, isOpen, reset]);

  const onSubmit = (values: TrekFormValues) => {
    const permitsArray = values.permitsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const trekToSave: TrekItem = {
      id: initialData?.id || `trk-${Date.now()}`,
      title: values.title,
      slug: initialData?.slug || values.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: values.category || "Everest & Khumbu Region",
      region: values.region,
      durationDays: Number(values.durationDays),
      difficulty: values.difficulty,
      bestSeason: values.bestSeason,
      priceUSD: Number(values.priceUSD),
      status: values.status,
      rating: initialData?.rating || 4.9,
      reviewsCount: initialData?.reviewsCount || 1,
      image: values.image,
      shortDesc: values.shortDesc,
      permitsRequired: permitsArray.length > 0 ? permitsArray : ["TIMS Card"],
    };

    onSave(trekToSave);
    onClose();
  };

  const modalTitle = !initialData
    ? "Add New Trek Itinerary"
    : editingMode
    ? `Edit: ${initialData.title}`
    : initialData.title;

  const modalDescription = !initialData
    ? "Configure trek specifications, inclusions, media assets, and SEO metadata."
    : editingMode
    ? "Update trek configuration, cover image, and metadata."
    : "Detailed trek specs and permit requirements.";

  const editFooter = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {activeTab !== "general" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveTab(activeTab === "seo" ? "media" : "general")}
            className="text-xs font-semibold cursor-pointer"
          >
            Back
          </Button>
        )}
        {activeTab !== "seo" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveTab(activeTab === "general" ? "media" : "seo")}
            className="text-xs font-semibold cursor-pointer text-slate-800"
          >
            Next Tab
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={onClose} className="text-xs font-semibold cursor-pointer">
          Cancel
        </Button>
        <Button type="submit" form="trek-form" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors">
          Save Trek
        </Button>
      </div>
    </div>
  );

  const viewFooter = (
    <div className="flex justify-end">
      <Button
        onClick={() => setEditingMode(true)}
        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
      >
        <Edit className="w-3.5 h-3.5 mr-1 text-amber-400" />
        Edit Trek
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      description={modalDescription}
      maxWidth="2xl"
      footer={editingMode ? editFooter : viewFooter}
    >
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

          <form id="trek-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <AdminInputField
                    label="Trek Title"
                    required
                    placeholder="e.g. Annapurna Sanctuary Luxury Lodge"
                    error={errors.title?.message}
                    {...register("title")}
                  />
                </div>

                <div className="sm:col-span-1">
                  <AdminSelectField
                    label="Category"
                    required
                    error={errors.category?.message}
                    options={trekCategories}
                    {...register("category")}
                  />
                </div>

                <div className="sm:col-span-1">
                  <AdminSelectField
                    label="Region"
                    required
                    error={errors.region?.message}
                    options={[
                      { label: "Everest", value: "Everest" },
                      { label: "Annapurna", value: "Annapurna" },
                      { label: "Langtang", value: "Langtang" },
                      { label: "Manaslu", value: "Manaslu" },
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
                    placeholder="5364"
                    error={errors.maxAltitudeMeters?.message}
                    {...register("maxAltitudeMeters")}
                  />
                </div>

                <div>
                  <AdminSelectField
                    label="Difficulty Level"
                    required
                    error={errors.difficulty?.message}
                    options={[
                      { label: "Moderate Trek", value: "Moderate Trek" },
                      { label: "Challenging Trek", value: "Challenging Trek" },
                      { label: "Strenuous Trek", value: "Strenuous Trek" },
                    ]}
                    {...register("difficulty")}
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
                    placeholder="Kathmandu to Kathmandu"
                    {...register("startEndLocation")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Accommodation Type"
                    placeholder="Luxury Lodges & Heritage Hotel"
                    {...register("accommodation")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Meals Plan"
                    placeholder="All Meals Included (BLD)"
                    {...register("meals")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminInputField
                    label="Best Season"
                    required
                    placeholder="March - May & Sept - Nov"
                    error={errors.bestSeason?.message}
                    {...register("bestSeason")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminInputField
                    label="Required Permits (Comma Separated)"
                    required
                    placeholder="e.g. Sagarmatha NP Permit, TIMS Card"
                    error={errors.permitsText?.message}
                    {...register("permitsText")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminTextareaField
                    label="What's Included (Comma Separated)"
                    rows={2}
                    placeholder="IFMGA Sherpa Guide, Luxury Lodges, Domestic Flights, Permits"
                    {...register("inclusionsText")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminTextareaField
                    label="What's Excluded (Comma Separated)"
                    rows={2}
                    placeholder="International Flights, Travel Insurance, Tips & Gratuities"
                    {...register("exclusionsText")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminTextareaField
                    label="Short Overview Description"
                    required
                    rows={3}
                    placeholder="Summary of the trekking experience..."
                    error={errors.shortDesc?.message}
                    {...register("shortDesc")}
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
                      label="Main Trek Cover Image"
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
                  <span className="font-extrabold text-slate-950 text-xs block">Search Preview</span>
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1">
                    <div className="text-xs font-bold text-emerald-800 truncate">
                      https://alpineace.com/trekking/{watchTitle ? watchTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "trek-slug"}
                    </div>
                    <div className="text-sm font-extrabold text-blue-700 truncate hover:underline cursor-pointer">
                      {watchTitle ? `${watchTitle} | Alpine Ace Luxury Trekking` : "Trek Package Title Preview"}
                    </div>
                    <div className="text-xs text-slate-800 font-semibold line-clamp-2 leading-relaxed">
                      {watchMetaDesc || "Brief summary for search engines..."}
                    </div>
                  </div>
                </div>

                <AdminInputField
                  label="Meta Search Title Tag"
                  placeholder="e.g. Everest Base Camp Luxury Helicopter Trek | Alpine Ace"
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
                  placeholder="e.g. Everest Base Camp, Nepal Trekking, Sherpa Guides"
                  {...register("keywords")}
                />
              </div>
            )}

          </form>
        </div>
      ) : (
        <div className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-3 gap-4">
            <div className="aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden col-span-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={initialData?.image} alt={initialData?.title} className="w-full h-full object-cover" />
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-950 font-bold block">Region:</span>
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

          <div className="space-y-1">
            <span className="font-extrabold text-slate-950 block">Short Description:</span>
            <p className="text-slate-950 leading-relaxed font-semibold bg-stone-50 p-3 rounded-lg border border-slate-200">
              {initialData?.shortDesc}
            </p>
          </div>

        </div>
      )}
    </AdminModal>
  );
}

interface DeleteTrekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  trekTitle?: string;
}

export function DeleteTrekModal({ isOpen, onClose, onConfirm, trekTitle }: DeleteTrekModalProps) {
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Deletion"
      description={`Are you sure you want to delete "${trekTitle}"? This action cannot be undone.`}
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="text-xs font-semibold cursor-pointer">Cancel</Button>
          <Button onClick={() => { onConfirm(); onClose(); }} className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer">Delete Trek</Button>
        </div>
      }
    >
      <div className="text-sm text-slate-700 py-2">This action cannot be undone.</div>
    </AdminModal>
  );
}
