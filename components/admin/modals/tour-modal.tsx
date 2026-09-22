"use client";

import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { Button } from "@/components/ui/button";
import { CategoryType, PackageStatus, TripDifficulty, TripActivity, TourType } from "@/lib/admin-data";
import { TourFormValues, tourSchema } from "@/lib/admin-schemas";
import { CategoryService, ActivityService } from "@/lib/services/admin-service";
import { TourItem } from "@/lib/tour-data";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Loader2,
  MessageSquareQuote,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PackageDetailView } from "./package/view/package-detail-view";
import { PackageBasicInfoTab } from "./package/form/package-basic-info-tab";
import { TourExtraFields } from "./package/fields/tour-extra-fields";
import { PackageItineraryTab } from "./package/form/package-itinerary-tab";
import { PackageInclusionsTab } from "./package/form/package-inclusions-tab";
import { PackageDatesTab } from "./package/form/package-dates-tab";
import { PackageMediaTab } from "./package/form/package-media-tab";
import { PackageFilesTab } from "./package/form/package-files-tab";
import { PackageFaqsReviewsTab } from "./package/form/package-faqs-reviews-tab";
import { PackageSeoTab } from "./package/form/package-seo-tab";

export interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tour: any) => Promise<boolean | void> | boolean | void;
  initialData?: any;
  mode?: "view" | "edit" | "create";
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

