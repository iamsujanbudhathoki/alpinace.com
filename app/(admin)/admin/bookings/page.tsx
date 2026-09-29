"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Download, Plus, Tag, ExternalLink, Workflow, GitBranch, Loader2, ShieldAlert, Ban } from "lucide-react";
import {
  Booking,
  BookingStep,
  BookingStepStatus,
  BookingPackageType,
  BookingPaymentStatus,
  PackageItem,
} from "@/lib/admin-data";
import { TrekItem } from "@/lib/trek-data";
import { toast } from "sonner";
import { BookingService, TrekService, TourService, ExpeditionService } from "@/lib/services/admin-service";
import { ApiResponse } from "@/lib/services/api-client";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminInlineSelect, InlineSelectOption } from "@/components/admin/ui/admin-inline-select";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { BookingFormModal, DeleteBookingModal } from "@/components/admin/modals/booking-modal";
import { BookingStatusFlowModal } from "@/components/admin/modals/booking-status-flow-modal";
import { AdminFilterSelect } from "@/components/admin/forms/admin-form-fields";
import { Button } from "@/components/ui/button";
import {
  AdminTableContainer,
  AdminTable,
  AdminTableHeader,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableLoading,
  AdminTableActions,
  AdminActionButton,
  AdminTablePagination,
} from "@/components/admin/ui/admin-table";

const CATEGORY_OPTIONS: InlineSelectOption[] = [
  { value: BookingPackageType.TREKKING, label: "Trekking", icon: <Tag className="w-3 h-3 opacity-70" /> },
  { value: BookingPackageType.EXPEDITION, label: "Expedition", icon: <Tag className="w-3 h-3 opacity-70" /> },
  { value: BookingPackageType.TOUR, label: "Tour", icon: <Tag className="w-3 h-3 opacity-70" /> },
];

const PAYMENT_OPTIONS: InlineSelectOption[] = [
  { value: BookingPaymentStatus.PAID, label: "Paid" },
  { value: BookingPaymentStatus.DEPOSIT_PAID, label: "Deposit Paid" },
  { value: BookingPaymentStatus.PENDING, label: "Pending" },
  { value: BookingPaymentStatus.REFUNDED, label: "Refunded" },
];

const STEP_STATUS_FILTER_OPTIONS: InlineSelectOption[] = [
  { value: BookingStepStatus.COMPLETED, label: "Completed" },
  { value: BookingStepStatus.IN_PROGRESS, label: "In Progress" },
  { value: BookingStepStatus.ACTIVE, label: "Active" },
  { value: BookingStepStatus.PENDING, label: "Pending" },
  { value: BookingStepStatus.CANCELLED, label: "Cancelled" },
  { value: BookingStepStatus.FRAUD, label: "Fraud / Spam" },
];

const STAGE_NAMES = ["Request Received", "In Review", "Confirmed", "Active", "Completed"];

interface StatusTabItem {
  key: string;
  label: string;
}

const STATUS_TABS: StatusTabItem[] = [
  { key: "All", label: "All Bookings" },
  { key: "request_received", label: "Request Received" },
  { key: "in_review", label: "In Review" },
  { key: "confirmed", label: "Confirmed" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "fraud", label: "Fraud / Spam" },
];

