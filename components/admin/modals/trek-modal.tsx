"use client";

import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { Button } from "@/components/ui/button";
import { CategoryType, PackageStatus, TripDifficulty, TripActivity } from "@/lib/admin-data";
import { TrekFormValues, trekSchema } from "@/lib/admin-schemas";
import { CategoryService, ActivityService } from "@/lib/services/admin-service";
import { TrekItem } from "@/lib/trek-data";
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
import { PackageItineraryTab } from "./package/form/package-itinerary-tab";
import { PackageInclusionsTab } from "./package/form/package-inclusions-tab";
import { PackageDatesTab } from "./package/form/package-dates-tab";
import { PackageMediaTab } from "./package/form/package-media-tab";
import { PackageFilesTab } from "./package/form/package-files-tab";
import { PackageFaqsReviewsTab } from "./package/form/package-faqs-reviews-tab";
import { PackageSeoTab } from "./package/form/package-seo-tab";

export interface TrekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trek: any) => Promise<boolean | void> | boolean | void;
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

export function TrekModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "create",
  isEditing,
}: TrekModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [editingMode, setEditingMode] = useState<boolean>(
    isEditing !== undefined ? isEditing : mode !== "view"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [trekCategories, setTrekCategories] = useState<{ label: string; value: string }[]>([]);
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
  } = useForm<TrekFormValues>({
    resolver: zodResolver(trekSchema) as any,
    defaultValues: {
      title: "",
      categoryId: "",
      subcategoryId: "",
      activityIds: [],
      region: "",
      country: "Nepal",
      activity: TripActivity.TREKKING_HIKING,
      durationDays: 1,
      maxAltitudeMeters: 1000,
      difficulty: TripDifficulty.MODERATE,
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

  // Fetch Trekking domain parent categories and activities
  useEffect(() => {
    if (isOpen) {
      CategoryService.getAdminParents(CategoryType.TREKKING).then((cats) => {
        if (cats && cats.length > 0) {
          setTrekCategories(cats.map((c) => ({ label: c.name, value: c.id })));
        } else {
          setTrekCategories([]);
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
      reset({
        title: initialData.title,
        categoryId: initialData.categoryId || "",
        subcategoryId: initialData.subcategoryId || "",
        activityIds: Array.isArray(initialData.activityIds) ? initialData.activityIds : [],
        region: initialData.region,
        country: initialData.country || "",
        activity: initialData.activity || "",
        durationDays: initialData.durationDays,
        maxAltitudeMeters: initialData.maxAltitudeMeters,
        difficulty: initialData.difficulty,
        priceUSD: initialData.priceUSD,
        bestSeason: initialData.bestSeason || "",
        status: (initialData.status as PackageStatus) || PackageStatus.ACTIVE,
        isFeatured: initialData.isFeatured ?? false,
        isPopular: initialData.isPopular ?? false,
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
        categoryId: "",
        subcategoryId: "",
        activityIds: [],
        region: "",
        country: "Nepal",
        activity: TripActivity.TREKKING_HIKING,
        durationDays: 1,
        maxAltitudeMeters: 1000,
        difficulty: TripDifficulty.MODERATE,
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

  const onSubmit = async (values: TrekFormValues) => {
    setIsSubmitting(true);
    try {
      const trekToSave: TrekItem = {
        id: initialData?.id || "",
        title: values.title,
        slug: initialData?.slug || "",
        category: initialData?.category || "Trekking",
        categoryId: values.categoryId && values.categoryId.trim() !== "" ? values.categoryId : undefined,
        subcategoryId: values.subcategoryId && values.subcategoryId.trim() !== "" ? values.subcategoryId : undefined,
        activityIds: values.activityIds || [],
        region: (values.region as any) || (initialData?.region as any) || "Everest",
        durationDays: Number(values.durationDays) || 0,
        maxAltitudeMeters: Number(values.maxAltitudeMeters) || 0,
        difficulty: values.difficulty || TripDifficulty.MODERATE,
        priceUSD: Number(values.priceUSD) || 0,
        bestSeason: values.bestSeason || "",
        status: values.status || PackageStatus.ACTIVE,
        isFeatured: values.isFeatured ?? false,
        isPopular: values.isPopular ?? false,
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
      } else {
        setFormError("Failed to save trek package. Please check form inputs.");
      }
    } catch (err: any) {
      setFormError(err?.message || "Failed to save trek package.");
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
        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" form="trek-form" disabled={isSubmitting}>
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
      <Button variant="outline" onClick={handleClose}>
        Close
      </Button>
      <Button onClick={() => setEditingMode(true)}>
        <Edit className="w-3.5 h-3.5 mr-1 text-amber-400" />
        Edit Trek Package
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
          <form id="trek-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            {activeTab === "general" && (
              <PackageBasicInfoTab
                register={register}
                control={control}
                setValue={setValue}
                watch={watch}
                errors={errors}
                categories={trekCategories}
                subcategories={subcategories}
                isLoadingSubcats={isLoadingSubcats}
                availableActivities={availableActivities}
                editingMode={editingMode}
                titlePlaceholder="e.g. Annapurna Sanctuary Luxury Lodge Trek"
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
                slugPrefix="trekking"
                initialSlug={initialData?.slug}
              />
            )}
          </form>
        </div>
      ) : (
        <PackageDetailView
          packageData={initialData}
          availableActivities={availableActivities}
          categorySlugPrefix="trekking"
        />
      )}
    </AdminModal>
  );
}

export function DeleteTrekModal({
  isOpen,
  onClose,
  onConfirm,
  trekTitle,
  isDeleting = false,
  error = null,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  trekTitle?: string;
  isDeleting?: boolean;
  error?: string | null;
}) {
  return (
    <AdminConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Trek Itinerary"
      description={`Are you sure you want to delete "${trekTitle}"? This action cannot be undone.`}
      confirmText="Delete Trek"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
      error={error}
    />
  );
}

export { TrekModal as TrekFormModal };

