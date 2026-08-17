"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Edit,
  Image as ImageIcon,
  Search,
  Info,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquareQuote,
  Car,
  Compass,
  MapPin,
  Clock,
  Users,
  Utensils,
  BedDouble,
  Star,
  Sparkles,
  Calendar,
  Globe,
  ExternalLink,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
import { PackageItem, CategoryType, TourType, TripDifficulty, PackageStatus } from "@/lib/admin-data";
import { CategoryService, MediaService } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";
import { tourSchema, TourFormValues } from "@/lib/admin-schemas";
import { AppRichTextEditor } from "@/components/admin/rich-text/rich-text-editor";
import {
  AdminInputField,
  AdminSelectField,
  AdminTextareaField,
} from "@/components/admin/forms/admin-form-fields";
import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload";
import {
  TripFaqsManager,
  TripReviewsManager,
  TripFaqItem,
  TripReviewItem,
} from "@/components/admin/forms/trip-faqs-reviews-fields";
import { TripItineraryManager } from "@/components/admin/forms/trip-itinerary-manager";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";

interface TourFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tour: PackageItem) => Promise<boolean | void> | boolean | void;
  initialData?: PackageItem | null;
  isEditing?: boolean;
}

type TabType = "general" | "itinerary" | "inclusions" | "faqs" | "reviews" | "media" | "seo";

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
      permitsText: "",
      inclusionsText: "",
      exclusionsText: "",
      shortDesc: "",
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

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        categoryId: initialData.categoryId || "",
        region: initialData.region,
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
        permitsText: initialData.permitsRequired ? initialData.permitsRequired.join(", ") : "",
        inclusionsText: initialData.inclusionsText || "",
        exclusionsText: initialData.exclusionsText || "",
        itinerary: Array.isArray(initialData.itinerary) ? initialData.itinerary : [],
        shortDesc: initialData.shortDesc || "",
        image: initialData.image || "",
        metaTitle: initialData.metaTitle || "",
        metaDescription: initialData.metaDescription || "",
        keywords: initialData.keywords || "",
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
        permitsText: "",
        inclusionsText: "",
        exclusionsText: "",
        itinerary: [],
        shortDesc: "",
        image: "",
        metaTitle: "",
        metaDescription: "",
        keywords: "",
        faqs: [],
        reviews: [],
      });
    }
    setEditingMode(isEditing || !initialData);
    setActiveTab("general");
  }, [initialData, isEditing, isOpen, reset, tourCategories]);

  const onSubmit = async (values: TourFormValues) => {
    setIsSubmitting(true);
    try {
      const permitsArray = (values.permitsText || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const tourToSave: PackageItem = {
        id: initialData?.id || "",
        title: values.title,
        slug: initialData?.slug || "",
        category: initialData?.category || "Tour",
        categoryId: values.categoryId && values.categoryId.trim() !== "" ? values.categoryId : undefined,
        region: values.region || (initialData?.region as any) || "Kathmandu & Pokhara",
        tourType: values.tourType,
        transportation: values.transportation,
        difficulty: values.difficulty || TripDifficulty.EASY,
        bestSeason: values.bestSeason || "",
        durationDays: Number(values.durationDays) || 0,
        maxAltitudeMeters: Number(values.maxAltitudeMeters) || 0,
        priceUSD: Number(values.priceUSD) || 0,
        status: values.status || PackageStatus.ACTIVE,
        startEndLocation: values.startEndLocation,
        accommodation: values.accommodation,
        meals: values.meals,
        groupSizeRange: values.groupSizeRange,
        permitsRequired: permitsArray,
        inclusionsText: values.inclusionsText,
        exclusionsText: values.exclusionsText,
        itinerary: values.itinerary || [],
        shortDesc: values.shortDesc || "",
        image: values.image || "",
        metaTitle: values.metaTitle,
        metaDescription: values.metaDescription,
        keywords: values.keywords,
        faqs: values.faqs || [],
        reviews: values.reviews || [],
        totalBookings: initialData?.totalBookings || 0,
        rating: initialData?.rating || 5.0,
        reviewsCount: initialData?.reviewsCount || (values.reviews?.length || 0),
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
    ? "Configure tour specifications, transportation, inclusions, FAQs, customer reviews, and SEO."
    : editingMode
    ? "Modify tour attributes, transportation specs, FAQs, and metadata."
    : "Tour package details and inclusions.";

  const hasGeneralErrors = !!(
    errors.title ||
    errors.categoryId ||
    errors.region ||
    errors.tourType ||
    errors.transportation ||
    errors.durationDays ||
    errors.maxAltitudeMeters ||
    errors.difficulty ||
    errors.priceUSD ||
    errors.status ||
    errors.shortDesc
  );
  const hasItineraryErrors = !!(
    errors.itinerary &&
    (Array.isArray(errors.itinerary) ? errors.itinerary.some(Boolean) : true)
  );
  const hasInclusionsErrors = !!(errors.inclusionsText || errors.exclusionsText);
  const hasFaqErrors = !!(errors.faqs);
  const hasReviewErrors = !!(errors.reviews);
  const hasMediaErrors = !!(errors.image);
  const hasSeoErrors = !!(errors.metaTitle || errors.metaDescription || errors.keywords);

  const tabs: { id: TabType; label: string; icon: any; count?: number; hasError?: boolean }[] = [
    { id: "general", label: "General & Specs", icon: Info, hasError: hasGeneralErrors },
    { id: "itinerary", label: "Detailed Itinerary", icon: Calendar, count: watchItinerary.length, hasError: hasItineraryErrors },
    { id: "inclusions", label: "Inclusions & Exclusions", icon: CheckCircle2, hasError: hasInclusionsErrors },
    { id: "faqs", label: "Tour FAQs", icon: HelpCircle, count: watchFaqs.length, hasError: hasFaqErrors },
    { id: "reviews", label: "Client Reviews", icon: MessageSquareQuote, count: watchReviews.length, hasError: hasReviewErrors },
    { id: "media", label: "Media & Cover", icon: ImageIcon, hasError: hasMediaErrors },
    { id: "seo", label: "SEO & Search", icon: Search, hasError: hasSeoErrors },
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
        Edit Tour Package
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      description={modalDescription}
      maxWidth="3xl"
      footer={editingMode ? editFooter : viewFooter}
    >
      {editingMode ? (
        <div className="space-y-4 py-1 text-xs">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
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

          <form id="tour-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            {/* 1. GENERAL & SPECS TAB */}
            {activeTab === "general" && (
              <div className="grid grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                <div className="col-span-2 sm:col-span-1">
                  <AdminInputField
                    label="Tour Package Title"
                    required
                    placeholder="e.g. Kathmandu Heritage & Pokhara Heli Tour"
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

                <div>
                  <AdminSelectField
                    label="Tour Style / Type"
                    required
                    error={errors.tourType?.message}
                    options={[
                      { label: "Cultural Heritage Tour", value: TourType.CULTURAL_HERITAGE },
                      { label: "Luxury & Wellness Tour", value: TourType.LUXURY_WELLNESS },
                      { label: "Wildlife & Safari Tour", value: TourType.WILDLIFE_SAFARI },
                      { label: "Helicopter Mountain Tour", value: TourType.HELICOPTER_TOUR },
                      { label: "Day Sightseeing Tour", value: TourType.DAY_TOUR },
                      { label: "Custom Private Tour", value: TourType.OTHER },
                    ]}
                    {...register("tourType")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Transportation Mode"
                    placeholder="e.g. Private Luxury SUV / Heli Charter"
                    error={errors.transportation?.message}
                    {...register("transportation")}
                  />
                </div>

                <div>
                  <AdminSelectField
                    label="Region / Destination"
                    required
                    error={errors.region?.message}
                    options={[
                      { label: "Kathmandu & Pokhara", value: "Kathmandu & Pokhara" },
                      { label: "Everest", value: "Everest" },
                      { label: "Annapurna", value: "Annapurna" },
                      { label: "Langtang", value: "Langtang" },
                      { label: "Manaslu", value: "Manaslu" },
                      { label: "Khumbu", value: "Khumbu" },
                    ]}
                    {...register("region")}
                  />
                </div>

                <div>
                  <AdminSelectField
                    label="Difficulty / Pace"
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
                    label="Duration (Days)"
                    type="number"
                    required
                    error={errors.durationDays?.message}
                    {...register("durationDays")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Max Altitude (Meters)"
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
                    placeholder="e.g. Year-round, best Oct - May"
                    error={errors.bestSeason?.message}
                    {...register("bestSeason")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Group Size Range"
                    placeholder="e.g. 2 - 10 Guests"
                    {...register("groupSizeRange")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Start & End Location"
                    placeholder="e.g. Kathmandu to Pokhara"
                    {...register("startEndLocation")}
                  />
                </div>

                <div>
                  <AdminInputField
                    label="Accommodation Type"
                    placeholder="e.g. 5-Star Luxury Resort & Heritage Hotels"
                    {...register("accommodation")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminInputField
                    label="Meals Plan"
                    placeholder="e.g. All Breakfasts & Welcome/Farewell Dinners Included"
                    {...register("meals")}
                  />
                </div>

                <div className="col-span-2">
                  <AdminInputField
                    label="Key Inclusions & Permits (Comma Separated)"
                    required
                    placeholder="e.g. UNESCO Monuments Entry Fees, Private Transport, TIMS"
                    error={errors.permitsText?.message}
                    {...register("permitsText")}
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
                        placeholder="Detailed marketing overview, heritage stops, and bespoke comforts..."
                        height="260px"
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
              </div>
            )}

            {/* 2. DETAILED ITINERARY TAB */}
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
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>What&apos;s Included in Tour Package</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Enter included luxury transport, licensed local guide, museum entry tickets, and hotel stays.
                  </p>
                  <textarea
                    rows={4}
                    placeholder="e.g. Private Air-Conditioned Vehicle, UNESCO Heritage Site Entry Fees, 5-Star Hotel Accommodations, Certified Cultural Historian Guide"
                    className="w-full text-xs bg-white border border-emerald-200 rounded-lg p-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    {...register("inclusionsText")}
                  />
                </div>

                <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-rose-900 font-bold">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>What&apos;s Excluded from Tour Package</span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Enter personal expenses, tips, and optional activities not covered in standard booking.
                  </p>
                  <textarea
                    rows={4}
                    placeholder="e.g. International Airfare, Personal Shopping & Souvenirs, Alcoholic Drinks, Discretionary Driver & Guide Tips"
                    className="w-full text-xs bg-white border border-rose-200 rounded-lg p-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    {...register("exclusionsText")}
                  />
                </div>
              </div>
            )}

            {/* 3. TOUR FAQS TAB */}
            {activeTab === "faqs" && (
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
            )}

            {/* 4. CLIENT REVIEWS TAB */}
            {activeTab === "reviews" && (
              <Controller
                name="reviews"
                control={control}
                render={({ field }) => (
                  <TripReviewsManager
                    reviews={field.value || []}
                    onChange={(newRevs: TripReviewItem[]) => field.onChange(newRevs)}
                  />
                )}
              />
            )}

            {/* 5. MEDIA TAB */}
            {activeTab === "media" && (
              <div className="space-y-4">
                <Controller
                  name="image"
                  control={control}
                  render={({ field }) => (
                    <AdminImageUpload
                      label="Tour Cover Image"
                      value={field.value || ""}
                      onChange={field.onChange}
                      error={errors.image?.message}
                    />
                  )}
                />
              </div>
            )}

            {/* 6. SEO TAB */}
            {activeTab === "seo" && (
              <div className="space-y-5 max-h-[460px] overflow-y-auto pr-1">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-950 text-xs flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      Live Google Search SERP Preview
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Marketing Page Dynamic Synced
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="text-xs font-bold text-emerald-800 truncate flex items-center gap-1">
                      <span>https://alpineace.com/tours/</span>
                      <span className="font-semibold text-emerald-700">
                        {watchTitle
                          ? watchTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                          : "tour-slug"}
                      </span>
                    </div>

                    <div className="text-sm font-extrabold text-blue-700 truncate hover:underline cursor-pointer">
                      {watchMetaTitle?.trim() ||
                        (watchTitle
                          ? `${watchTitle} - ${watchDuration ? `${watchDuration} Days ` : ""}Himalayan Tour | AlpineAce`
                          : "Tour Package Title Preview | AlpineAce")}
                    </div>

                    <div className="text-xs text-slate-800 font-semibold line-clamp-2 leading-relaxed">
                      {watchMetaDesc?.trim() ||
                        watchShortDesc?.trim() ||
                        "Experience luxury guided culture, wildlife safari, and scenic helicopter tours in Nepal with AlpineAce."}
                    </div>

                    {watchKeywords && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1 items-center">
                        <span className="text-[10px] font-bold text-slate-500 mr-1">Target Keywords:</span>
                        {watchKeywords.split(",").map((kw, i) => kw.trim() && (
                          <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {kw.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Meta Search Title Tag
                    </label>
                    <span className={`text-[10px] font-semibold ${
                      (watchMetaTitle?.length || 0) > 60
                        ? "text-rose-600"
                        : (watchMetaTitle?.length || 0) >= 30
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}>
                      {watchMetaTitle?.length || 0} / 60 characters
                    </span>
                  </div>
                  <AdminInputField
                    placeholder="e.g. Kathmandu Heritage & Pokhara Luxury Heli Tour | Alpine Ace"
                    {...register("metaTitle")}
                  />
                  <p className="text-[10px] text-slate-700 font-medium">
                    Recommended: 40-60 characters. Overrides the automated page title tag.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Meta Search Description Snippet
                    </label>
                    <span className={`text-[10px] font-semibold ${
                      (watchMetaDesc?.length || 0) > 160
                        ? "text-rose-600"
                        : (watchMetaDesc?.length || 0) >= 120
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}>
                      {watchMetaDesc?.length || 0} / 160 characters
                    </span>
                  </div>
                  <AdminTextareaField
                    rows={3}
                    placeholder="Compelling 150-character summary for Google search result snippets and social media previews..."
                    {...register("metaDescription")}
                  />
                  <p className="text-[10px] text-slate-700 font-medium">
                    Recommended: 120-160 characters. If left empty, short description is used automatically.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Focus SEO Keywords (Comma Separated)
                  </label>
                  <AdminInputField
                    placeholder="e.g. Nepal Tours, Kathmandu Sightseeing, Luxury Heli Tour, Pokhara Resorts"
                    {...register("keywords")}
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      ) : (
        /* READ-ONLY VIEW MODE */
        <div className="space-y-4 py-2 text-xs max-h-[520px] overflow-y-auto pr-1">
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      openSingleImage(initialData.image!, initialData.title, e.currentTarget);
                    }
                  }}
                  className="w-full h-full cursor-zoom-in relative"
                  title="Click to view cover image in lightbox"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
                <Compass className="w-8 h-8 text-slate-300" />
              )}
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="col-span-2 pb-1 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Public Marketing Route
                  </span>
                  <Link
                    href={`/tours/${initialData?.slug}`}
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
                <span className="text-slate-600 font-semibold block text-[11px]">Region / Location:</span>
                <span className="text-slate-950 font-bold flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  {initialData?.region || "—"}
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
                <span className="text-slate-600 font-semibold block text-[11px]">Transportation:</span>
                <span className="text-slate-950 font-bold flex items-center gap-1 mt-0.5 truncate">
                  <Car className="w-3.5 h-3.5 text-emerald-500" />
                  {initialData?.transportation || "Private AC Vehicle / Heli"}
                </span>
              </div>
              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Price:</span>
                <span className="text-slate-950 font-black text-sm text-emerald-800">
                  ${(initialData?.priceUSD || 0).toLocaleString()} USD
                </span>
              </div>
              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Tour Style:</span>
                <span className="text-slate-950 font-bold capitalize">
                  {initialData?.tourType ? initialData.tourType.replace(/_/g, " ") : "Cultural & Luxury"}
                </span>
              </div>
              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Start &amp; End:</span>
                <span className="text-slate-950 font-bold truncate block">
                  {initialData?.startEndLocation || "Kathmandu to Kathmandu"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Details Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Best Season</span>
              <span className="text-slate-900 font-bold">{initialData?.bestSeason || "All Year Round"}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Group Size</span>
              <span className="text-slate-900 font-bold">{initialData?.groupSizeRange || "2 - 12 Guests"}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Accommodation</span>
              <span className="text-slate-900 font-bold truncate block">{initialData?.accommodation || "4-5 Star Luxury Hotels"}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Meals Plan</span>
              <span className="text-slate-900 font-bold truncate block">{initialData?.meals || "Breakfast & Welcome Dinner"}</span>
            </div>
          </div>

          {/* Short Overview */}
          {initialData?.shortDesc && (
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block text-xs">Marketing Overview &amp; Highlights:</span>
              <div
                className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-normal bg-slate-50 p-3.5 rounded-lg border border-slate-200"
                dangerouslySetInnerHTML={{ __html: initialData.shortDesc }}
              />
            </div>
          )}

          {/* Detailed Day-by-Day Itinerary Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Calendar className="w-4 h-4 text-amber-600" />
                Detailed Itinerary ({initialData?.itinerary?.length || 0} Days)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Sightseeing &amp; travel schedule
              </span>
            </div>

            {initialData?.itinerary && initialData.itinerary.length > 0 ? (
              <div className="space-y-2">
                {initialData.itinerary.map((dayItem, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[11px] shrink-0">
                          Day {dayItem.day || idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">
                          {dayItem.title || `Day ${dayItem.day || idx + 1}`}
                        </h4>
                      </div>

                      {dayItem.maxAltitude && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200 flex items-center gap-1 shrink-0">
                          <Compass className="w-3 h-3 text-emerald-600" />
                          {dayItem.maxAltitude}
                        </span>
                      )}
                    </div>

                    {dayItem.description && (
                      <p className="text-slate-700 text-[11px] leading-relaxed pl-1 border-l-2 border-amber-300">
                        {dayItem.description}
                      </p>
                    )}

                    {(dayItem.accommodation || dayItem.meals) && (
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600 pt-1 border-t border-slate-200/60">
                        {dayItem.accommodation && (
                          <div className="flex items-center gap-1">
                            <BedDouble className="w-3 h-3 text-slate-400" />
                            <span>Stay: <strong>{dayItem.accommodation}</strong></span>
                          </div>
                        )}
                        {dayItem.meals && (
                          <div className="flex items-center gap-1">
                            <Utensils className="w-3 h-3 text-slate-400" />
                            <span>Meals: <strong>{dayItem.meals}</strong></span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                No day-by-day itinerary entries configured yet.
              </div>
            )}
          </div>

          {/* Inclusions & Exclusions */}
          {(initialData?.inclusionsText || initialData?.exclusionsText) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {initialData.inclusionsText && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-1">
                  <span className="font-bold text-emerald-900 text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Inclusions
                  </span>
                  <p className="text-emerald-800 text-[11px] whitespace-pre-line leading-relaxed">
                    {initialData.inclusionsText}
                  </p>
                </div>
              )}
              {initialData.exclusionsText && (
                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80 space-y-1">
                  <span className="font-bold text-rose-900 text-[11px] flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Exclusions
                  </span>
                  <p className="text-rose-800 text-[11px] whitespace-pre-line leading-relaxed">
                    {initialData.exclusionsText}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SEO & Search Engine Preview */}
          <div className="space-y-2 pt-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs pb-1 border-b border-slate-200">
              <Globe className="w-4 h-4 text-blue-600" />
              SEO &amp; Search Engine Meta Information
            </span>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="text-[11px] font-bold text-emerald-800 truncate">
                  https://alpineace.com/tours/{initialData?.slug || "tour-slug"}
                </div>
                <div className="text-xs font-extrabold text-blue-700 truncate hover:underline cursor-pointer">
                  {initialData?.metaTitle || `${initialData?.title} | Alpine Ace Tours`}
                </div>
                <div className="text-[11px] text-slate-700 font-medium line-clamp-2 leading-relaxed">
                  {initialData?.metaDescription || initialData?.shortDesc || "Experience luxury cultural and helicopter tours across Nepal."}
                </div>
              </div>

              {initialData?.keywords && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 pt-1">
                  <span className="font-bold text-slate-800">Keywords:</span>
                  <span className="text-slate-600 font-medium">{initialData.keywords}</span>
                </div>
              )}
            </div>
          </div>

          {/* FAQs & Reviews Summary */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                Custom Tour FAQs ({initialData?.faqs?.length || 0})
              </span>
              <p className="text-[11px] text-slate-600">
                {initialData?.faqs && initialData.faqs.length > 0
                  ? `${initialData.faqs.length} questions configured.`
                  : "No tour FAQs attached."}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Customer Reviews ({initialData?.reviews?.length || 0})
              </span>
              <p className="text-[11px] text-slate-600">
                {initialData?.reviews && initialData.reviews.length > 0
                  ? `${initialData.reviews.length} authentic traveler reviews.`
                  : "No reviews attached."}
              </p>
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

export function DeleteTourModal({
  isOpen,
  onClose,
  onConfirm,
  tourTitle,
}: DeleteTourModalProps) {
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Deletion"
      description={`Are you sure you want to delete "${tourTitle}"? This action cannot be undone.`}
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
            Delete Tour
          </Button>
        </div>
      }
    >
      <div className="text-sm text-slate-700 py-2">
        This will permanently remove the tour package from the active catalogue.
      </div>
    </AdminModal>
  );
}
