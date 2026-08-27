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
import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import {
  CategoryType,
  PackageItem,
  PackageStatus,
  TourType,
  TripDifficulty,
  TripActivity,
  PACKAGE_COUNTRIES,
} from "@/lib/admin-data";
import { TourFormValues, tourSchema } from "@/lib/admin-schemas";
import { CategoryService, MediaService } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";
import { websiteDomain } from "@/lib/env.constants";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BedDouble,
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
  Utensils,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface TourFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tour: PackageItem) => Promise<boolean | void> | boolean | void;
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

export function TourFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: TourFormModalProps) {
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
  } = useForm<TourFormValues, any, TourFormValues>({
    resolver: zodResolver(tourSchema) as any,
    defaultValues: {
      title: "",
      categoryId: "",
      region: "",
      country: "",
      activity: "",
      tourType: TourType.CULTURAL_HERITAGE,
      transportation: "",
      difficulty: TripDifficulty.EASY,
      bestSeason: "",
      durationDays: 0,
      maxAltitudeMeters: undefined,
      priceUSD: 0,
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

  const [tourCategories, setTourCategories] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      CategoryService.getByType(CategoryType.TOURS).then((cats) => {
        if (cats && cats.length > 0) {
          const opts = cats.map((c) => ({ label: c.name, value: c.id }));
          setTourCategories(opts);
          if (!initialData && !getValues("categoryId")) {
            setValue("categoryId", cats[0].id);
          }
        } else {
          setTourCategories([]);
        }
      });
    }
  }, [isOpen, initialData, getValues, setValue]);

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormError(null);
    setIsSubmitting(false);
    if (initialData) {
      reset({
        title: initialData.title,
        categoryId: initialData.categoryId || "",
        region: initialData.region,
        country: initialData.country || "",
        activity: initialData.activity || "",
        tourType: initialData.tourType || TourType.CULTURAL_HERITAGE,
        transportation: initialData.transportation || "",
        difficulty: initialData.difficulty || TripDifficulty.EASY,
        bestSeason: initialData.bestSeason || "",
        durationDays: initialData.durationDays,
        maxAltitudeMeters: initialData.maxAltitudeMeters,
        priceUSD: initialData.priceUSD,
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
        categoryId: tourCategories[0]?.value || "",
        region: "Kathmandu & Pokhara",
        tourType: TourType.CULTURAL_HERITAGE,
        transportation: "",
        difficulty: TripDifficulty.EASY,
        bestSeason: "",
        durationDays: 0,
        maxAltitudeMeters: undefined,
        priceUSD: 0,
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
  }, [initialData, isEditing, isOpen, reset, tourCategories]);

  const handleClose = () => {
    setFormError(null);
    setIsSubmitting(false);
    onClose();
  };

  const onSubmit = async (values: TourFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const permitsArray = (values.permitsText || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const tourToSave: PackageItem = {
        id: initialData?.id || "",
        title: values.title,
        slug: initialData?.slug || "",
        category: initialData?.category || "Tours",
        categoryId: values.categoryId && values.categoryId.trim() !== "" ? values.categoryId : undefined,
        region: (values.region as any) || "Kathmandu & Pokhara",
        tourType: values.tourType || TourType.CULTURAL_HERITAGE,
        transportation: values.transportation,
        durationDays: Number(values.durationDays) || 0,
        maxAltitudeMeters: Number(values.maxAltitudeMeters) || 1400,
        difficulty: values.difficulty || TripDifficulty.EASY,
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
        totalBookings: initialData?.totalBookings || 0,
      };

      const success = await onSave(tourToSave);
      if (success !== false) {
        onClose();
      } else {
        setFormError("Failed to save tour package. Please check form inputs.");
      }
    } catch (err: any) {
      setFormError(err?.message || "Failed to save tour package.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = !initialData
    ? "Add New Tour Package"
    : editingMode
    ? `Edit: ${initialData.title}`
    : `Tour Details: ${initialData.title}`;

  const modalDescription = editingMode
    ? "Manage tour details, itinerary, photo gallery, departure dates, and downloadable brochures."
    : "Review tour specifications, media, departure dates, and downloadable files.";

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
          onClick={handleClose}
          disabled={isSubmitting}
          className="text-xs font-semibold cursor-pointer"
        >
          Cancel
        </Button>
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
            "Save Tour Package"
          )}
        </Button>
      </div>
    </div>
  );

  const viewFooter = (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        onClick={handleClose}
        className="text-xs font-semibold cursor-pointer"
      >
        Close
      </Button>
      <Button
        onClick={() => setEditingMode(true)}
        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
      >
        <Edit className="w-3.5 h-3.5 mr-1 text-amber-400" />
        Edit Tour Package
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      description={modalDescription}
      maxWidth="4xl"
      fixedHeight={true}
      footer={editingMode ? editFooter : viewFooter}
    >
      {editingMode ? (
        <div className="space-y-4 py-2">
          {formError && (
            <div className="p-3 mb-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}
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

          <form id="tour-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            {/* 1. OVERVIEW & SPECS TAB */}
            {activeTab === "general" && (
              <div className="grid grid-cols-2 gap-3 pr-1">
                <div className="col-span-2 sm:col-span-1">
                  <AdminInputField
                    label="Tour Title"
                    required
                    placeholder="e.g. Kathmandu Cultural Heritage & Scenic Nagarkot Tour"
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
                    options={tourCategories}
                  />
                </div>

                <div className="sm:col-span-1">
                  <AdminSelectField
                    label="Tour Type"
                    required
                    options={[
                      { label: "Cultural Heritage", value: TourType.CULTURAL_HERITAGE },
                      { label: "Luxury & Wellness", value: TourType.LUXURY_WELLNESS },
                      { label: "Wildlife Safari", value: TourType.WILDLIFE_SAFARI },
                      { label: "Helicopter Tour", value: TourType.HELICOPTER_TOUR },
                      { label: "Day Tour", value: TourType.DAY_TOUR },
                      { label: "Other Tour", value: TourType.OTHER },
                    ]}
                    {...register("tourType")}
                  />
                </div>

                <div className="sm:col-span-1">
                  <AdminSelectField
                    label="Region"
                    required
                    options={[
                      { label: "Kathmandu & Pokhara", value: "Kathmandu & Pokhara" },
                      { label: "Chitwan & Lumbini", value: "Chitwan & Lumbini" },
                      { label: "Everest Region", value: "Everest" },
                      { label: "Annapurna Region", value: "Annapurna" },
                      { label: "Langtang Region", value: "Langtang" },
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
                      { label: "Cultural Sightseeing", value: TripActivity.CULTURAL_SIGHTSEEING },
                      { label: "Trekking/Hiking", value: TripActivity.TREKKING_HIKING },
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
                    label="Price (USD)"
                    type="number"
                    required
                    error={errors.priceUSD?.message}
                    {...register("priceUSD")}
                  />
                </div>

                <div>
                  <AdminSelectField
                    label="Difficulty"
                    options={[
                      { label: "Easy", value: TripDifficulty.EASY },
                      { label: "Moderate", value: TripDifficulty.MODERATE },
                      { label: "Challenging", value: TripDifficulty.CHALLENGING },
                    ]}
                    {...register("difficulty")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Transportation Mode"
                    placeholder="e.g. Private AC Vehicle / Helicopter"
                    {...register("transportation")}
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
                    label="Best Season"
                    placeholder="e.g. All Year Round"
                    {...register("bestSeason")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Group Size Range"
                    placeholder="e.g. 1 - 15 Travelers"
                    {...register("groupSizeRange")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Start & Finish Location"
                    placeholder="e.g. Tribhuvan International Airport, Kathmandu"
                    {...register("startEndLocation")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminInputField
                    label="Accommodation Type"
                    placeholder="e.g. 5-Star Heritage Hotel & Boutique Resort"
                    {...register("accommodation")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminInputField
                    label="Meals Plan"
                    placeholder="e.g. Daily Breakfast & Welcome Dinner Included"
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
                        placeholder="Detailed tour overview, heritage site highlights, transport comfort, and luxury experiences..."
                        height="220px"
                      />
                    )}
                  />
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
                        placeholder="Details on mountain flight extensions, spa upgrades, luxury vehicle upgrades..."
                        height="180px"
                      />
                    )}
                  />
                </div>

                <div className="col-span-2 space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 block">
                    Useful Info &amp; Travel Guidelines (Rich Text)
                  </label>
                  <Controller
                    name="usefulInfoText"
                    control={control}
                    render={({ field }) => (
                      <AppRichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Temple dress codes, currency exchange, visa info, photography guidelines..."
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
                  <Controller
                    name="inclusionsText"
                    control={control}
                    render={({ field }) => (
                      <AppRichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="e.g. Private AC Vehicle Transportation, English Speaking Cultural Guide, Hotel Accommodation with Breakfast..."
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
                  <Controller
                    name="exclusionsText"
                    control={control}
                    render={({ field }) => (
                      <AppRichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="e.g. International Flights, Visa Fees, Personal Expenses, Lunch & Dinner Unless Specified..."
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
                    {websiteDomain} › tours › {watchTitle ? watchTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "tour-slug"}
                  </div>
                  <div className="text-xs font-bold text-blue-700 truncate">
                    {watchMetaTitle?.trim() || `${watchTitle || "Tour Package"} | AlpineAce`}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium line-clamp-2">
                    {watchMetaDesc?.trim() || watchShortDesc?.trim() || "Explore luxury Nepal tours with AlpineAce."}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Meta Title</label>
                  <AdminInputField placeholder="e.g. Kathmandu & Pokhara Luxury Cultural Tour" {...register("metaTitle")} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Meta Description</label>
                  <AdminTextareaField rows={3} placeholder="Brief summary for search result snippets..." {...register("metaDescription")} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Focus Keywords</label>
                  <AdminInputField placeholder="e.g. Nepal Tours, Kathmandu Heritage, Pokhara Resort" {...register("keywords")} />
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
                <Compass className="w-8 h-8 text-slate-300" />
              )}
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="col-span-2 pb-1 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Public Tour Route</span>
                  <Link href={`/tours/${initialData?.slug}`} target="_blank" rel="noopener noreferrer" className="font-extrabold text-slate-900 hover:text-amber-600 inline-flex items-center gap-1">
                    <span>{initialData?.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
                <AdminStatusBadge status={initialData?.status || "active"} />
              </div>

              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Region:</span>
                <span className="text-slate-950 font-bold">{initialData?.region || "—"}</span>
              </div>
              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Duration:</span>
                <span className="text-slate-950 font-bold">{initialData?.durationDays || 0} Days</span>
              </div>
              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Tour Type:</span>
                <span className="text-slate-950 font-bold capitalize">{initialData?.tourType || "Cultural"}</span>
              </div>
              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Price:</span>
                <span className="text-slate-950 font-black text-sm text-emerald-800">${(initialData?.priceUSD || 0).toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          {initialData?.shortDesc && (
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block text-xs">Tour Overview:</span>
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
                  <span className="font-bold text-slate-900 block text-xs mb-1">Route / Area Map:</span>
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

interface DeleteTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tourTitle?: string;
  isDeleting?: boolean;
  error?: string | null;
}

export function DeleteTourModal({
  isOpen,
  onClose,
  onConfirm,
  tourTitle,
  isDeleting = false,
  error = null,
}: DeleteTourModalProps) {
  return (
    <AdminConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Tour Package"
      description={`Are you sure you want to delete "${tourTitle}"? This action cannot be undone.`}
      confirmText="Delete Tour"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
      error={error}
    />
  );
}
