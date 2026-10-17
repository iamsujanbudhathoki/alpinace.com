"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Save,
  Loader2,
  Info,
  Calendar,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  FileText,
  MessageSquareQuote,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  CategoryType,
  PackageStatus,
  TripDifficulty,
  TripActivity,
  TourType,
  ClimbingGrade,
} from "@/lib/admin-data";
import type {
  PackageItem,
  PackageAddonItem,
  TripDepartureDate,
  TripPackageFile,
  GroupPricingTier,
} from "@/lib/admin-data";
import type { TrekItem } from "@/lib/trek-data";
import {
  trekSchema,
  tourSchema,
  expeditionSchema,
} from "@/lib/admin-schemas";
import { CategoryService, ActivityService } from "@/lib/services/admin-service";
import { PackageBasicInfoTab } from "@/components/admin/modals/package/form/package-basic-info-tab";
import { PackageItineraryTab } from "@/components/admin/modals/package/form/package-itinerary-tab";
import { PackageInclusionsTab } from "@/components/admin/modals/package/form/package-inclusions-tab";
import { PackageAddonsTab } from "@/components/admin/modals/package/form/package-addons-tab";
import { PackageDatesTab } from "@/components/admin/modals/package/form/package-dates-tab";
import { PackageMediaTab } from "@/components/admin/modals/package/form/package-media-tab";
import { PackageFilesTab } from "@/components/admin/modals/package/form/package-files-tab";
import { PackageFaqsReviewsTab } from "@/components/admin/modals/package/form/package-faqs-reviews-tab";
import { PackageSeoTab } from "@/components/admin/modals/package/form/package-seo-tab";
import { TourExtraFields } from "@/components/admin/modals/package/fields/tour-extra-fields";
import { ExpeditionExtraFields } from "@/components/admin/modals/package/fields/expedition-extra-fields";

export type PackageFormType = "trek" | "tour" | "expedition";

export interface PackageFormRecord {
  id?: string;
  title?: string;
  slug?: string;
  category?: string;
  categoryId?: string;
  subcategoryId?: string;
  activityIds?: string[];
  categorySlug?: string;
  region?: string;
  durationDays?: number;
  maxAltitudeMeters?: number;
  difficulty?: TripDifficulty;
  priceUSD?: number;
  status?: PackageStatus;
  isFeatured?: boolean;
  isPopular?: boolean;
  totalBookings?: number;
  rating?: number;
  reviewsCount?: number;
  image?: string;
  coverMediaId?: string;
  country?: string;
  activity?: string;
  shortDesc?: string;
  bestSeason?: string;
  startEndLocation?: string;
  accommodation?: string;
  meals?: string;
  groupSizeRange?: string;
  inclusionsText?: string;
  exclusionsText?: string;
  addonsText?: string;
  addons?: PackageAddonItem[];
  usefulInfoText?: string;
  departureDates?: TripDepartureDate[];
  groupPricingEnabled?: boolean;
  groupPricing?: GroupPricingTier[];
  galleryImages?: string[];
  galleryMediaIds?: string[];
  mapImage?: string;
  mapMediaId?: string;
  packageFiles?: TripPackageFile[];
  itinerary?: Array<{
    day: number;
    title: string;
    description: string;
    maxAltitude?: string;
    accommodation?: string;
    meals?: string;
    details?: Array<{ label: string; value: string }>;
  }>;
  faqs?: Array<{ question: string; answer: string }>;
  reviews?: Array<{
    id?: string;
    author: string;
    country: string;
    date?: string;
    rating: number;
    avatar?: string;
    content: string;
  }>;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  tourType?: TourType;
  transportation?: string;
  peakHeightM?: number;
  climbingGrade?: ClimbingGrade;
  sherpaGuideRatio?: string;
  oxygenRequired?: boolean;
}

export type PackageInitialData =
  | TrekItem
  | PackageItem
  | PackageFormRecord
  | Record<string, unknown>;

export interface PackageAdminFormProps {
  packageType: PackageFormType;
  initialData?: PackageInitialData | null;
  isEdit?: boolean;
  onSubmit: (data: Record<string, unknown>) => Promise<boolean | void>;
  isSubmitting?: boolean;
}

type TabType =
  | "general"
  | "itinerary"
  | "inclusions"
  | "addons"
  | "departures"
  | "media"
  | "files"
  | "faqs"
  | "seo";

const TAB_ORDER: TabType[] = [
  "general",
  "itinerary",
  "inclusions",
  "addons",
  "departures",
  "media",
  "files",
  "faqs",
  "seo",
];


