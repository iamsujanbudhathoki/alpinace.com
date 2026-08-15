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
            className="bg-white text-slate-950 font-bold border-slate-300"
          >
            Manage Treks
          </Button>
        </Link>
        <Link href="/admin/bookings">
          <Button
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
          >
            View Bookings
          </Button>
        </Link>
      </AdminPageHeader>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="p-5 bg-white border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28 bg-slate-200/60" />
                <Skeleton className="w-9 h-9 rounded-xl bg-slate-200/60 shrink-0" />
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
              iconColorClass="bg-emerald-50 border-emerald-200 text-emerald-600"
            />

            <AdminStatsCard
              label="Active Expeditions"
              value={`${metrics.activeExpeditions}`}
              subtext={`${metrics.climbersOnMountain} climbers on peak`}
              icon={Mountain}
              iconColorClass="bg-amber-50 border-amber-200 text-amber-600"
            />

            <AdminStatsCard
              label="Pending Bookings"
              value={`${metrics.pendingBookings}`}
              trendText="Requires guide assignment"
              trendType="warning"
              icon={Clock}
              iconColorClass="bg-sky-50 border-sky-200 text-sky-600"
            />

            <AdminStatsCard
              label="Permits Processing"
              value={`${metrics.timsPermitsProcessing}`}
              subtext="TIMS & Sagarmatha clearances"
              icon={FileCheck}
              iconColorClass="bg-purple-50 border-purple-200 text-purple-600"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Bookings</h2>
                <p className="text-xs text-slate-600 font-normal">Latest guest reservations and inquiries</p>
              </div>
              <Link
                href="/admin/bookings"
                className="text-xs font-semibold text-slate-900 hover:text-amber-600 flex items-center gap-1 transition-colors"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto pt-1">
              <AdminTable>
                <AdminTableHeader>
                  <tr>
                    <AdminTableHead>Guest</AdminTableHead>
                    <AdminTableHead>Package</AdminTableHead>
                    <AdminTableHead>Start Date</AdminTableHead>
                    <AdminTableHead>Amount</AdminTableHead>
                    <AdminTableHead align="right">Status</AdminTableHead>
                  </tr>
                </AdminTableHeader>
                <AdminTableBody>
                  {loading ? (
                    <AdminTableLoading colSpan={5} rows={5} />
                  ) : (
                    recentBookings.map((bkg) => (
                      <AdminTableRow key={bkg.id}>
                        <AdminTableCell>
                          <div className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                            {bkg.guestName}
                          </div>
                          <div className="text-xs text-slate-600 font-normal">{bkg.reference} • {bkg.country}</div>
                        </AdminTableCell>
                        <AdminTableCell className="max-w-[180px] truncate">
                          {bkg.packageName}
                        </AdminTableCell>
                        <AdminTableCell>
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
          </Card>
        </div>

        {/* Right Column: Active Expeditions Quick View (1 col) */}
        <div className="space-y-6">
          <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Top Expeditions</h3>
                <p className="text-xs text-slate-600 font-normal">Active mountain packages</p>
              </div>
              <Link href="/admin/expeditions" className="text-xs font-semibold text-slate-900 hover:text-amber-600 transition-colors">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 animate-pulse"
                  >
                    <div className="space-y-2 flex-grow">
                      <Skeleton className="h-4 w-32 bg-slate-200" />
                      <Skeleton className="h-3 w-20 bg-slate-200" />
                    </div>
                    <Skeleton className="h-4 w-12 bg-slate-200 shrink-0 animate-pulse" />
                  </div>
                ))
              ) : (
                topExpeditions.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 line-clamp-1">{pkg.title}</div>
                      <div className="text-xs text-slate-600 font-medium">{pkg.durationDays} Days • {pkg.maxAltitudeMeters || 6000}m</div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">${pkg.priceUSD}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