export function TourModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "create",
  isEditing,
}: TourModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [editingMode, setEditingMode] = useState<boolean>(
    isEditing !== undefined ? isEditing : mode !== "view"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [tourCategories, setTourCategories] = useState<{ label: string; value: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ label: string; value: string }[]>([]);
  const [availableActivities, setAvailableActivities] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingSubcats, setIsLoadingSubcats] = useState(false);

  useEffect(() => {
    setEditingMode(isEditing !== undefined ? isEditing : mode !== "view");
    setActiveTab("general");
  }, [mode, isEditing, isOpen]);


  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitted, isDirty },
  } = useForm<TourFormValues>({
    resolver: zodResolver(tourSchema) as any,
    defaultValues: {
      title: "",
      categoryId: "",
      subcategoryId: "",
      activityIds: [],
      region: "",
      country: "Nepal",
      activity: TripActivity.CULTURAL_SIGHTSEEING,
      tourType: TourType.CULTURAL_HERITAGE,
      transportation: "",
      durationDays: 1,
      maxAltitudeMeters: 1400,
      difficulty: TripDifficulty.EASY,
      priceUSD: 100,
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
    },
  });

  const watchItinerary = watch("itinerary") || [];
  const watchDepartureDates = watch("departureDates") || [];
  const watchGalleryImages = watch("galleryImages") || [];
  const watchPackageFiles = watch("packageFiles") || [];
  const watchFaqs = watch("faqs") || [];
  const watchReviews = watch("reviews") || [];
  const selectedCategoryId = watch("categoryId");

  // Fetch Tour domain parent categories and activities
  useEffect(() => {
    if (isOpen) {
      CategoryService.getAdminParents(CategoryType.TOURS).then((cats) => {
        if (cats && cats.length > 0) {
          setTourCategories(cats.map((c) => ({ label: c.name, value: c.id })));
        } else {
          setTourCategories([]);
        }
      });
      ActivityService.getAll({ limit: 100 }).then((res) => {
        const items = Array.isArray(res) ? res : [];
        setAvailableActivities(items.map((a: any) => ({ id: a.id, name: a.name })));
      });
    }
  }, [isOpen]);

  // Dynamically load subcategories
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

  useEffect(() => {
    setFormError(null);
    setIsSubmitting(false);
    if (initialData) {
      const data = initialData as any;
      reset({
        title: data.title,
        categoryId: data.categoryId || "",
        subcategoryId: data.subcategoryId || "",
        activityIds: Array.isArray(data.activityIds) ? data.activityIds : [],
        region: data.region || "",
        country: data.country || "Nepal",
        activity: data.activity || TripActivity.CULTURAL_SIGHTSEEING,
        tourType: data.tourType || TourType.CULTURAL_HERITAGE,
        transportation: data.transportation || "",
        durationDays: data.durationDays,
        maxAltitudeMeters: data.maxAltitudeMeters || 1400,
        difficulty: data.difficulty || TripDifficulty.EASY,
        priceUSD: data.priceUSD,
        bestSeason: data.bestSeason || "",
        status: (data.status as PackageStatus) || PackageStatus.ACTIVE,
        isFeatured: data.isFeatured ?? false,
        isPopular: data.isPopular ?? false,
        startEndLocation: data.startEndLocation || "",
        accommodation: data.accommodation || "",
        meals: data.meals || "",
        groupSizeRange: data.groupSizeRange || "",
        inclusionsText: data.inclusionsText || "",
        exclusionsText: data.exclusionsText || "",
        shortDesc: data.shortDesc || "",
        addonsText: data.addonsText || "",
        usefulInfoText: data.usefulInfoText || "",
        departureDates: Array.isArray(data.departureDates) ? data.departureDates : [],
        galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages : [],
        galleryMediaIds: Array.isArray(data.galleryMediaIds) ? data.galleryMediaIds : [],
        mapImage: data.mapImage || "",
        mapMediaId: data.mapMediaId || "",
        packageFiles: Array.isArray(data.packageFiles) ? data.packageFiles : [],
        groupPricingEnabled: Boolean(data.groupPricingEnabled),
        groupPricing: Array.isArray(data.groupPricing) ? data.groupPricing : [],
        image: data.image || "",
        coverMediaId: data.coverMediaId || "",
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        keywords: data.keywords || "",
        itinerary: Array.isArray(data.itinerary) ? data.itinerary : [],
        faqs: Array.isArray(data.faqs) ? data.faqs : [],
        reviews: Array.isArray(data.reviews) ? data.reviews : [],
      });
    } else {
      reset({
        title: "",
        categoryId: "",
        subcategoryId: "",
        activityIds: [],
        region: "",
        country: "Nepal",
        activity: TripActivity.CULTURAL_SIGHTSEEING,
        tourType: TourType.CULTURAL_HERITAGE,
        transportation: "",
        durationDays: 1,
        maxAltitudeMeters: 1400,
        difficulty: TripDifficulty.EASY,
        priceUSD: 100,
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
      });
    }
  }, [initialData, isOpen, reset]);

  const handleClose = () => {
    if (editingMode && isDirty) {
      if (confirm("You have unsaved changes. Are you sure you want to exit?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const onSubmit = async (values: TourFormValues) => {
    setIsSubmitting(true);
    try {
      const initData = (initialData || {}) as any;
      const tourToSave: TourItem = {
        id: initialData?.id || "",
        title: values.title,
        slug: initialData?.slug || "",
        category: initialData?.category || "Tours",
        categoryId: values.categoryId && values.categoryId.trim() !== "" ? values.categoryId : undefined,
        subcategoryId: values.subcategoryId && values.subcategoryId.trim() !== "" ? values.subcategoryId : undefined,
        activityIds: values.activityIds || [],
        tourType: values.tourType || TourType.CULTURAL_HERITAGE,
        transportation: values.transportation,
        durationDays: Number(values.durationDays) || 0,
        maxAltitudeMeters: Number(values.maxAltitudeMeters) || 0,
        difficulty: values.difficulty || TripDifficulty.EASY,
        priceUSD: Number(values.priceUSD) || 0,
        bestSeason: values.bestSeason || "",
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
        mapImage: values.mapImage,
        packageFiles: values.packageFiles || [],
        image: values.image || "",
        itinerary: values.itinerary || [],
        faqs: values.faqs || [],
        rating: initialData?.rating || 5.0,
        reviewsCount: initialData?.reviewsCount || (values.reviews?.length || 0),
        ...({
          region: (values.region as any) || initData.region || "Kathmandu & Pokhara",
          status: values.status || PackageStatus.ACTIVE,
          isFeatured: values.isFeatured ?? false,
          isPopular: values.isPopular ?? false,
          country: values.country || "Nepal",
          activity: values.activity || TripActivity.CULTURAL_SIGHTSEEING,
          groupPricingEnabled: Boolean(values.groupPricingEnabled),
          groupPricing: values.groupPricing || [],
          galleryMediaIds: values.galleryMediaIds || initData.galleryMediaIds || [],
          mapMediaId: values.mapMediaId || initData.mapMediaId,
          coverMediaId: values.coverMediaId || initData.coverMediaId,
          metaTitle: values.metaTitle,
          metaDescription: values.metaDescription,
          keywords: values.keywords,
          reviews: values.reviews || [],
        } as any),
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
      ? `Edit Tour: ${initialData.title}`
      : `Tour Details: ${initialData.title}`;

  const modalDescription = editingMode
    ? "Configure tour itineraries, luxury transportation, group departures, and gallery media."
    : "Review tour specifications, transportation, gallery, and scheduled departure dates.";

  // Validation error flags for tab badges
  const hasGeneralErrors = isSubmitted && !!(
    errors.title ||
    errors.categoryId ||
    errors.region ||
    errors.durationDays ||
    errors.priceUSD ||
    errors.shortDesc ||
    errors.groupPricing
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
        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" form="tour-form" disabled={isSubmitting}>
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
      <Button variant="outline" onClick={handleClose}>
        Close
      </Button>
      <Button onClick={() => setEditingMode(true)}>
        <Edit className="w-3.5 h-3.5 mr-1 text-amber-400" />
        Edit Tour Package
      </Button>
    </div>
  );

  const tabsNav = editingMode && (
    <div className="flex items-center gap-1 overflow-x-auto pb-0.5 modal-scroll">
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
                  isActive ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-800"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      description={modalDescription}
      subHeader={tabsNav}
      maxWidth="4xl"
      fixedHeight={true}
      footer={editingMode ? editFooter : viewFooter}
    >
      {editingMode ? (
        <div className="space-y-4 py-1">
          {formError && (
            <div className="p-3 mb-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}
          <form id="tour-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 pt-1">
            {activeTab === "general" && (
              <PackageBasicInfoTab
                register={register}
                control={control}
                setValue={setValue}
                watch={watch}
                errors={errors}
                categories={tourCategories}
                subcategories={subcategories}
                isLoadingSubcats={isLoadingSubcats}
                availableActivities={availableActivities}
                editingMode={editingMode}
                titlePlaceholder="e.g. Kathmandu & Pokhara Cultural Heritage Tour"
                extraFields={
                  <TourExtraFields
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                  />
                }
              />
            )}

            {activeTab === "itinerary" && (
              <PackageItineraryTab control={control} errors={errors} />
            )}

            {activeTab === "inclusions" && (
              <PackageInclusionsTab control={control} errors={errors} />
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
                slugPrefix="tours"
                initialSlug={initialData?.slug}
              />
            )}
          </form>
        </div>
      ) : (
        <PackageDetailView
          packageData={initialData}
          availableActivities={availableActivities}
          categorySlugPrefix="tours"
        />
      )}
    </AdminModal>
  );
}

export function DeleteTourModal({
  isOpen,
  onClose,
  onConfirm,
  tourTitle,
  isDeleting = false,
  error = null,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tourTitle?: string;
  isDeleting?: boolean;
  error?: string | null;
}) {
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

export { TourModal as TourFormModal };

