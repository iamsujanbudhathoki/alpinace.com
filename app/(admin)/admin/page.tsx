"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Mountain,
  FileCheck,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import {
  mockDashboardMetrics,
  mockBookings,
  mockPackages,
  Booking,
  PackageItem,
} from "@/lib/admin-data";
import { DashboardService, BookingService, ExpeditionService } from "@/lib/services/admin-service";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminStatsCard } from "@/components/admin/ui/admin-stats-card";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import {
  AdminTable,
  AdminTableHeader,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
  AdminTableLoading,
} from "@/components/admin/ui/admin-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(mockDashboardMetrics);
  const [recentBookings, setRecentBookings] = useState<Booking[]>(mockBookings.slice(0, 5));
  const [topExpeditions, setTopExpeditions] = useState<PackageItem[]>(mockPackages.slice(0, 3));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashData, bookingsData, expeditionsData] = await Promise.all([
          DashboardService.getMetrics(),
          BookingService.getAll(),
          ExpeditionService.getAll(),
        ]);

        if (dashData) {
          setMetrics(dashData);
        }
        if (Array.isArray(bookingsData) && bookingsData.length > 0) {
          setRecentBookings(bookingsData.slice(0, 5));
        }
        if (Array.isArray(expeditionsData) && expeditionsData.length > 0) {
          setTopExpeditions(expeditionsData.slice(0, 3));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <AdminPageHeader
        title="Dashboard Overview"
        description="AlpineAce mountaineering, treks, and permit operational status."
      >
        <Link href="/admin/treks">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Manage Treks
          </Button>
        </Link>
        <Link href="/admin/bookings">
          <Button
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
          >
            View Bookings
          </Button>
        </Link>
      </AdminPageHeader>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 bg-white border-slate-200 shadow-none rounded-xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28 bg-slate-200/60" />
                <Skeleton className="w-8 h-8 rounded-lg bg-slate-200/60 shrink-0" />
              </div>
              <div className="space-y-2 pt-1">
                <Skeleton className="h-7 w-20 bg-slate-200/60" />
                <Skeleton className="h-3.5 w-32 bg-slate-200/60" />
              </div>
            </Card>
          ))
        ) : (
          <>
            <AdminStatsCard
              label="Total Revenue"
              value={`$${metrics.totalRevenueUSD.toLocaleString()}`}
              trendText={`+${metrics.revenueChangePercent}% vs last season`}
              trendType="positive"
              icon={DollarSign}
            />

            <AdminStatsCard
              label="Active Expeditions"
              value={`${metrics.activeExpeditions}`}
              subtext={`${metrics.climbersOnMountain} climbers on peak`}
              icon={Mountain}
            />

            <AdminStatsCard
              label="Pending Bookings"
              value={`${metrics.pendingBookings}`}
              trendText="Requires guide assignment"
              trendType="warning"
              icon={Clock}
            />

            <AdminStatsCard
              label="Permits Processing"
              value={`${metrics.timsPermitsProcessing}`}
              subtext="TIMS & Sagarmatha clearances"
              icon={FileCheck}
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Bookings</h2>
                <p className="text-xs text-slate-500 font-normal">Latest guest reservations and inquiries</p>
              </div>
              <Link
                href="/admin/bookings"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto pt-1">
              <AdminTable>
                <AdminTableHeader>
                  <tr>
                    <AdminTableHead className="w-12 text-center">S.N.</AdminTableHead>
                    <AdminTableHead>Guest</AdminTableHead>
                    <AdminTableHead>Package</AdminTableHead>
                    <AdminTableHead>Start Date</AdminTableHead>
                    <AdminTableHead>Amount</AdminTableHead>
                    <AdminTableHead align="right">Status</AdminTableHead>
                  </tr>
                </AdminTableHeader>
                <AdminTableBody>
                  {loading ? (
                    <AdminTableLoading colSpan={6} rows={5} />
                  ) : (
                    recentBookings.map((bkg, idx) => (
                      <AdminTableRow key={bkg.id}>
                        <AdminTableCell className="text-center font-semibold text-slate-500">
                          {idx + 1}
                        </AdminTableCell>
                        <AdminTableCell>
                          <div className="font-semibold text-slate-900 group-hover:text-slate-950 transition-colors">
                            {bkg.guestName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal">{bkg.reference} • {bkg.country}</div>
                        </AdminTableCell>
                        <AdminTableCell className="max-w-[180px] truncate font-medium text-slate-700">
                          {bkg.packageName}
                        </AdminTableCell>
                        <AdminTableCell className="text-slate-600">
                          {bkg.startDate}
                        </AdminTableCell>
                        <AdminTableCell className="font-bold text-slate-900">
                          ${bkg.totalAmountUSD.toLocaleString()}
                        </AdminTableCell>
                        <AdminTableCell align="right">
                          <AdminStatusBadge status={bkg.bookingStatus} />
                        </AdminTableCell>
                      </AdminTableRow>
                    ))
                  )}
                </AdminTableBody>
              </AdminTable>
            </div>
          </div>
        </div>

        {/* Right Column: Active Expeditions Quick View (1 col) */}
        <div className="space-y-6">
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Top Expeditions</h3>
                <p className="text-xs text-slate-500 font-normal">Active mountain packages</p>
              </div>
              <Link href="/admin/expeditions" className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 animate-pulse"
                  >
                    <div className="space-y-2 flex-grow">
                      <Skeleton className="h-4 w-32 bg-slate-200" />
                      <Skeleton className="h-3 w-20 bg-slate-200" />
                    </div>
                    <Skeleton className="h-4 w-12 bg-slate-200 shrink-0" />
                  </div>
                ))
              ) : (
                topExpeditions.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 line-clamp-1">{pkg.title}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{pkg.durationDays} Days • {pkg.maxAltitudeMeters || 6000}m</div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">${pkg.priceUSD}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
