import Link from "next/link";
import {
  DollarSign,
  Mountain,
  FileCheck,
  ChevronRight,
  ShieldAlert,
  Compass,
  Clock,
  ArrowUpRight,
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
        title="Expedition Command Dashboard"
        description="Real-time operational metrics for AlpineAce mountaineering, luxury treks, and permits."
      >
        <Link href="/admin/packages">
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-slate-700 font-semibold"
          >
            Manage Packages
          </Button>
        </Link>
        <Link href="/admin/bookings">
          <Button
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>View All Bookings</span>
          </Button>
        </Link>
      </AdminPageHeader>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          label="Total Revenue (YTD)"
          value={`$${mockDashboardMetrics.totalRevenueUSD.toLocaleString()}`}
          trendText={`+${mockDashboardMetrics.revenueChangePercent}% vs last season`}
          trendType="positive"
          icon={DollarSign}
          iconColorClass="bg-emerald-50 border-emerald-200 text-emerald-600"
        />

        <AdminStatsCard
          label="Active Expeditions"
          value={`${mockDashboardMetrics.activeExpeditions} Expeditions`}
          subtext={`${mockDashboardMetrics.climbersOnMountain} climbers currently on peak`}
          icon={Mountain}
          iconColorClass="bg-amber-50 border-amber-200 text-amber-600"
        />

        <AdminStatsCard
          label="Pending Bookings"
          value={`${mockDashboardMetrics.pendingBookings} Requests`}
          trendText="Requires Guide Assignment"
          trendType="warning"
          icon={Clock}
          iconColorClass="bg-sky-50 border-sky-200 text-sky-600"
        />

        <AdminStatsCard
          label="Permits & Clearances"
          value={`${mockDashboardMetrics.timsPermitsProcessing} Processing`}
          subtext="NMA & Sagarmatha Park Approvals"
          icon={FileCheck}
          iconColorClass="bg-purple-50 border-purple-200 text-purple-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Bookings (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Reservation Requests</h2>
                <p className="text-xs text-slate-500 font-medium">Latest guest inquiries and confirmed bookings</p>
              </div>
              <Link
                href="/admin/bookings"
                className="text-xs font-semibold text-slate-900 hover:text-amber-600 flex items-center gap-1 transition-colors"
              >
                View All ({mockBookings.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 pr-4">Reference / Guest</th>
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
                        <div className="text-[10px] text-slate-400 font-medium">{bkg.reference} • {bkg.country}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold max-w-[200px] truncate">
                        {bkg.packageName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {bkg.startDate}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
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

          {/* Featured Expeditions & Package Summary */}
          <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Top Performing Packages</h2>
              <Link href="/admin/packages" className="text-xs text-slate-900 font-semibold hover:text-amber-600 transition-colors">
                Manage Packages
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
                      <span className="text-xs text-slate-500 font-semibold">★ {pkg.rating} ({pkg.totalBookings} booked)</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-2 line-clamp-1">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {pkg.durationDays} Days • Max Altitude: {pkg.maxAltitudeMeters}m
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">${pkg.priceUSD} <span className="font-normal text-slate-500">/ person</span></span>
                    <AdminStatusBadge status={pkg.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Operational Status & Sherpa Guides (1 col) */}
        <div className="space-y-6">
          {/* Weather & Safety Alert Box */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>High Altitude Briefing</span>
            </div>
            <p className="text-xs text-amber-950/80 leading-relaxed font-medium">
              Autumn 2026 rope fixing team completed Khumbu Icefall setup. Ama Dablam Camp 2 ridge line is secured.
            </p>
            <div className="pt-2 border-t border-amber-200/80 text-[11px] text-amber-900 flex justify-between font-mono font-bold">
              <span>ICEFALL: OPEN</span>
              <span>LUKLA VISIBILITY: 10KM</span>
            </div>
          </div>

          {/* Sherpa Guides Roster Summary */}
          <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Sherpa Guides Roster</h3>
                <p className="text-xs text-slate-500 font-medium">Lead summit masters & mountain team</p>
              </div>
              <Link href="/admin/guides" className="text-xs font-semibold text-slate-900 hover:text-amber-600 transition-colors">
                All Guides
              </Link>
            </div>

            <div className="space-y-3">
              {mockGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {guide.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{guide.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{guide.summitStats}</div>
                    </div>
                  </div>

                  <AdminStatusBadge status={guide.status} />
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Links Widget */}
          <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Quick Operations</h3>
            <div className="space-y-2 text-xs">
              <Link
                href="/admin/inquiries"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 font-medium transition-colors"
              >
                <span>Lead Inquiries ({mockDashboardMetrics.pendingInquiries} New)</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 font-medium transition-colors"
              >
                <span>Permits & Gateway Settings</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
