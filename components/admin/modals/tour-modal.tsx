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
} from "lucide-react";
import { PackageItem, CategoryType, TourType, TripDifficulty, PackageStatus } from "@/lib/admin-data";
import { CategoryService } from "@/lib/services/admin-service";
import { tourSchema, TourFormValues } from "@/lib/admin-schemas";
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

type TabType = "general" | "inclusions" | "faqs" | "reviews" | "media" | "seo";

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
      faqs: [],
      reviews: [],
    },
  });

  const watchTitle = watch("title");
  const watchMetaDesc = watch("metaDescription");
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

  const tabs: { id: TabType; label: string; icon: any; count?: number }[] = [
    { id: "general", label: "General & Specs", icon: Info },
    { id: "inclusions", label: "Inclusions & Exclusions", icon: CheckCircle2 },
    { id: "faqs", label: "Tour FAQs", icon: HelpCircle, count: watchFaqs.length },
    { id: "reviews", label: "Client Reviews", icon: MessageSquareQuote, count: watchReviews.length },
    { id: "media", label: "Media & Cover", icon: ImageIcon },
    { id: "seo", label: "SEO & Search", icon: Search },
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

                <div className="col-span-2">
                  <AdminTextareaField
                    label="Short Overview Description"
                    required
                    rows={3}
                    placeholder="Summary of the tour highlights, heritage stops, and bespoke comforts..."
                    error={errors.shortDesc?.message}
                    {...register("shortDesc")}
                  />
                </div>
              </div>
            )}

            {/* 2. INCLUSIONS & EXCLUSIONS TAB */}
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
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="font-extrabold text-slate-950 text-xs block">
                    Google Search Preview Snippet
                  </span>
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1">
                    <div className="text-xs font-bold text-emerald-800 truncate">
                      https://alpineace.com/tours/
                      {watchTitle
                        ? watchTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                        : "tour-slug"}
                    </div>
                    <div className="text-sm font-extrabold text-blue-700 truncate hover:underline cursor-pointer">
                      {watchTitle
                        ? `${watchTitle} | Alpine Ace Luxury Sightseeing`
                        : "Tour Package Title Preview"}
                    </div>
                    <div className="text-xs text-slate-800 font-semibold line-clamp-2 leading-relaxed">
                      {watchMetaDesc || "Brief summary for search engine indexing..."}
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
                  placeholder="e.g. Nepal Tours, Kathmandu Sightseeing, Luxury Heli Tour, Pokhara Resorts"
                  {...register("keywords")}
                />
              </div>
            )}
          </form>
        </div>
      ) : (
        /* READ-ONLY VIEW MODE */
        <div className="space-y-4 py-2 text-xs max-h-[500px] overflow-y-auto pr-1">
          {/* Header Card */}
          <div className="grid grid-cols-3 gap-4">
            <div className="aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden col-span-1 relative flex items-center justify-center">
              {initialData?.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={initialData?.image}
                  alt={initialData?.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Compass className="w-8 h-8 text-slate-300" />
              )}
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Destination:</span>
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
                  {initialData?.transportation || "—"}
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
                  {initialData?.tourType ? initialData.tourType.replace(/_/g, " ") : "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-600 font-semibold block text-[11px]">Status:</span>
                <div className="mt-0.5">
                  <AdminStatusBadge status={initialData?.status || "active"} />
                </div>
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
              <span className="text-slate-900 font-bold truncate block">{initialData?.accommodation || "—"}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Meals Plan</span>
              <span className="text-slate-900 font-bold truncate block">{initialData?.meals || "—"}</span>
            </div>
          </div>

          {/* Short Description */}
          {initialData?.shortDesc && (
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">Short Overview:</span>
              <p className="text-slate-800 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-200">
                {initialData.shortDesc}
              </p>
            </div>
          )}

          {/* Permits & Highlights */}
          <div className="space-y-1">
            <span className="font-bold text-slate-900 block">Inclusions &amp; Permits:</span>
            <div className="flex flex-wrap gap-1.5">
              {initialData?.permitsRequired && initialData.permitsRequired.length > 0 ? (
                initialData.permitsRequired.map((p, i) => (
                  <span
                    key={i}
                    className="bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded text-amber-900 font-semibold"
                  >
                    {p}
                  </span>
                ))
              ) : (
                <span className="text-slate-400">None specified</span>
              )}
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          {(initialData?.inclusionsText || initialData?.exclusionsText) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
