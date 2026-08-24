"use client";

import {
  AdminInputField,
  AdminSelectField,
  AdminTextareaField,
} from "@/components/admin/forms/admin-form-fields";
import { AdminSearchableSelect } from "@/components/admin/forms/admin-searchable-select";
import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload";
import {
  TripFaqItem,
  TripFaqsManager,
  TripReviewItem,
  TripReviewsManager,
} from "@/components/admin/forms/trip-faqs-reviews-fields";
import { TripItineraryManager } from "@/components/admin/forms/trip-itinerary-manager";
import { TripDepartureDatesManager } from "@/components/admin/forms/trip-departure-dates-manager";
import { TripGalleryManager } from "@/components/admin/forms/trip-gallery-manager";
import { TripMapManager } from "@/components/admin/forms/trip-map-manager";
import { TripFilesManager } from "@/components/admin/forms/trip-files-manager";
import { AppRichTextEditor } from "@/components/admin/rich-text/rich-text-editor";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import {
  CategoryType,
  ClimbingGrade,
  PackageItem,
  PackageStatus,
  TripDifficulty,
  TripActivity,
  PACKAGE_COUNTRIES,
} from "@/lib/admin-data";
import { ExpeditionFormValues, expeditionSchema } from "@/lib/admin-schemas";
import { CategoryService, MediaService } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";
import { websiteDomain } from "@/lib/env.constants";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Edit,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Loader2,
  MapPin,
  Maximize2,
  MessageSquareQuote,
  Mountain,
  Search,
  Star,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface ExpeditionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expedition: PackageItem) => Promise<boolean | void> | boolean | void;
  initialData?: PackageItem | null;
  isEditing?: boolean;
}

type TabType =
  | "general"
  | "itinerary"
  | "inclusions"
  | "departures"
  | "media"
  | "files"
  | "faqs"
  | "seo";

