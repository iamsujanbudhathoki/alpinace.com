import Link from "next/link";
import {
  DollarSign,
  Mountain,
  FileCheck,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  mockDashboardMetrics,
  mockBookings,
  mockGuides,
  mockPackages,
} from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminStatsCard } from "@/components/admin/ui/admin-stats-card";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const recentBookings = mockBookings.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <AdminPageHeader
        title="Dashboard Overview"
        description="AlpineAce mountaineering, treks, and permit operational status."
      >
        <Link href="/admin/packages">
          <Button
            variant="outline"
            className="bg-white text-slate-700 font-semibold border-slate-200"
          >
            Manage Packages
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
        <AdminStatsCard
          label="Total Revenue"
          value={`$${mockDashboardMetrics.totalRevenueUSD.toLocaleString()}`}
          trendText={`+${mockDashboardMetrics.revenueChangePercent}% vs last season`}
          trendType="positive"
          icon={DollarSign}
          iconColorClass="bg-emerald-50 border-emerald-200 text-emerald-600"
        />

        <AdminStatsCard
          label="Active Expeditions"
          value={`${mockDashboardMetrics.activeExpeditions}`}
          subtext={`${mockDashboardMetrics.climbersOnMountain} climbers on peak`}
          icon={Mountain}
          iconColorClass="bg-amber-50 border-amber-200 text-amber-600"
        />

        <AdminStatsCard
          label="Pending Bookings"
          value={`${mockDashboardMetrics.pendingBookings}`}
          trendText="Requires guide assignment"
          trendType="warning"
          icon={Clock}
          iconColorClass="bg-sky-50 border-sky-200 text-sky-600"
        />

        <AdminStatsCard
          label="Permits Processing"
          value={`${mockDashboardMetrics.timsPermitsProcessing}`}
          subtext="TIMS & Sagarmatha clearances"
          icon={FileCheck}
          iconColorClass="bg-purple-50 border-purple-200 text-purple-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Bookings & Packages (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Bookings</h2>
                <p className="text-xs text-slate-600 font-medium">Latest guest reservations and inquiries</p>
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
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                    <th className="pb-3 pr-4">Guest</th>
                    <th className="pb-3 px-4">Package</th>
                    <th className="pb-3 px-4">Start Date</th>
                    <th className="pb-3 px-4">Amount</th>
                    <th className="pb-3 pl-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.map((bkg) => (
                    <tr key={bkg.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                          {bkg.guestName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">{bkg.reference} • {bkg.country}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium max-w-[180px] truncate">
                        {bkg.packageName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {bkg.startDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ${bkg.totalAmountUSD.toLocaleString()}
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <AdminStatusBadge status={bkg.bookingStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Popular Packages */}
          <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Featured Expeditions</h2>
              <Link href="/admin/packages" className="text-xs text-slate-900 font-semibold hover:text-amber-600 transition-colors">
                Manage All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockPackages.slice(0, 4).map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <AdminStatusBadge status={pkg.category} />
                      <span className="text-xs text-slate-600 font-medium">★ {pkg.rating} ({pkg.totalBookings})</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-2 line-clamp-1">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      {pkg.durationDays} Days • {pkg.maxAltitudeMeters}m
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">${pkg.priceUSD} <span className="font-normal text-slate-500">/ person</span></span>
                    <AdminStatusBadge status={pkg.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Sherpa Guides (1 col) */}
        <div className="space-y-6">
          <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Sherpa Guides</h3>
                <p className="text-xs text-slate-600 font-medium">Summit leaders & mountain team</p>
              </div>
              <Link href="/admin/guides" className="text-xs font-semibold text-slate-900 hover:text-amber-600 transition-colors">
                View Roster
              </Link>
            </div>

            <div className="space-y-3">
              {mockGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {guide.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{guide.name}</div>
                      <div className="text-[10px] text-slate-600 font-medium">{guide.summitStats}</div>
                    </div>
                  </div>

                  <AdminStatusBadge status={guide.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