export function PackageAdminForm({
  packageType,
  initialData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}: PackageAdminFormProps) {
  const router = useRouter();
  const raw = useMemo(() => (initialData || {}) as PackageFormRecord, [initialData]);
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ label: string; value: string }[]>([]);
  const [availableActivities, setAvailableActivities] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingSubcats, setIsLoadingSubcats] = useState(false);

  // Configuration per package type
  const config = useMemo(() => {
    return {
      trek: {
        title: isEdit ? "Edit Trek Package" : "Create New Trek Package",
        listHref: "/admin/treks",
        listLabel: "Treks",
        categoryDomain: CategoryType.TREKKING,
        slugPrefix: "trekking",
        schema: trekSchema,
        defaultActivity: TripActivity.TREKKING_HIKING,
        defaultDifficulty: TripDifficulty.MODERATE,
        defaultDuration: 7,
        defaultAltitude: 3800,
        defaultPrice: 950,
        titlePlaceholder: "e.g. Annapurna Sanctuary & Circuit Luxury Trek",
        regions: [
          { label: "Everest", value: "Everest" },
          { label: "Annapurna", value: "Annapurna" },
          { label: "Langtang", value: "Langtang" },
          { label: "Manaslu", value: "Manaslu" },
          { label: "Khumbu", value: "Khumbu" },
          { label: "Kathmandu & Pokhara", value: "Kathmandu & Pokhara" },
          { label: "Mustang", value: "Mustang" },
          { label: "Dolpo", value: "Dolpo" },
        ],
      },
      tour: {
        title: isEdit ? "Edit Tour Package" : "Create New Tour Package",
        listHref: "/admin/tours",
        listLabel: "Tours",
        categoryDomain: CategoryType.TOURS,
        slugPrefix: "tours",
        schema: tourSchema,
        defaultActivity: TripActivity.CULTURAL_SIGHTSEEING,
        defaultDifficulty: TripDifficulty.EASY,
        defaultDuration: 5,
        defaultAltitude: 1400,
        defaultPrice: 650,
        titlePlaceholder: "e.g. Kathmandu Heritage & Chitwan Wildlife Safari Tour",
        regions: [
          { label: "Kathmandu Valley", value: "Kathmandu Valley" },
          { label: "Pokhara", value: "Pokhara" },
          { label: "Chitwan", value: "Chitwan" },
          { label: "Lumbini", value: "Lumbini" },
          { label: "Nagarkot & Dhulikhel", value: "Nagarkot & Dhulikhel" },
          { label: "Bandipur", value: "Bandipur" },
          { label: "Mustang & Trans-Himalayan", value: "Mustang & Trans-Himalayan" },
        ],
      },
      expedition: {
        title: isEdit ? "Edit Expedition Package" : "Create New Expedition Package",
        listHref: "/admin/expeditions",
        listLabel: "Expeditions",
        categoryDomain: CategoryType.EXPEDITIONS,
        slugPrefix: "expeditions",
        schema: expeditionSchema,
        defaultActivity: TripActivity.PEAK_CLIMBING,
        defaultDifficulty: TripDifficulty.EXTREME,
        defaultDuration: 18,
        defaultAltitude: 6500,
        defaultPrice: 3200,
        titlePlaceholder: "e.g. Mount Everest 8848m South Col Summit Expedition",
        regions: [
          { label: "Everest", value: "Everest" },
          { label: "Annapurna", value: "Annapurna" },
          { label: "Dhaulagiri", value: "Dhaulagiri" },
          { label: "Makalu", value: "Makalu" },
          { label: "Manaslu", value: "Manaslu" },
          { label: "Kanchenjunga", value: "Kanchenjunga" },
          { label: "Cho Oyu", value: "Cho Oyu" },
          { label: "Lhotse", value: "Lhotse" },
        ],
      },
    }[packageType];
  }, [packageType, isEdit]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitted, isDirty },
  } = useForm<FieldValues>({
    resolver: zodResolver(config.schema) as unknown as Resolver<FieldValues>,
    defaultValues: {
      title: "",
      categoryId: "",
      subcategoryId: "",
      activityIds: [],
      region: config.regions[0]?.value || "Everest",
      country: "Nepal",
      activity: config.defaultActivity,
      durationDays: config.defaultDuration,
      maxAltitudeMeters: config.defaultAltitude,
      difficulty: config.defaultDifficulty,
      priceUSD: config.defaultPrice,
      bestSeason: "",
      status: PackageStatus.ACTIVE,
      isFeatured: false,
      isPopular: false,
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
      groupPricingEnabled: false,
      groupPricing: [],
      image: "",
      coverMediaId: "",
      metaTitle: "",
      metaDescription: "",
      keywords: "",
      itinerary: [],
      faqs: [],
      reviews: [],
      addons: [],
      ...(packageType === "tour"
        ? {
            tourType: TourType.CULTURAL_HERITAGE,
            transportation: "",
          }
        : {}),
      ...(packageType === "expedition"
        ? {
            peakHeightM: 6500,
            climbingGrade: ClimbingGrade.TECHNICAL_ALPINE_GRADE,
            sherpaGuideRatio: "1:1 Dedicated Sherpa",
            oxygenRequired: false,
          }
        : {}),
    },
  });

  const watchStatus = watch("status") || PackageStatus.ACTIVE;
  const watchItinerary = watch("itinerary") || [];
  const watchDepartureDates = watch("departureDates") || [];
  const watchGalleryImages = watch("galleryImages") || [];
  const watchPackageFiles = watch("packageFiles") || [];
  const watchFaqs = watch("faqs") || [];
  const watchReviews = watch("reviews") || [];
  const watchAddons = watch("addons") || [];
  const selectedCategoryId = watch("categoryId");

  // Prevent accidental navigation when form has unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Load Categories & Activities
  useEffect(() => {
    CategoryService.getAdminParents(config.categoryDomain).then((cats) => {
      if (cats && cats.length > 0) {
        setCategories(cats.map((c) => ({ label: c.name, value: c.id })));
      } else {
        setCategories([]);
      }
    });

    ActivityService.getAll({ limit: 100 }).then((res) => {
      const items = Array.isArray(res) ? res : [];
      setAvailableActivities(items.map((a: { id: string; name: string }) => ({ id: a.id, name: a.name })));
    });
  }, [config.categoryDomain]);

  // Load Subcategories dynamically when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      setIsLoadingSubcats(true);
      CategoryService.getAdminSubcategories(selectedCategoryId).then((subs) => {
        if (subs && subs.length > 0) {
          setSubcategories(subs.map((s) => ({ label: s.name, value: s.id })));
        } else {
          setSubcategories([]);
        }
        setIsLoadingSubcats(false);
      });
    } else {
      setSubcategories([]);
      setIsLoadingSubcats(false);
    }
  }, [selectedCategoryId]);

  // Populate data when editing
  useEffect(() => {
    if (initialData) {
      reset({
        title: raw.title || "",
        categoryId: raw.categoryId || "",
        subcategoryId: raw.subcategoryId || "",
        activityIds: Array.isArray(raw.activityIds) ? raw.activityIds : [],
        region: raw.region || config.regions[0]?.value || "Everest",
        country: raw.country || "Nepal",
        activity: raw.activity || config.defaultActivity,
        durationDays: raw.durationDays !== undefined ? raw.durationDays : config.defaultDuration,
        maxAltitudeMeters:
          raw.maxAltitudeMeters !== undefined && raw.maxAltitudeMeters !== null
            ? raw.maxAltitudeMeters
            : raw.peakHeightM || config.defaultAltitude,
        difficulty: raw.difficulty || config.defaultDifficulty,
        priceUSD: raw.priceUSD !== undefined ? raw.priceUSD : config.defaultPrice,
        bestSeason: raw.bestSeason || "",
        status: (raw.status as PackageStatus) || PackageStatus.ACTIVE,
        isFeatured: raw.isFeatured ?? false,
        isPopular: raw.isPopular ?? false,
        startEndLocation: raw.startEndLocation || "",
        accommodation: raw.accommodation || "",
        meals: raw.meals || "",
        groupSizeRange: raw.groupSizeRange || "",
        inclusionsText: raw.inclusionsText || "",
        exclusionsText: raw.exclusionsText || "",
        shortDesc: raw.shortDesc || "",
        addonsText: raw.addonsText || "",
        usefulInfoText: raw.usefulInfoText || "",
        departureDates: Array.isArray(raw.departureDates) ? raw.departureDates : [],
        galleryImages: Array.isArray(raw.galleryImages) ? raw.galleryImages : [],
        galleryMediaIds: Array.isArray(raw.galleryMediaIds) ? raw.galleryMediaIds : [],
        mapImage: raw.mapImage || "",
        mapMediaId: raw.mapMediaId || "",
        packageFiles: Array.isArray(raw.packageFiles) ? raw.packageFiles : [],
        groupPricingEnabled: Boolean(raw.groupPricingEnabled),
        groupPricing: Array.isArray(raw.groupPricing) ? raw.groupPricing : [],
        image: raw.image || "",
        coverMediaId: raw.coverMediaId || "",
        metaTitle: raw.metaTitle || "",
        metaDescription: raw.metaDescription || "",
        keywords: raw.keywords || "",
        itinerary: Array.isArray(raw.itinerary) ? raw.itinerary : [],
        faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
        reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
        addons: Array.isArray(raw.addons) ? raw.addons : [],
        ...(packageType === "tour"
          ? {
              tourType: raw.tourType || TourType.CULTURAL_HERITAGE,
              transportation: raw.transportation || "",
            }
          : {}),
        ...(packageType === "expedition"
          ? {
              peakHeightM: raw.peakHeightM !== undefined ? raw.peakHeightM : 6500,
              climbingGrade: raw.climbingGrade || ClimbingGrade.TECHNICAL_ALPINE_GRADE,
              sherpaGuideRatio: raw.sherpaGuideRatio || "1:1 Dedicated Sherpa",
              oxygenRequired: raw.oxygenRequired ?? false,
            }
          : {}),
      });
    }
  }, [initialData, raw, reset, config, packageType]);

  // Tab error validation flags
  const hasGeneralErrors = isSubmitted && !!(
    errors.title ||
    errors.categoryId ||
    errors.region ||
    errors.durationDays ||
    errors.priceUSD ||
    errors.shortDesc ||
    errors.groupPricing ||
    errors.tourType ||
    errors.transportation ||
    errors.peakHeightM ||
    errors.climbingGrade
  );

  const hasItineraryErrors = isSubmitted && !!(
    errors.itinerary &&
    (Array.isArray(errors.itinerary) ? errors.itinerary.some(Boolean) : true)
  );

  const hasInclusionsErrors = isSubmitted && !!(errors.inclusionsText || errors.exclusionsText || errors.usefulInfoText);
  const hasAddonErrors = isSubmitted && !!(errors.addons || errors.addonsText);
  const hasFaqErrors = isSubmitted && !!errors.faqs;
  const hasReviewErrors = isSubmitted && !!errors.reviews;
  const hasMediaErrors = isSubmitted && !!errors.image;
  const hasSeoErrors = isSubmitted && !!(errors.metaTitle || errors.metaDescription || errors.keywords);

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; count?: number; hasError?: boolean }[] = [
    { id: "general", label: "General", icon: Info, hasError: hasGeneralErrors },
    { id: "itinerary", label: "Itinerary", icon: Calendar, count: watchItinerary.length, hasError: hasItineraryErrors },
    { id: "inclusions", label: "Inclusions", icon: CheckCircle2, hasError: hasInclusionsErrors },
    { id: "addons", label: "Add-ons", icon: Sparkles, count: watchAddons.length, hasError: hasAddonErrors },
    { id: "departures", label: "Dates", icon: Clock, count: watchDepartureDates.length },
    { id: "media", label: "Media", icon: ImageIcon, count: watchGalleryImages.length, hasError: hasMediaErrors },
    { id: "files", label: "Documents", icon: FileText, count: watchPackageFiles.length },
    { id: "faqs", label: "FAQs & Reviews", icon: MessageSquareQuote, count: watchFaqs.length + watchReviews.length, hasError: hasFaqErrors || hasReviewErrors },
    { id: "seo", label: "SEO", icon: Search, hasError: hasSeoErrors },
  ];

  const currentTabIndex = TAB_ORDER.indexOf(activeTab);
  const prevTab = currentTabIndex > 0 ? TAB_ORDER[currentTabIndex - 1] : null;
  const nextTab = currentTabIndex < TAB_ORDER.length - 1 ? TAB_ORDER[currentTabIndex + 1] : null;

  // Handles switching tab to where the first error occurred
  const onFormInvalid = (formErrors: Record<string, unknown>) => {
    toast.error("Please complete all required fields before saving.");
    if (
      formErrors.title ||
      formErrors.categoryId ||
      formErrors.region ||
      formErrors.durationDays ||
      formErrors.priceUSD ||
      formErrors.shortDesc ||
      formErrors.groupPricing ||
      formErrors.tourType ||
      formErrors.transportation ||
      formErrors.peakHeightM ||
      formErrors.climbingGrade
    ) {
      setActiveTab("general");
    } else if (formErrors.itinerary) {
      setActiveTab("itinerary");
    } else if (formErrors.inclusionsText || formErrors.exclusionsText || formErrors.usefulInfoText) {
      setActiveTab("inclusions");
    } else if (formErrors.addons || formErrors.addonsText) {
      setActiveTab("addons");
    } else if (formErrors.image) {
      setActiveTab("media");
    } else if (formErrors.faqs || formErrors.reviews) {
      setActiveTab("faqs");
    } else if (formErrors.metaTitle || formErrors.metaDescription || formErrors.keywords) {
      setActiveTab("seo");
    }
  };

  const onFormSubmit = async (values: Record<string, unknown>) => {
    setFormError(null);
    setLocalSubmitting(true);
    try {
      const packageToSave: Record<string, unknown> = {
        id: raw.id || "",
        title: values.title,
        slug: raw.slug || "",
        category: raw.category || (packageType === "trek" ? "Trekking" : packageType === "tour" ? "Tour" : "Expedition"),
        categoryId: typeof values.categoryId === "string" && values.categoryId.trim() !== "" ? values.categoryId : undefined,
        subcategoryId: typeof values.subcategoryId === "string" && values.subcategoryId.trim() !== "" ? values.subcategoryId : undefined,
        activityIds: values.activityIds || [],
        region: values.region || raw.region || config.regions[0]?.value || "Everest",
        country: values.country || "Nepal",
        activity: values.activity || config.defaultActivity,
        durationDays: Number(values.durationDays) || 0,
        maxAltitudeMeters: Number(values.maxAltitudeMeters) || 0,
        difficulty: values.difficulty || config.defaultDifficulty,
        priceUSD: Number(values.priceUSD) || 0,
        bestSeason: values.bestSeason || "",
        status: values.status || PackageStatus.ACTIVE,
        isFeatured: values.isFeatured ?? false,
        isPopular: values.isPopular ?? false,
        startEndLocation: values.startEndLocation || "",
        accommodation: values.accommodation || "",
        meals: values.meals || "",
        groupSizeRange: values.groupSizeRange || "",
        inclusionsText: values.inclusionsText || "",
        exclusionsText: values.exclusionsText || "",
        shortDesc: values.shortDesc || "",
        addonsText: values.addonsText || "",
        addons: values.addons || [],
        usefulInfoText: values.usefulInfoText || "",
        departureDates: values.departureDates || [],
        galleryImages: values.galleryImages || [],
        galleryMediaIds: values.galleryMediaIds || raw.galleryMediaIds || [],
        mapImage: values.mapImage || "",
        mapMediaId: values.mapMediaId || (raw.mapMediaId ? raw.mapMediaId : undefined),
        packageFiles: values.packageFiles || [],
        groupPricingEnabled: Boolean(values.groupPricingEnabled),
        groupPricing: values.groupPricing || [],
        image: values.image || "",
        coverMediaId: values.coverMediaId || (raw.coverMediaId ? raw.coverMediaId : undefined),
        metaTitle: values.metaTitle || "",
        metaDescription: values.metaDescription || "",
        keywords: values.keywords || "",
        itinerary: values.itinerary || [],
        faqs: values.faqs || [],
        reviews: values.reviews || [],
        rating: raw.rating || 5.0,
        reviewsCount: raw.reviewsCount || (Array.isArray(values.reviews) ? values.reviews.length : 0),
        ...(packageType === "tour"
          ? {
              tourType: values.tourType,
              transportation: values.transportation,
            }
          : {}),
        ...(packageType === "expedition"
          ? {
              peakHeightM: Number(values.peakHeightM) || Number(values.maxAltitudeMeters) || 0,
              climbingGrade: values.climbingGrade,
              sherpaGuideRatio: values.sherpaGuideRatio,
              oxygenRequired: Boolean(values.oxygenRequired),
            }
          : {}),
      };

      const success = await onSubmit(packageToSave);
      if (success === false) {
        setFormError("Failed to save package. Please verify required fields and try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred while saving.";
      setFormError(msg);
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    if (!isDirty || confirm("You have unsaved changes. Are you sure you want to discard them?")) {
      router.push(config.listHref);
    }
  };

  const loading = isSubmitting || localSubmitting;

  return (
    <div className="space-y-6 pb-16">
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancelClick}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title={`Back to ${config.listLabel}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Link
                  href={config.listHref}
                  onClick={(e) => {
                    if (isDirty && !confirm("You have unsaved changes. Are you sure you want to leave?")) {
                      e.preventDefault();
                    }
                  }}
                  className="hover:text-slate-900 transition-colors"
                >
                  {config.listLabel}
                </Link>
                <span>/</span>
                <span className="text-slate-800 font-bold">{isEdit ? "Edit Package" : "Create Package"}</span>
                {isDirty && (
                  <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Unsaved
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                {isEdit && raw.title ? raw.title : config.title}
                {isEdit && Boolean(raw.slug) && (
                  <a
                    href={`/${config.slugPrefix}/${raw.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-600 transition-colors text-xs font-normal flex items-center gap-1"
                    title="View public package page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-end">
            {/* Status Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-xs font-bold text-slate-600">Status:</span>
              <select
                value={watchStatus}
                onChange={(e) => setValue("status", e.target.value as PackageStatus, { shouldDirty: true })}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-hidden cursor-pointer"
              >
                <option value={PackageStatus.ACTIVE}>Active</option>
                <option value={PackageStatus.DRAFT}>Draft</option>
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={handleCancelClick}
              className="cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form="package-full-form"
              size="sm"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Save className="w-4 h-4 text-amber-400" />
                  Save Package
                </span>
              )}
            </Button>
          </div>
        </div>

        {formError && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-slate-100 modal-scroll">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isTabError = tab.hasError;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : isTabError
                      ? "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                      : "bg-slate-100/80 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-amber-400" : isTabError ? "text-rose-500" : "text-slate-500"
                  }`}
                />
                <span>{tab.label}</span>
                {isTabError && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
                {tab.count !== undefined && tab.count > 0 && !isTabError && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Body Container */}
      <form id="package-full-form" onSubmit={handleSubmit(onFormSubmit, onFormInvalid)}>
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-8 space-y-6">
          {/* Active Tab Heading */}
          <div className="border-b border-slate-100 pb-3 mb-6 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{tabs.find((t) => t.id === activeTab)?.label}</span>
            </h2>
            <div className="text-xs font-semibold text-slate-400">
              {currentTabIndex + 1} of {TAB_ORDER.length}
            </div>
          </div>

          {activeTab === "general" && (
            <PackageBasicInfoTab
              register={register}
              control={control}
              setValue={setValue}
              watch={watch}
              errors={errors}
              categories={categories}
              subcategories={subcategories}
              isLoadingSubcats={isLoadingSubcats}
              availableActivities={availableActivities}
              editingMode={true}
              regionOptions={config.regions}
              titlePlaceholder={config.titlePlaceholder}
              extraFields={
                packageType === "tour" ? (
                  <TourExtraFields
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                  />
                ) : packageType === "expedition" ? (
                  <ExpeditionExtraFields
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                  />
                ) : undefined
              }
            />
          )}

          {activeTab === "itinerary" && (
            <PackageItineraryTab control={control} errors={errors} />
          )}

          {activeTab === "inclusions" && (
            <PackageInclusionsTab control={control} errors={errors} />
          )}

          {activeTab === "addons" && (
            <PackageAddonsTab control={control} />
          )}

          {activeTab === "departures" && (
            <PackageDatesTab control={control} watch={watch} />
          )}

          {activeTab === "media" && (
            <PackageMediaTab
              register={register}
              control={control}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />
          )}

          {activeTab === "files" && <PackageFilesTab control={control} />}

          {activeTab === "faqs" && (
            <PackageFaqsReviewsTab control={control} errors={errors} />
          )}

          {activeTab === "seo" && (
            <PackageSeoTab
              register={register}
              watch={watch}
              errors={errors}
              slugPrefix={config.slugPrefix}
              initialSlug={raw.slug}
            />
          )}
        </div>
      </form>

      {/* Bottom Step Navigation Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          {prevTab ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab(prevTab)}
              className="cursor-pointer text-slate-700 font-semibold"
            >
              <ChevronLeft className="w-4 h-4 mr-1 text-slate-500" />
              Previous
            </Button>
          ) : (
            <div />
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {nextTab && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab(nextTab)}
              className="cursor-pointer font-semibold text-slate-800"
            >
              Next: {tabs.find((t) => t.id === nextTab)?.label}
              <ChevronRight className="w-4 h-4 ml-1 text-slate-500" />
            </Button>
          )}

          <Button
            type="submit"
            form="package-full-form"
            size="sm"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer shadow-xs"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="w-4 h-4 text-amber-400" />
                Save Package
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