export function ExpeditionFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: ExpeditionFormModalProps) {
  const [editingMode, setEditingMode] = useState(isEditing);
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    watch,
    formState: { errors },
  } = useForm<ExpeditionFormValues, any, ExpeditionFormValues>({
    resolver: zodResolver(expeditionSchema) as any,
    defaultValues: {
      title: "",
      categoryId: "",
      region: "",
      country: "",
      activity: "",
      peakHeightM: 8848,
      maxAltitudeMeters: 8848,
      climbingGrade: ClimbingGrade.EXTREME_TECHNICAL_GRADE,
      sherpaGuideRatio: "1:1 Sherpa Guide Ratio",
      oxygenRequired: true,
      difficulty: TripDifficulty.EXTREME,
      bestSeason: "",
      durationDays: 0,
      priceUSD: 0,
      status: PackageStatus.ACTIVE,
      startEndLocation: "",
      accommodation: "",
      meals: "",
      groupSizeRange: "",
      permitsText: "",
      inclusionsText: "",
      exclusionsText: "",
      shortDesc: "",
      addonsText: "",
      usefulInfoText: "",
      departureDates: [],
      galleryImages: [],
      mapImage: "",
      packageFiles: [],
      image: "",
      metaTitle: "",
      metaDescription: "",
      keywords: "",
      itinerary: [],
      faqs: [],
      reviews: [],
    },
  });

  const watchTitle = watch("title");
  const watchMetaTitle = watch("metaTitle");
  const watchMetaDesc = watch("metaDescription");
  const watchKeywords = watch("keywords");
  const watchDuration = watch("durationDays");
  const watchShortDesc = watch("shortDesc");
  const watchItinerary = watch("itinerary") || [];
  const watchDepartureDates = watch("departureDates") || [];
  const watchGalleryImages = watch("galleryImages") || [];
  const watchPackageFiles = watch("packageFiles") || [];
  const watchFaqs = watch("faqs") || [];
  const watchReviews = watch("reviews") || [];

  const [expeditionCategories, setExpeditionCategories] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      CategoryService.getByType(CategoryType.EXPEDITIONS).then((cats) => {
        if (cats && cats.length > 0) {
          const opts = cats.map((c) => ({ label: c.name, value: c.id }));
          setExpeditionCategories(opts);
          if (!initialData && !getValues("categoryId")) {
            setValue("categoryId", cats[0].id);
          }
        } else {
          setExpeditionCategories([]);
        }
      });
    }
  }, [isOpen, initialData, getValues, setValue]);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        categoryId: initialData.categoryId || "",
        region: initialData.region,
        country: initialData.country || "",
        activity: initialData.activity || "",
        peakHeightM: initialData.peakHeightM || initialData.maxAltitudeMeters || 8000,
        maxAltitudeMeters: initialData.maxAltitudeMeters || initialData.peakHeightM || 8000,
        climbingGrade: initialData.climbingGrade || ClimbingGrade.EXTREME_TECHNICAL_GRADE,
        sherpaGuideRatio: initialData.sherpaGuideRatio || "1:1 Sherpa Guide Ratio",
        oxygenRequired: initialData.oxygenRequired !== undefined ? initialData.oxygenRequired : true,
        difficulty: initialData.difficulty || TripDifficulty.EXTREME,
        bestSeason: initialData.bestSeason || "",
        durationDays: initialData.durationDays,
        priceUSD: initialData.priceUSD,
        status: initialData.status,
        startEndLocation: initialData.startEndLocation || "",
        accommodation: initialData.accommodation || "",
        meals: initialData.meals || "",
        groupSizeRange: initialData.groupSizeRange || "",
        permitsText: initialData.permitsRequired ? initialData.permitsRequired.join(", ") : "",
        inclusionsText: initialData.inclusionsText || "",
        exclusionsText: initialData.exclusionsText || "",
        shortDesc: initialData.shortDesc || "",
        addonsText: initialData.addonsText || "",
        usefulInfoText: initialData.usefulInfoText || "",
        departureDates: Array.isArray(initialData.departureDates) ? initialData.departureDates : [],
        galleryImages: Array.isArray(initialData.galleryImages) ? initialData.galleryImages : [],
        galleryMediaIds: Array.isArray(initialData.galleryMediaIds) ? initialData.galleryMediaIds : [],
        mapImage: initialData.mapImage || "",
        mapMediaId: initialData.mapMediaId || "",
        packageFiles: Array.isArray(initialData.packageFiles) ? initialData.packageFiles : [],
        image: initialData.image || "",
        coverMediaId: initialData.coverMediaId || "",
        metaTitle: initialData.metaTitle || "",
        metaDescription: initialData.metaDescription || "",
        keywords: initialData.keywords || "",
        itinerary: Array.isArray(initialData.itinerary) ? initialData.itinerary : [],
        faqs: Array.isArray(initialData.faqs) ? initialData.faqs : [],
        reviews: Array.isArray(initialData.reviews) ? initialData.reviews : [],
      });
    } else {
      reset({
        title: "",
        categoryId: expeditionCategories[0]?.value || "",
        region: "Everest",
        peakHeightM: 8848,
        maxAltitudeMeters: 8848,
        climbingGrade: ClimbingGrade.EXTREME_TECHNICAL_GRADE,
        sherpaGuideRatio: "1:1 Sherpa Guide Ratio",
        oxygenRequired: true,
        difficulty: TripDifficulty.EXTREME,
        bestSeason: "",
        durationDays: 0,
        priceUSD: 0,
        status: PackageStatus.ACTIVE,
        startEndLocation: "",
        accommodation: "",
        meals: "",
        groupSizeRange: "",
        permitsText: "",
        inclusionsText: "",
        exclusionsText: "",
        shortDesc: "",
        addonsText: "",
        usefulInfoText: "",
        departureDates: [],
        galleryImages: [],
        galleryMediaIds: [],
        mapImage: "",
        mapMediaId: "",
        packageFiles: [],
        image: "",
        coverMediaId: "",
        metaTitle: "",
        metaDescription: "",
        keywords: "",
        itinerary: [],
        faqs: [],
        reviews: [],
      });
    }
    setEditingMode(isEditing || !initialData);
  }, [initialData, isEditing, isOpen, reset, expeditionCategories]);

  const onSubmit = async (values: ExpeditionFormValues) => {
    setIsSubmitting(true);
    try {
      const permitsArray = (values.permitsText || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const alt = Number(values.peakHeightM) || Number(values.maxAltitudeMeters) || 8000;

      const expeditionToSave: PackageItem = {
        id: initialData?.id || "",
        title: values.title,
        slug: initialData?.slug || "",
        category: initialData?.category || "Expeditions",
        categoryId: values.categoryId && values.categoryId.trim() !== "" ? values.categoryId : undefined,
        region: (values.region as any) || "Everest",
        peakHeightM: alt,
        maxAltitudeMeters: alt,
        climbingGrade: values.climbingGrade || ClimbingGrade.EXTREME_TECHNICAL_GRADE,
        sherpaGuideRatio: values.sherpaGuideRatio || "1:1 Sherpa Guide Ratio",
        oxygenRequired: values.oxygenRequired !== undefined ? values.oxygenRequired : true,
        durationDays: Number(values.durationDays) || 0,
        difficulty: values.difficulty || TripDifficulty.EXTREME,
        priceUSD: Number(values.priceUSD) || 0,
        bestSeason: values.bestSeason || "",
        status: values.status || PackageStatus.ACTIVE,
        startEndLocation: values.startEndLocation,
        accommodation: values.accommodation,
        meals: values.meals,
        groupSizeRange: values.groupSizeRange,
        permitsRequired: permitsArray,
        inclusionsText: values.inclusionsText,
        exclusionsText: values.exclusionsText,
        shortDesc: values.shortDesc || "",
        addonsText: values.addonsText,
        usefulInfoText: values.usefulInfoText,
        departureDates: values.departureDates || [],
        galleryImages: values.galleryImages || [],
        galleryMediaIds: values.galleryMediaIds || initialData?.galleryMediaIds || [],
        mapImage: values.mapImage,
        mapMediaId: values.mapMediaId || (initialData?.mapMediaId ? initialData.mapMediaId : undefined),
        packageFiles: values.packageFiles || [],
        image: values.image || "",
        coverMediaId: values.coverMediaId || (initialData?.coverMediaId ? initialData.coverMediaId : undefined),
        metaTitle: values.metaTitle,
        metaDescription: values.metaDescription,
        keywords: values.keywords,
        itinerary: values.itinerary || [],
        faqs: values.faqs || [],
        reviews: values.reviews || [],
        rating: initialData?.rating || 5.0,
        totalBookings: initialData?.totalBookings || 0,
      };

      const success = await onSave(expeditionToSave);
      if (success !== false) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = !initialData
    ? "Add New Expedition Package"
    : editingMode
    ? `Edit: ${initialData.title}`
    : `Expedition Details: ${initialData.title}`;

  const modalDescription = editingMode
    ? "Configure peak details, technical specs, itinerary, gallery, departure dates, and downloadable brochures."
    : "Review summit specifications, climb itinerary, media gallery, departure dates, and downloadable files.";

  const tabs: { id: TabType; label: string; icon: any; count?: number }[] = [
    { id: "general", label: "Overview & Specs", icon: Info },
    { id: "itinerary", label: "Itinerary", icon: Calendar, count: watchItinerary.length },
    { id: "inclusions", label: "Includes / Excludes", icon: CheckCircle2 },
    { id: "departures", label: "Departure Dates", icon: Clock, count: watchDepartureDates.length },
    { id: "media", label: "Media & Map", icon: ImageIcon, count: watchGalleryImages.length },
    { id: "files", label: "Files & Downloads", icon: FileText, count: watchPackageFiles.length },
    { id: "faqs", label: "FAQs & Reviews", icon: MessageSquareQuote, count: watchFaqs.length + watchReviews.length },
    { id: "seo", label: "SEO", icon: Search },
  ];

  const editFooter = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-600">
          Tab: {tabs.find((t) => t.id === activeTab)?.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="text-xs font-semibold cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="expedition-form"
          disabled={isSubmitting}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </span>
          ) : (
            "Save Expedition"
          )}
        </Button>
      </div>
    </div>
  );

  const viewFooter = (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        onClick={onClose}
        className="text-xs font-semibold cursor-pointer"
      >
        Close
      </Button>
      <Button
        onClick={() => setEditingMode(true)}
        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
      >
        <Edit className="w-3.5 h-3.5 mr-1 text-amber-400" />
        Edit Expedition
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      description={modalDescription}
      maxWidth="4xl"
      fixedHeight={true}
      footer={editingMode ? editFooter : viewFooter}
    >
      {editingMode ? (
        <div className="space-y-4 py-2">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 pb-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? "bg-amber-400 text-slate-950"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <form id="expedition-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            {/* 1. OVERVIEW & SPECS TAB */}
            {activeTab === "general" && (
              <div className="grid grid-cols-2 gap-3 pr-1">
                <div className="col-span-2 sm:col-span-1">
                  <AdminInputField
                    label="Expedition Peak Title"
                    required
                    placeholder="e.g. Mount Everest 8848m South Col Expedition"
                    error={errors.title?.message}
                    {...register("title")}
                  />
                </div>

                <div className="sm:col-span-1">
                  <AdminSearchableSelect
                    label="Category"
                    required
                    value={watch("categoryId") || ""}
                    onChange={(val) => setValue("categoryId", val, { shouldValidate: true })}
                    error={errors.categoryId?.message}
                    placeholder="Select category..."
                    searchPlaceholder="Search categories..."
                    options={expeditionCategories}
                  />
                </div>

                <div className="sm:col-span-1">
                  <AdminSelectField
                    label="Region"
                    required
                    options={[
                      { label: "Everest / Khumbu", value: "Everest" },
                      { label: "Annapurna Region", value: "Annapurna" },
                      { label: "Manaslu Region", value: "Manaslu" },
                      { label: "Kanchenjunga & East", value: "Kanchenjunga" },
                      { label: "Dolpo & West", value: "Dolpo" },
                    ]}
                    {...register("region")}
                  />
                </div>

                <div className="sm:col-span-1">
                  <AdminSelectField
                    label="Country"
                    required
                    error={errors.country?.message}
                    options={PACKAGE_COUNTRIES.map((c) => ({ label: c, value: c }))}
                    {...register("country")}
                  />
                </div>

                <div className="sm:col-span-1">
                  <AdminSelectField
                    label="Activity"
                    required
                    error={errors.activity?.message}
                    options={[
                      { label: "Peak Climbing", value: TripActivity.PEAK_CLIMBING },
                      { label: "Trekking/Hiking", value: TripActivity.TREKKING_HIKING },
                      { label: "Cultural Sightseeing", value: TripActivity.CULTURAL_SIGHTSEEING },
                      { label: "Heli Trek & Tour", value: TripActivity.HELI_TREK_TOUR },
                      { label: "Wildlife Safari", value: TripActivity.WILDLIFE_SAFARI },
                      { label: "Other", value: TripActivity.OTHER },
                    ]}
                    {...register("activity")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Summit Altitude (Peak Height M)"
                    type="number"
                    required
                    placeholder="8848"
                    error={errors.peakHeightM?.message}
                    {...register("peakHeightM")}
                  />
                </div>

                <div>
                  <AdminSelectField
                    label="Climbing Technical Grade"
                    required
                    options={[
                      { label: "Non-Technical Trekking Peak", value: ClimbingGrade.NON_TECHNICAL_TREKKING_PEAK },
                      { label: "Technical Alpine Grade", value: ClimbingGrade.TECHNICAL_ALPINE_GRADE },
                      { label: "Extreme Technical Grade", value: ClimbingGrade.EXTREME_TECHNICAL_GRADE },
                    ]}
                    {...register("climbingGrade")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Sherpa Guide Ratio"
                    placeholder="e.g. 1:1 Personal Sherpa Guide Ratio"
                    {...register("sherpaGuideRatio")}
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
                    options={[
                      { label: "Active", value: PackageStatus.ACTIVE },
                      { label: "Featured", value: PackageStatus.FEATURED },
                      { label: "Draft", value: PackageStatus.DRAFT },
                    ]}
                    {...register("status")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Best Climbing Season"
                    placeholder="e.g. Spring (April - May) & Autumn"
                    {...register("bestSeason")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Group Size Range"
                    placeholder="e.g. 4 - 8 Summit Climbers"
                    {...register("groupSizeRange")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Basecamp & Start Location"
                    placeholder="e.g. Everest Basecamp (5,364m)"
                    {...register("startEndLocation")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminInputField
                    label="Accommodation Type"
                    placeholder="e.g. Basecamp Heated Tents & High Altitude Tents"
                    {...register("accommodation")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminInputField
                    label="Meals Plan"
                    placeholder="e.g. Full High-Calorie Expedition Kitchen & High Altitude Rations"
                    {...register("meals")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminInputField
                    label="Required Summit Permits (Comma Separated)"
                    placeholder="e.g. Ministry Climbing Permit, Sagarmatha NP Permit, Garbage Deposit"
                    {...register("permitsText")}
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Overview &amp; Summit Description <span className="text-rose-500">*</span>
                  </label>
                  <Controller
                    name="shortDesc"
                    control={control}
                    render={({ field }) => (
                      <AppRichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Detailed expedition summary, summit logistics, Sherpa support, oxygen systems, and safety protocols..."
                        height="220px"
                      />
                    )}
                  />
                </div>

                <div className="col-span-2 space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 block">
                    Add-ons &amp; Summit Upgrades (Rich Text)
                  </label>
                  <Controller
                    name="addonsText"
                    control={control}
                    render={({ field }) => (
                      <AppRichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Detail supplementary Summit Oxygen bottles, Western Guide upgrade, Helicopter transport options..."
                        height="180px"
                      />
                    )}
                  />
                </div>

                <div className="col-span-2 space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 block">
                    Useful Info &amp; Climbing Requirements (Rich Text)
                  </label>
                  <Controller
                    name="usefulInfoText"
                    control={control}
                    render={({ field }) => (
                      <AppRichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Prerequisite 6000m/7000m summits, personal climbing gear list, medical checkup requirements..."
                        height="200px"
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {/* 2. ITINERARY TAB */}
            {activeTab === "itinerary" && (
              <Controller
                name="itinerary"
                control={control}
                render={({ field }) => (
                  <TripItineraryManager
                    itinerary={field.value || []}
                    onChange={(newDays) => field.onChange(newDays)}
                    durationDays={Number(watch("durationDays") || 0)}
                    errors={errors.itinerary}
                  />
                )}
              />
            )}

            {/* 3. INCLUSIONS & EXCLUSIONS TAB */}
            {activeTab === "inclusions" && (
              <div className="space-y-6 pr-1">
                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>What&apos;s Included in Expedition Price (Rich Text)</span>
                  </div>
                  <Controller
                    name="inclusionsText"
                    control={control}
                    render={({ field }) => (
                      <AppRichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="e.g. Summit Climbing Royalty Fee, 1:1 IFMGA Sherpa Leader, Summit Oxygen Bottles & Regulator..."
                        height="200px"
                      />
                    )}
                  />
                </div>

                <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-rose-900 font-bold">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>What&apos;s Excluded from Expedition Price (Rich Text)</span>
                  </div>
                  <Controller
                    name="exclusionsText"
                    control={control}
                    render={({ field }) => (
                      <AppRichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="e.g. International Flights to Kathmandu, Personal High Altitude Gear & Boots..."
                        height="200px"
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {/* 4. DEPARTURE DATES TAB */}
            {activeTab === "departures" && (
              <div className="pr-1">
                <Controller
                  name="departureDates"
                  control={control}
                  render={({ field }) => (
                    <TripDepartureDatesManager
                      dates={field.value || []}
                      onChange={field.onChange}
                      defaultPrice={Number(watch("priceUSD") || 0)}
                    />
                  )}
                />
              </div>
            )}

            {/* 5. MEDIA & MAP TAB */}
            {activeTab === "media" && (
              <div className="space-y-6 pr-1">
                <Controller
                  name="image"
                  control={control}
                  render={({ field }) => (
                    <AdminImageUpload
                      label="Primary Cover Image"
                      value={field.value || ""}
                      onChange={(url, mediaId) => {
                        field.onChange(url);
                        setValue("coverMediaId", mediaId || "");
                      }}
                      error={errors.image?.message}
                    />
                  )}
                />

                <Controller
                  name="galleryImages"
                  control={control}
                  render={({ field }) => (
                    <TripGalleryManager
                      images={field.value || []}
                      galleryMediaIds={watch("galleryMediaIds") || []}
                      onChange={(newImages, newMediaIds) => {
                        field.onChange(newImages);
                        if (newMediaIds) {
                          setValue("galleryMediaIds", newMediaIds);
                        }
                      }}
                    />
                  )}
                />

                <Controller
                  name="mapImage"
                  control={control}
                  render={({ field }) => (
                    <TripMapManager
                      mapImage={field.value || ""}
                      mapMediaId={watch("mapMediaId") || ""}
                      onChange={(url, mediaId) => {
                        field.onChange(url);
                        setValue("mapMediaId", mediaId || "");
                      }}
                      packageTitle={watch("title")}
                    />
                  )}
                />
              </div>
            )}

            {/* 6. FILES & DOWNLOADS TAB */}
            {activeTab === "files" && (
              <div className="pr-1">
                <Controller
                  name="packageFiles"
                  control={control}
                  render={({ field }) => (
                    <TripFilesManager
                      files={field.value || []}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            )}

            {/* 7. FAQS & REVIEWS TAB */}
            {activeTab === "faqs" && (
              <div className="space-y-6 pr-1">
                <Controller
                  name="faqs"
                  control={control}
                  render={({ field }) => (
                    <TripFaqsManager
                      faqs={field.value || []}
                      onChange={(newFaqs: TripFaqItem[]) => field.onChange(newFaqs)}
                    />
                  )}
                />

                <div className="pt-4 border-t border-slate-200">
                  <Controller
                    name="reviews"
                    control={control}
                    render={({ field }) => (
                      <TripReviewsManager
                        reviews={field.value || []}
                        onChange={(newReviews: TripReviewItem[]) => field.onChange(newReviews)}
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {/* 8. SEO TAB */}
            {activeTab === "seo" && (
              <div className="space-y-4 pr-1">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-medium text-emerald-800 truncate">
                    {websiteDomain} › expeditions › {watchTitle ? watchTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "expedition-slug"}
                  </div>
                  <div className="text-xs font-bold text-blue-700 truncate">
                    {watchMetaTitle?.trim() || `${watchTitle || "Expedition Package"} | AlpineAce`}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium line-clamp-2">
                    {watchMetaDesc?.trim() || watchShortDesc?.trim() || "Summit Himalayan peaks with AlpineAce IFMGA Sherpa leaders."}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Meta Title</label>
                  <AdminInputField placeholder="e.g. Mount Everest 8848m Expedition | Alpine Ace" {...register("metaTitle")} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Meta Description</label>
                  <AdminTextareaField rows={3} placeholder="Brief summary for search result snippets..." {...register("metaDescription")} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Focus Keywords</label>
                  <AdminInputField placeholder="e.g. Everest Summit, 8000m Expedition, Sherpa Guide" {...register("keywords")} />
                </div>
              </div>
            )}
          </form>
        </div>
      ) : (
        /* READ-ONLY VIEW MODE */
        <div className="space-y-4 py-2 text-xs pr-1">
          <div className="grid grid-cols-3 gap-4">
            <div className="aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden col-span-1 relative flex items-center justify-center">
              {initialData?.image ? (
                <img src={initialData.image} alt={initialData.title} className="w-full h-full object-cover" />
              ) : (
                <Mountain className="w-8 h-8 text-slate-300" />
              )}
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="col-span-2 pb-1 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Public Expedition Route</span>
                  <Link href={`/expeditions/${initialData?.slug}`} target="_blank" rel="noopener noreferrer" className="font-extrabold text-slate-900 hover:text-amber-600 inline-flex items-center gap-1">
                    <span>{initialData?.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
                <AdminStatusBadge status={initialData?.status || "active"} />
              </div>

              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Summit Altitude:</span>
                <span className="text-slate-950 font-bold">{(initialData?.peakHeightM || initialData?.maxAltitudeMeters || 8000).toLocaleString()}m</span>
              </div>
              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Duration:</span>
                <span className="text-slate-950 font-bold">{initialData?.durationDays || 0} Days</span>
              </div>
              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Sherpa Ratio:</span>
                <span className="text-slate-950 font-bold">{initialData?.sherpaGuideRatio || "1:1 Sherpa"}</span>
              </div>
              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Price:</span>
                <span className="text-slate-950 font-black text-sm text-emerald-800">${(initialData?.priceUSD || 0).toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          {initialData?.shortDesc && (
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block text-xs">Expedition Overview:</span>
              <div className="prose prose-sm max-w-none text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-200" dangerouslySetInnerHTML={{ __html: initialData.shortDesc }} />
            </div>
          )}

          {initialData?.addonsText && (
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block text-xs">Add-ons &amp; Options:</span>
              <div className="prose prose-sm max-w-none text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-200" dangerouslySetInnerHTML={{ __html: initialData.addonsText }} />
            </div>
          )}

          {initialData?.usefulInfoText && (
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block text-xs">Useful Info:</span>
              <div className="prose prose-sm max-w-none text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-200" dangerouslySetInnerHTML={{ __html: initialData.usefulInfoText }} />
            </div>
          )}

          {initialData?.departureDates && initialData.departureDates.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-slate-900 block text-xs">Scheduled Departure Dates ({initialData.departureDates.length}):</span>
              <TripDepartureDatesManager dates={initialData.departureDates} onChange={() => {}} readOnly />
            </div>
          )}

          {((initialData?.galleryImages && initialData.galleryImages.length > 0) || initialData?.mapImage) && (
            <div className="space-y-3 pt-1">
              {initialData.mapImage && (
                <div>
                  <span className="font-bold text-slate-900 block text-xs mb-1">Climbing Route Map:</span>
                  <TripMapManager mapImage={initialData.mapImage} onChange={() => {}} readOnly packageTitle={initialData.title} />
                </div>
              )}
              {initialData.galleryImages && initialData.galleryImages.length > 0 && (
                <div>
                  <span className="font-bold text-slate-900 block text-xs mb-1">Photo Gallery ({initialData.galleryImages.length}):</span>
                  <TripGalleryManager images={initialData.galleryImages} onChange={() => {}} readOnly />
                </div>
              )}
            </div>
          )}

          {initialData?.packageFiles && initialData.packageFiles.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-slate-900 block text-xs">Downloadable Files &amp; Brochures ({initialData.packageFiles.length}):</span>
              <TripFilesManager files={initialData.packageFiles} onChange={() => {}} readOnly />
            </div>
          )}
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

export function DeleteExpeditionModal({
  isOpen,
  onClose,
  onConfirm,
  expeditionTitle,
}: DeleteExpeditionModalProps) {
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Deletion"
      description={`Are you sure you want to delete "${expeditionTitle}"? This action cannot be undone.`}
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="text-xs font-semibold cursor-pointer">
            Cancel
          </Button>
          <Button onClick={() => { onConfirm(); onClose(); }} className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer">
            Delete Expedition
          </Button>
        </div>
      }
    >
      <div className="text-sm text-slate-700 py-2">
        This will permanently remove the expedition package from the active catalogue.
      </div>
    </AdminModal>
  );
}