function getBookingWorkflowSummary(steps?: BookingStep[]) {
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return {
      activeStepNumber: 1,
      activeStepName: "Request Received",
      stageKey: "request_received",
      activeStatus: BookingStepStatus.PENDING,
      isCancelled: false,
      isFraud: false,
      completedCount: 0,
      note: "",
    };
  }

  const isFraud = steps.some((s) => s.status === BookingStepStatus.FRAUD);
  if (isFraud) {
    const fraudStep = steps.find((s) => s.status === BookingStepStatus.FRAUD);
    return {
      activeStepNumber: 0,
      activeStepName: "Fraud / Spam",
      stageKey: "fraud",
      activeStatus: BookingStepStatus.FRAUD,
      isCancelled: false,
      isFraud: true,
      note: fraudStep?.message || "",
      completedCount: 0,
    };
  }

  const isCancelled = steps.some((s) => s.status === BookingStepStatus.CANCELLED);
  if (isCancelled) {
    const cancelStep = steps.find((s) => s.status === BookingStepStatus.CANCELLED);
    return {
      activeStepNumber: 0,
      activeStepName: "Cancelled",
      stageKey: "cancelled",
      activeStatus: BookingStepStatus.CANCELLED,
      isCancelled: true,
      isFraud: false,
      note: cancelStep?.message || "",
      completedCount: 0,
    };
  }

  const completedCount = steps.filter((s) => s.status === BookingStepStatus.COMPLETED).length;
  if (completedCount >= 5) {
    return {
      activeStepNumber: 5,
      activeStepName: "Completed",
      stageKey: "completed",
      activeStatus: BookingStepStatus.COMPLETED,
      isCancelled: false,
      isFraud: false,
      completedCount: 5,
      note: steps[4]?.message || "",
    };
  }

  const activeIdx = steps.findIndex(
    (s) =>
      s.status !== BookingStepStatus.COMPLETED &&
      s.status !== BookingStepStatus.CANCELLED &&
      s.status !== BookingStepStatus.FRAUD
  );
  const idx = activeIdx >= 0 ? activeIdx : 0;
  const STAGE_KEYS = ["request_received", "in_review", "confirmed", "active", "completed"];

  return {
    activeStepNumber: idx + 1,
    activeStepName: STAGE_NAMES[idx] || `Step ${idx + 1}`,
    stageKey: STAGE_KEYS[idx] || "request_received",
    activeStatus: steps[idx]?.status || BookingStepStatus.PENDING,
    isCancelled: false,
    isFraud: false,
    completedCount,
    note: steps[idx]?.message || "",
  };
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [treks, setTreks] = useState<TrekItem[]>([]);
  const [tours, setTours] = useState<PackageItem[]>([]);
  const [expeditions, setExpeditions] = useState<PackageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedPayment, setSelectedPayment] = useState<string>("All");
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    All: 0,
    request_received: 0,
    in_review: 0,
    confirmed: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    fraud: 0,
  });
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [statusFlowBooking, setStatusFlowBooking] = useState<Booking | null>(null);

  // Load package options for links/modals
  useEffect(() => {
    async function loadPackages() {
      try {
        const [treksData, toursData, expeditionsData] = await Promise.all([
          TrekService.getAll(),
          TourService.getAll(),
          ExpeditionService.getAll(),
        ]);
        setTreks(treksData);
        setTours(toursData);
        setExpeditions(expeditionsData);
      } catch (err) {
        console.error("Failed to load packages for bookings:", err);
      }
    }
    loadPackages();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page to 1 on filter or search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedStatus, selectedType, selectedPayment]);

  // Load status counts from backend
  const loadStatusCounts = async () => {
    try {
      const res = await BookingService.getStatusCounts(
        selectedType === "All" ? undefined : selectedType
      );
      if (res?.success && res.data) {
        setStatusCounts(res.data);
      }
    } catch (err) {
      console.error("Failed to load status counts:", err);
    }
  };

  useEffect(() => {
    loadStatusCounts();
  }, [selectedType]);

  // Load bookings from backend
  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await BookingService.getAll({
        search: debouncedSearch,
        status: selectedStatus === "All" ? undefined : selectedStatus,
        packageType: selectedType === "All" ? undefined : selectedType,
        paymentStatus: selectedPayment === "All" ? undefined : selectedPayment,
        page,
        limit,
      });
      setBookings(data);
      if (data.pagination) {
        setTotalItems(data.pagination.count);
        setTotalPages(data.pagination.lastPage);
      } else {
        setTotalItems(data.length);
        setTotalPages(Math.max(1, Math.ceil(data.length / limit)));
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [debouncedSearch, selectedStatus, selectedType, selectedPayment, page, limit]);

  const searchParams = useSearchParams();
  const targetId = searchParams?.get("id") || searchParams?.get("viewId");

  // Auto-open modal when targetId is in query params & remove targetId from URL
  useEffect(() => {
    if (targetId && bookings.length > 0) {
      const match = bookings.find((b) => b.id === targetId || b.reference === targetId);
      if (match) {
        setActiveBooking(match);
        setIsEditing(false);
        setIsFormOpen(true);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }
  }, [targetId, bookings]);

  const getPackageLink = (bkg: Booking) => {
    if (bkg.packageType === BookingPackageType.TREKKING) {
      const match = treks.find((t) => t.title.toLowerCase() === bkg.packageName.toLowerCase());
      return match ? `/admin/treks?viewId=${match.id}` : `/admin/treks`;
    } else if (bkg.packageType === BookingPackageType.EXPEDITION) {
      const match = expeditions.find((e) => e.title.toLowerCase() === bkg.packageName.toLowerCase());
      return match ? `/admin/expeditions?viewId=${match.id}` : `/admin/expeditions`;
    } else {
      const match = tours.find((t) => t.title.toLowerCase() === bkg.packageName.toLowerCase());
      return match ? `/admin/tours?viewId=${match.id}` : `/admin/tours`;
    }
  };

  const handleSaveBooking = async (savedBooking: Booking): Promise<boolean> => {
    try {
      let res: ApiResponse<Booking>;
      if (isEditing && activeBooking) {
        res = await BookingService.update(activeBooking.id, savedBooking as any);
      } else {
        res = await BookingService.create({
          ...savedBooking,
          cfTurnstileToken: 'ADMIN_BYPASS',
        } as any);
      }
      if (res.success) {
        toast.success(res.message || "Booking saved successfully");
        setIsFormOpen(false);
        await loadBookings();
        loadStatusCounts();
        return true;
      } else {
        toast.error(res.message || "Failed to save booking");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
      return false;
    }
  };

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePromptDelete = (booking: Booking) => {
    setDeletingBooking(booking);
    setDeleteError(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteError(null);
    setIsDeleting(false);
    setDeletingBooking(null);
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await BookingService.delete(id);
      if (res.success) {
        toast.success(res.message || "Booking deleted successfully");
        handleCloseDeleteModal();
        await loadBookings();
        loadStatusCounts();
      } else {
        const msg = res.message || "Failed to delete booking";
        setDeleteError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || "Failed to delete booking";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInlinePaymentChange = async (bkg: Booking, newPayment: string) => {
    try {
      const res = await BookingService.update(bkg.id, {
        paymentStatus: newPayment as BookingPaymentStatus,
      });
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bkg.id ? { ...b, paymentStatus: newPayment as BookingPaymentStatus } : b
          )
        );
        toast.success(`Payment status for ${bkg.reference} updated to ${newPayment}`);
        loadStatusCounts();
      } else {
        toast.error(res.message || "Failed to update payment");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update payment");
    }
  };

  const handleInlineCategoryChange = async (bkg: Booking, newCategory: string) => {
    try {
      const res = await BookingService.update(bkg.id, {
        packageType: newCategory as BookingPackageType,
      });
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bkg.id ? { ...b, packageType: newCategory as BookingPackageType } : b
          )
        );
        toast.success(`Category for ${bkg.reference} updated to ${newCategory}`);
        loadStatusCounts();
      } else {
        toast.error(res.message || "Failed to update category");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update category");
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      toast.info("Preparing complete bookings export...");
      await BookingService.exportCsv({
        search: debouncedSearch,
        status: selectedStatus === "All" ? undefined : selectedStatus,
        packageType: selectedType === "All" ? undefined : selectedType,
        paymentStatus: selectedPayment === "All" ? undefined : selectedPayment,
      });
      toast.success("All matching bookings exported successfully");
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error(err.message || "Failed to export bookings CSV");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Bookings & Reservations"
        description="Manage guest reservations, expedition permits, and mountain guide assignments."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={isExporting}
          className="text-xs font-semibold cursor-pointer border-slate-200"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-slate-600" />
          ) : (
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
          )}
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setActiveBooking(null);
            setIsEditing(true);
            setIsFormOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Booking
        </Button>
      </AdminPageHeader>

      {/* Status Tabs Navigation Bar (Tab-based filter) */}
      <div className="border-b border-slate-200 dark:border-slate-800 -mb-2">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none pb-0">
          {STATUS_TABS.map((tab) => {
            const isActive = selectedStatus === tab.key;
            const count = statusCounts[tab.key] ?? 0;
            const formattedCount = count < 10 && count > 0 ? `0${count}` : `${count}`;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedStatus(tab.key)}
                className={`group relative flex items-center gap-2 px-3 sm:px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-all cursor-pointer font-medium ${
                  isActive
                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] rounded-full transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 font-medium"
                  }`}
                >
                  {formattedCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar Component */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter guest, ref, or package..."
      >
        <AdminFilterSelect
          label="Category:"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value={BookingPackageType.TREKKING}>Trekking</option>
          <option value={BookingPackageType.EXPEDITION}>Expedition</option>
          <option value={BookingPackageType.TOUR}>Tour</option>
        </AdminFilterSelect>

        <AdminFilterSelect
          label="Payment:"
          value={selectedPayment}
          onChange={(e) => setSelectedPayment(e.target.value)}
        >
          <option value="All">All Payments</option>
          <option value={BookingPaymentStatus.PAID}>Paid</option>
          <option value={BookingPaymentStatus.DEPOSIT_PAID}>Deposit Paid</option>
          <option value={BookingPaymentStatus.PENDING}>Pending</option>
          <option value={BookingPaymentStatus.REFUNDED}>Refunded</option>
        </AdminFilterSelect>

        {(searchQuery || selectedType !== "All" || selectedPayment !== "All" || selectedStatus !== "All") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedType("All");
              setSelectedPayment("All");
              setSelectedStatus("All");
            }}
            className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer h-9 px-2.5"
          >
            Clear Filters
          </Button>
        )}
      </AdminFilterBar>

      {/* Bookings Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead className="w-14 text-center">S.N.</AdminTableHead>
              <AdminTableHead>Ref / Guest</AdminTableHead>
              <AdminTableHead>Trip Package</AdminTableHead>
              <AdminTableHead>Category</AdminTableHead>
              <AdminTableHead>Dates &amp; Group</AdminTableHead>
              <AdminTableHead>Total Amount</AdminTableHead>
              <AdminTableHead>Payment</AdminTableHead>
              <AdminTableHead>Workflow Steps</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <AdminTableLoading colSpan={9} rows={limit > 10 ? 10 : limit} />
            ) : bookings.length > 0 ? (
              bookings.map((bkg, idx) => {
                const serialNumber = (page - 1) * limit + idx + 1;
                return (
                  <AdminTableRow key={bkg.id}>
                    <AdminTableCell className="text-center font-semibold text-slate-500">
                      {serialNumber}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="text-xs font-mono font-bold text-slate-700">{bkg.reference}</div>
                      <div className="font-semibold text-slate-900">{bkg.guestName}</div>
                      <div className="text-xs text-slate-500 font-normal">{bkg.country}</div>
                    </AdminTableCell>
                    <AdminTableCell className="max-w-xs">
                      <Link
                        href={getPackageLink(bkg)}
                        className="group inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-slate-950 transition-colors max-w-full"
                        title={`Open "${bkg.packageName}" in package manager`}
                      >
                        <span className="truncate underline decoration-transparent group-hover:decoration-slate-400 underline-offset-2 transition-all">
                          {bkg.packageName}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                      </Link>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminInlineSelect
                        value={bkg.packageType}
                        options={CATEGORY_OPTIONS}
                        onChange={(newVal) => handleInlineCategoryChange(bkg, newVal)}
                        variant="category"
                        title="Click to change booking category"
                      />
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="font-medium text-slate-900">{bkg.startDate} &rarr; {bkg.endDate}</div>
                      <div className="text-xs text-slate-600 font-normal">{bkg.groupSize} {bkg.groupSize === 1 ? "Guest" : "Guests"}</div>
                    </AdminTableCell>
                    <AdminTableCell className="font-bold text-slate-900 text-sm">
                      ${bkg.totalAmountUSD.toLocaleString()} USD
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminInlineSelect
                        value={bkg.paymentStatus}
                        options={PAYMENT_OPTIONS}
                        onChange={(newVal) => handleInlinePaymentChange(bkg, newVal)}
                        variant="badge"
                        title="Click to change payment status"
                      />
                    </AdminTableCell>
                    <AdminTableCell>
                      {(() => {
                        const summary = getBookingWorkflowSummary(bkg.steps);
                        const isFraud = summary.isFraud;
                        const isCancelled = summary.isCancelled;

                        return (
                          <button
                            type="button"
                            onClick={() => setStatusFlowBooking(bkg)}
                            className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs transition-colors cursor-pointer group text-left"
                            title="Click to view & manage booking workflow"
                          >
                            <span
                              className={`font-semibold ${
                                isFraud
                                  ? "text-red-700"
                                  : isCancelled
                                  ? "text-rose-700"
                                  : "text-slate-900"
                              }`}
                            >
                              {isFraud
                                ? "Fraud / Spam"
                                : isCancelled
                                ? "Cancelled"
                                : `${summary.activeStepNumber}. ${summary.activeStepName}`}
                            </span>

                            <AdminStatusBadge
                              status={
                                isFraud
                                  ? "fraud"
                                  : isCancelled
                                  ? "cancelled"
                                  : summary.activeStatus
                              }
                            />

                            <Workflow className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 ml-0.5" />
                          </button>
                        );
                      })()}
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <AdminTableActions>
                        <AdminActionButton
                          icon={<Workflow className="w-3.5 h-3.5 text-slate-600" />}
                          onClick={() => setStatusFlowBooking(bkg)}
                          title="Manage Status Workflow"
                        />
                        <AdminActionButton
                          variant="view"
                          onClick={() => {
                            setActiveBooking(bkg);
                            setIsEditing(false);
                            setIsFormOpen(true);
                          }}
                          title="View Booking"
                        />
                        <AdminActionButton
                          variant="edit"
                          onClick={() => {
                            setActiveBooking(bkg);
                            setIsEditing(true);
                            setIsFormOpen(true);
                          }}
                          title="Edit Booking"
                        />
                        <AdminActionButton
                          variant="delete"
                          onClick={() => setDeletingBooking(bkg)}
                          title="Delete Booking"
                        />
                      </AdminTableActions>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            ) : (
              <AdminTableEmpty
                colSpan={9}
                title="No bookings found"
                description="No client booking records match your search query or status filter."
              />
            )}
          </AdminTableBody>
        </AdminTable>
        <AdminTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={limit}
          onPageChange={setPage}
          onPageSizeChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </AdminTableContainer>

      {/* MODALS */}
      <BookingFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveBooking}
        initialData={activeBooking}
        isEditing={isEditing}
      />

      <DeleteBookingModal
        isOpen={deletingBooking !== null}
        onClose={handleCloseDeleteModal}
        onConfirm={() => deletingBooking && handleDeleteBooking(deletingBooking.id)}
        bookingRef={deletingBooking?.reference}
        guestName={deletingBooking?.guestName}
        isDeleting={isDeleting}
        error={deleteError}
      />

      <BookingStatusFlowModal
        isOpen={Boolean(statusFlowBooking)}
        onClose={() => setStatusFlowBooking(null)}
        booking={statusFlowBooking}
        onStatusUpdated={(updated) => {
          setBookings((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
          );
          setStatusFlowBooking(updated);
          loadStatusCounts();
        }}
      />
    </div>
  );
}
