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
import { CategoryType, PackageStatus, TripDifficulty, TripActivity, PACKAGE_COUNTRIES } from "@/lib/admin-data";
import { TrekFormValues, trekSchema } from "@/lib/admin-schemas";
import { CategoryService, MediaService } from "@/lib/services/admin-service";
import { TrekItem } from "@/lib/trek-data";
import { openSingleImage } from "@/lib/utils/lightbox";
import { websiteDomain } from "@/lib/env.constants";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BedDouble,
  Calendar,
  CheckCircle2,
  Clock,
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
  Utensils,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface TrekFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trek: TrekItem) => Promise<boolean | void> | boolean | void;
  initialData?: TrekItem | null;
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

export function TrekFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: TrekFormModalProps) {
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
    formState: { errors, isSubmitted },
  } = useForm<TrekFormValues, any, TrekFormValues>({
    resolver: zodResolver(trekSchema) as any,
    defaultValues: {
      title: "",
      categoryId: "",
      region: "",
      country: "",
      activity: "",
      durationDays: 0,
      maxAltitudeMeters: undefined,
      difficulty: TripDifficulty.MODERATE,
      priceUSD: 0,
      bestSeason: "",
      status: PackageStatus.ACTIVE,
      startEndLocation: "",
      accommodation: "",
      meals: "",
      groupSizeRange: "",
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

  const [trekCategories, setTrekCategories] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      CategoryService.getByType(CategoryType.TREKKING).then((cats) => {
        if (cats && cats.length > 0) {
          const opts = cats.map((c) => ({ label: c.name, value: c.id }));
          setTrekCategories(opts);
          if (!initialData && !getValues("categoryId")) {
            setValue("categoryId", cats[0].id);
          }
        } else {
          setTrekCategories([]);
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
        durationDays: initialData.durationDays,
        maxAltitudeMeters: initialData.maxAltitudeMeters,
        difficulty: initialData.difficulty,
        priceUSD: initialData.priceUSD,
        bestSeason: initialData.bestSeason || "",
        status: initialData.status,
        startEndLocation: initialData.startEndLocation || "",
        accommodation: initialData.accommodation || "",
        meals: initialData.meals || "",
        groupSizeRange: initialData.groupSizeRange || "",
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
        categoryId: trekCategories[0]?.value || "",
        region: "",
        durationDays: 0,
        maxAltitudeMeters: undefined,
        difficulty: TripDifficulty.MODERATE,
        priceUSD: 0,
        bestSeason: "",
        status: PackageStatus.ACTIVE,
        startEndLocation: "",
        accommodation: "",
        meals: "",
        groupSizeRange: "",
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
  }, [initialData, isEditing, isOpen, reset, trekCategories]);

  const onSubmit = async (values: TrekFormValues) => {
    setIsSubmitting(true);
    try {
      const permitsArray = (values.permitsText || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const trekToSave: TrekItem = {
        id: initialData?.id || "",
        title: values.title,
        slug: initialData?.slug || "",
        category: initialData?.category || "Trekking",
        categoryId: values.categoryId && values.categoryId.trim() !== "" ? values.categoryId : undefined,
        region: (values.region as any) || (initialData?.region as any) || "Everest",
        durationDays: Number(values.durationDays) || 0,
        maxAltitudeMeters: Number(values.maxAltitudeMeters) || 0,
        difficulty: values.difficulty || TripDifficulty.MODERATE,
        priceUSD: Number(values.priceUSD) || 0,
        bestSeason: values.bestSeason || "",
        status: values.status || PackageStatus.ACTIVE,
        startEndLocation: values.startEndLocation,
        accommodation: values.accommodation,
        meals: values.meals,
        groupSizeRange: values.groupSizeRange,
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
        reviewsCount: initialData?.reviewsCount || (values.reviews?.length || 0),
      };

      const success = await onSave(trekToSave);
      if (success !== false) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = !initialData
    ? "Add New Trek Package"
    : editingMode
    ? `Edit: ${initialData.title}`
    : `Trek Details: ${initialData.title}`;

  const modalDescription = editingMode
    ? "Fill out all required details, itinerary, media gallery, departure dates, and downloadable files."
    : "Review package specifications, gallery, departure dates, and downloadable documents.";

  // Validation error flags for tab badges
  const hasGeneralErrors = isSubmitted && !!(
    errors.title ||
    errors.categoryId ||
    errors.region ||
    errors.durationDays ||
    errors.priceUSD ||
    errors.shortDesc
  );
  const hasItineraryErrors = isSubmitted && !!(
    errors.itinerary &&
    (Array.isArray(errors.itinerary) ? errors.itinerary.some(Boolean) : true)
  );
  const hasInclusionsErrors = isSubmitted && !!(errors.inclusionsText || errors.exclusionsText);
  const hasFaqErrors = isSubmitted && !!(errors.faqs);
  const hasReviewErrors = isSubmitted && !!(errors.reviews);
  const hasMediaErrors = isSubmitted && !!(errors.image);
  const hasSeoErrors = isSubmitted && !!(errors.metaTitle || errors.metaDescription || errors.keywords);

  const tabs: { id: TabType; label: string; icon: any; count?: number; hasError?: boolean }[] = [
    { id: "general", label: "Overview & Specs", icon: Info, hasError: hasGeneralErrors },
    { id: "itinerary", label: "Itinerary", icon: Calendar, count: watchItinerary.length, hasError: hasItineraryErrors },
    { id: "inclusions", label: "Includes / Excludes", icon: CheckCircle2, hasError: hasInclusionsErrors },
    { id: "departures", label: "Departure Dates", icon: Clock, count: watchDepartureDates.length },
    { id: "media", label: "Media & Map", icon: ImageIcon, count: watchGalleryImages.length, hasError: hasMediaErrors },
    { id: "files", label: "Files & Downloads", icon: FileText, count: watchPackageFiles.length },
    { id: "faqs", label: "FAQs & Reviews", icon: MessageSquareQuote, count: watchFaqs.length + watchReviews.length, hasError: hasFaqErrors || hasReviewErrors },
    { id: "seo", label: "SEO", icon: Search, hasError: hasSeoErrors },
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
          form="trek-form"
          disabled={isSubmitting}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </span>
          ) : (
            "Save Trek Package"
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
        Edit Trek Package
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
              const isTabError = tab.hasError;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : isTabError
                      ? "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : isTabError ? "text-rose-500" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                  {isTabError && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                  )}
                  {tab.count !== undefined && tab.count > 0 && !isTabError && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? "bg-slate-900 text-white"
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

          <form id="trek-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            {/* 1. OVERVIEW & SPECS TAB */}
            {activeTab === "general" && (
              <div className="grid grid-cols-2 gap-3 pr-1">
                <div className="col-span-2 sm:col-span-1">
                  <AdminInputField
                    label="Trek Title"
                    required
                    placeholder="e.g. Annapurna Sanctuary Luxury Lodge Trek"
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
                    options={trekCategories}
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
                      { label: "Khumbu", value: "Khumbu" },
                      { label: "Kathmandu & Pokhara", value: "Kathmandu & Pokhara" },
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
                      { label: "Trekking/Hiking", value: TripActivity.TREKKING_HIKING },
                      { label: "Cultural Sightseeing", value: TripActivity.CULTURAL_SIGHTSEEING },
                      { label: "Peak Climbing", value: TripActivity.PEAK_CLIMBING },
                      { label: "Heli Trek & Tour", value: TripActivity.HELI_TREK_TOUR },
                      { label: "Wildlife Safari", value: TripActivity.WILDLIFE_SAFARI },
                      { label: "Other", value: TripActivity.OTHER },
                    ]}
                    {...register("activity")}
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
                    label="Difficulty Grade"
                    required
                    error={errors.difficulty?.message}
                    options={[
                      { label: "Easy", value: TripDifficulty.EASY },
                      { label: "Moderate", value: TripDifficulty.MODERATE },
                      { label: "Challenging", value: TripDifficulty.CHALLENGING },
                      { label: "Strenuous", value: TripDifficulty.STRENUOUS },
                      { label: "Extreme", value: TripDifficulty.EXTREME },
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
                      { label: "Active", value: PackageStatus.ACTIVE },
                      { label: "Featured", value: PackageStatus.FEATURED },
                      { label: "Draft", value: PackageStatus.DRAFT },
                    ]}
                    {...register("status")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Best Season"
                    required
                    placeholder="e.g. March - May & Sept - Nov"
                    error={errors.bestSeason?.message}
                    {...register("bestSeason")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Group Size Range"
                    placeholder="e.g. 2 - 12 Travelers"
                    {...register("groupSizeRange")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Start & End Route Location"
                    placeholder="e.g. Kathmandu to Kathmandu"
                    {...register("startEndLocation")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Accommodation Type"
                    placeholder="e.g. Luxury Lodges & Heritage Hotels"
                    {...register("accommodation")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminInputField
                    label="Meals Plan"
                    placeholder="e.g. All Meals Included (Breakfast, Lunch, Dinner)"
                    {...register("meals")}
                  />
                </div>



                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Overview &amp; Experience Description <span className="text-rose-500">*</span>
                  </label>
                  <Controller
                    name="shortDesc"
                    control={control}
                    render={({ field }) => (
                      <AppRichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Detailed marketing overview, highlights, terrain insights, and trekking experiences..."
                        height="220px"
                        showMediaUpload={true}
                        onMediaUpload={async (file) => {
                          const res = await MediaService.uploadFile(file);
                          return res?.data?.url || "";
                        }}
                      />
                    )}
                  />
                  {errors.shortDesc && (
                    <p className="text-[11px] text-rose-500 font-semibold">{errors.shortDesc.message}</p>
                  )}
                </div>

                <div className="col-span-2 space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 block">
                    Add-ons &amp; Optional Upgrades (Rich Text)
                  </label>
                  <Controller
                    name="addonsText"
                    control={control}
                    render={({ field }) => (
                      <AppRichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Detail helicopter return options, single supplement upgrades, gear rental, extensions..."
                        height="180px"
                      />
                    )}
                  />
                </div>

                <div className="col-span-2 space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 block">
                    Useful Info &amp; Preparation Guidelines (Rich Text)
                  </label>
                  <Controller
                    name="usefulInfoText"
                    control={control}
                    render={({ field }) => (
                      <AppRichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Packing list recommendations, physical fitness prep, visa details, altitude sickness notes..."
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
                    <span>What&apos;s Included in Cost (Rich Text)</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Enter included services, domestic flights, guide ratios, gear, and meals with rich text formatting.
                  </p>
                  <Controller
                    name="inclusionsText"
                    control={control}
                    render={({ field }) => (
                      <AppRichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="e.g. IFMGA Certified Sherpa Guide, Luxury Teahouse Lodges, Domestic Flights, All Government Permits..."
                        height="200px"
                      />
                    )}
                  />
                </div>

                <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-rose-900 font-bold">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>What&apos;s Excluded from Cost (Rich Text)</span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Enter items travelers must cover independently with rich text formatting.
                  </p>
                  <Controller
                    name="exclusionsText"
                    control={control}
                    render={({ field }) => (
                      <AppRichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="e.g. International Airfare, Travel & Emergency Medical Evacuation Insurance, Personal Alcohol..."
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
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="text-[11px] font-medium text-emerald-800 truncate">
                    {websiteDomain} › trekking › {watchTitle ? watchTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "trek-slug"}
                  </div>

                  <div className="text-xs font-bold text-blue-700 truncate hover:underline cursor-pointer">
                    {watchMetaTitle?.trim() ||
                      (watchTitle
                        ? `${watchTitle} - ${watchDuration ? `${watchDuration} Days ` : ""}Himalayan Trek | AlpineAce`
                        : "Trek Package Title Preview | AlpineAce")}
                  </div>

                  <div className="text-[11px] text-slate-600 font-medium line-clamp-2 leading-relaxed">
                    {watchMetaDesc?.trim() ||
                      watchShortDesc?.trim() ||
                      "Experience certified Sherpa-led Himalayan journeys with luxury lodge hospitality. Book with AlpineAce."}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Meta Title
                    </label>
                    <span className={`text-[10px] font-semibold ${
                      (watchMetaTitle?.length || 0) > 60
                        ? "text-rose-600"
                        : (watchMetaTitle?.length || 0) >= 30
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}>
                      {watchMetaTitle?.length || 0} / 60
                    </span>
                  </div>
                  <AdminInputField
                    placeholder="e.g. Everest Base Camp Luxury Helicopter Trek | Alpine Ace"
                    {...register("metaTitle")}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Meta Description
                    </label>
                    <span className={`text-[10px] font-semibold ${
                      (watchMetaDesc?.length || 0) > 160
                        ? "text-rose-600"
                        : (watchMetaDesc?.length || 0) >= 120
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}>
                      {watchMetaDesc?.length || 0} / 160
                    </span>
                  </div>
                  <AdminTextareaField
                    rows={3}
                    placeholder="Brief summary for Google search result snippets and social media previews..."
                    {...register("metaDescription")}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Focus Keywords
                  </label>
                  <AdminInputField
                    placeholder="e.g. Everest Base Camp, Nepal Trekking, Sherpa Guides, Luxury Lodges"
                    {...register("keywords")}
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      ) : (
        /* READ-ONLY VIEW MODE */
        <div className="space-y-4 py-2 text-xs pr-1">
          {/* Header Card */}
          <div className="grid grid-cols-3 gap-4">
            <div className="aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden col-span-1 relative flex items-center justify-center group/cover">
              {initialData?.image ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    openSingleImage(initialData.image!, initialData.title, e.currentTarget);
                  }}
                  className="w-full h-full cursor-zoom-in relative"
                  title="Click to view cover image in lightbox"
                >
                  <img
                    src={initialData?.image}
                    alt={initialData?.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                  </div>
                </div>
              ) : (
                <Mountain className="w-8 h-8 text-slate-300" />
              )}
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="col-span-2 pb-1 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Public Marketing Route
                  </span>
                  <Link
                    href={`/trekking/${initialData?.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center gap-1.5 font-extrabold text-slate-900 hover:text-amber-600 transition-colors"
                  >
                    <span className="underline decoration-transparent group-hover/link:decoration-amber-500 underline-offset-2">
                      {initialData?.title}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-amber-600 transition-colors shrink-0" />
                  </Link>
                </div>
                <div>
                  <AdminStatusBadge status={initialData?.status || "active"} />
                </div>
              </div>

              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Region:</span>
                <span className="text-slate-950 font-bold flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  {initialData?.region || "—"} Region
                </span>
              </div>
              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Duration:</span>
                <span className="text-slate-950 font-bold flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {initialData?.durationDays || 0} Days
                </span>
              </div>
              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Max Elevation:</span>
                <span className="text-slate-950 font-bold flex items-center gap-1 mt-0.5">
                  <Mountain className="w-3.5 h-3.5 text-emerald-500" />
                  {(initialData?.maxAltitudeMeters || 0).toLocaleString()}m
                </span>
              </div>
              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Starting Price:</span>
                <span className="text-slate-950 font-black text-sm text-emerald-800">
                  ${(initialData?.priceUSD || 0).toLocaleString()} USD
                </span>
              </div>
            </div>
          </div>

          {/* Quick Details Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Best Season</span>
              <span className="text-slate-900 font-bold">{initialData?.bestSeason || "—"}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Group Size</span>
              <span className="text-slate-900 font-bold">{initialData?.groupSizeRange || "—"}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Accommodation</span>
              <span className="text-slate-900 font-bold truncate block">{initialData?.accommodation || "Tea House / Mountain Lodge"}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Meals Included</span>
              <span className="text-slate-900 font-bold truncate block">{initialData?.meals || "Breakfast, Lunch & Dinner"}</span>
            </div>
          </div>

          {/* Short Overview Description */}
          {initialData?.shortDesc && (
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block text-xs">Marketing Overview &amp; Experience:</span>
              <div
                className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-normal bg-slate-50 p-3.5 rounded-lg border border-slate-200"
                dangerouslySetInnerHTML={{ __html: initialData.shortDesc }}
              />
            </div>
          )}

          {/* Add-ons & Useful Info */}
          {initialData?.addonsText && (
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block text-xs">Add-ons &amp; Options:</span>
              <div
                className="prose prose-sm max-w-none text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-200"
                dangerouslySetInnerHTML={{ __html: initialData.addonsText }}
              />
            </div>
          )}

          {initialData?.usefulInfoText && (
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block text-xs">Useful Info:</span>
              <div
                className="prose prose-sm max-w-none text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-200"
                dangerouslySetInnerHTML={{ __html: initialData.usefulInfoText }}
              />
            </div>
          )}

          {/* Departure Dates Summary */}
          {initialData?.departureDates && initialData.departureDates.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-slate-900 block text-xs">Scheduled Departure Dates ({initialData.departureDates.length}):</span>
              <TripDepartureDatesManager dates={initialData.departureDates} onChange={() => {}} readOnly />
            </div>
          )}

          {/* Media & Map Summary */}
          {((initialData?.galleryImages && initialData.galleryImages.length > 0) || initialData?.mapImage) && (
            <div className="space-y-3 pt-1">
              {initialData.mapImage && (
                <div>
                  <span className="font-bold text-slate-900 block text-xs mb-1">Trek Route Map:</span>
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

          {/* Downloadable Files Summary */}
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

interface DeleteTrekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  trekTitle?: string;
}

export function DeleteTrekModal({
  isOpen,
  onClose,
  onConfirm,
  trekTitle,
}: DeleteTrekModalProps) {
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Deletion"
      description={`Are you sure you want to delete "${trekTitle}"? This action cannot be undone.`}
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
          >
            Delete Trek
          </Button>
        </div>
      }
    >
      <div className="text-sm text-slate-700 py-2">
        This will permanently remove the trek package from the active catalogue.
      </div>
    </AdminModal>
  );
}
