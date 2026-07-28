import Link from "next/link";
import {
  DollarSign,
  Mountain,
  Users,
  FileCheck,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  ShieldAlert,
  Compass,
  Clock,
} from "lucide-react";
import {
  mockDashboardMetrics,
  mockBookings,
  mockGuides,
  mockPackages,
} from "@/lib/admin-data";

export default function AdminDashboardPage() {
  const recentBookings = mockBookings.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-charcoal-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-offwhite-50">
            Expedition Command Dashboard
          </h1>
          <p className="text-xs md:text-sm text-charcoal-400 mt-1">
            Real-time status for AlpineAce mountaineering, luxury treks, and permit operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/packages"
            className="px-4 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-xs font-semibold text-offwhite-100 transition-colors border border-charcoal-700"
          >
            Manage Packages
          </Link>
          <Link
            href="/admin/bookings"
            className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-xs font-bold text-charcoal-950 transition-colors shadow-lg shadow-gold-500/10"
          >
            View All Bookings
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3 relative overflow-hidden group hover:border-gold-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-400">Total Revenue (YTD)</span>
            <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-offwhite-50">
              ${mockDashboardMetrics.totalRevenueUSD.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{mockDashboardMetrics.revenueChangePercent}% vs last season</span>
            </div>
          </div>
        </div>

        {/* Active Expeditions */}
        <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3 relative overflow-hidden group hover:border-gold-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-400">Active Expeditions</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Mountain className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-offwhite-50">
              {mockDashboardMetrics.activeExpeditions} Expeditions
            </div>
            <p className="text-xs text-charcoal-400 mt-1">
              <strong className="text-gold-400">{mockDashboardMetrics.climbersOnMountain}</strong> climbers currently on peak
            </p>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3 relative overflow-hidden group hover:border-gold-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-400">Pending Bookings</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-offwhite-50">
              {mockDashboardMetrics.pendingBookings} Requests
            </div>
            <p className="text-xs text-sky-400 font-semibold mt-1">
              Requires Sherpa Guide Assignment
            </p>
          </div>
        </div>

        {/* TIMS Permits Processing */}
        <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3 relative overflow-hidden group hover:border-gold-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-400">Permits & Clearances</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-offwhite-50">
              {mockDashboardMetrics.timsPermitsProcessing} Processing
            </div>
            <p className="text-xs text-charcoal-400 mt-1">
              NMA & Sagarmatha Park Approvals
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Bookings (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-offwhite-50">Recent Reservation Requests</h2>
                <p className="text-xs text-charcoal-400">Latest guest inquiries and confirmed bookings</p>
              </div>
              <Link
                href="/admin/bookings"
                className="text-xs font-semibold text-gold-400 hover:underline flex items-center gap-1"
              >
                View All ({mockBookings.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-charcoal-800 text-charcoal-400 font-semibold">
                    <th className="pb-3 pr-4">Reference / Guest</th>
                    <th className="pb-3 px-4">Package</th>
                    <th className="pb-3 px-4">Start Date</th>
                    <th className="pb-3 px-4">Amount</th>
                    <th className="pb-3 pl-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-800/60">
                  {recentBookings.map((bkg) => (
                    <tr key={bkg.id} className="group hover:bg-charcoal-800/40">
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-offwhite-100 group-hover:text-gold-400 transition-colors">
                          {bkg.guestName}
                        </div>
                        <div className="text-[10px] text-charcoal-400">{bkg.reference} • {bkg.country}</div>
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-300 font-medium max-w-[200px] truncate">
                        {bkg.packageName}
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-400">
                        {bkg.startDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-offwhite-100">
                        ${bkg.totalAmountUSD.toLocaleString()}
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            bkg.bookingStatus === "Confirmed"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : bkg.bookingStatus === "Active Trek"
                              ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {bkg.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Featured Expeditions & Package Summary */}
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-offwhite-50">Top Performing Packages</h2>
              <Link href="/admin/packages" className="text-xs text-gold-400 font-semibold hover:underline">
                Manage Packages
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockPackages.slice(0, 4).map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 hover:border-gold-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded">
                        {pkg.category}
                      </span>
                      <span className="text-xs text-charcoal-400">★ {pkg.rating} ({pkg.totalBookings} booked)</span>
                    </div>
                    <h3 className="font-semibold text-sm text-offwhite-100 mt-2 line-clamp-1">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-charcoal-400 mt-1">
                      {pkg.durationDays} Days • Max Altitude: {pkg.maxAltitudeMeters}m
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-charcoal-800/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-offwhite-50">${pkg.priceUSD} <span className="font-normal text-charcoal-400">/ person</span></span>
                    <span className="text-emerald-400 font-medium text-[11px]">{pkg.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Operational Status & Sherpa Guides (1 col) */}
        <div className="space-y-6">
          {/* Weather & Safety Alert Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-charcoal-900 to-gold-950/30 border border-gold-500/30 space-y-3">
            <div className="flex items-center gap-2 text-gold-400 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>High Altitude Briefing</span>
            </div>
            <p className="text-xs text-offwhite-300 leading-relaxed">
              Autumn 2026 rope fixing team completed Khumbu Icefall setup. Ama Dablam Camp 2 ridge line is secured.
            </p>
            <div className="pt-2 border-t border-gold-500/20 text-[11px] text-gold-300 flex justify-between font-mono">
              <span>ICEFALL: OPEN</span>
              <span>LUKLA VISIBILITY: 10KM</span>
            </div>
          </div>

          {/* Sherpa Guides Roster Summary */}
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-offwhite-50">Sherpa Guides Roster</h3>
                <p className="text-xs text-charcoal-400">Lead summit masters & mountain team</p>
              </div>
              <Link href="/admin/guides" className="text-xs text-gold-400 hover:underline">
                All Guides
              </Link>
            </div>

            <div className="space-y-3">
              {mockGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {guide.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-offwhite-100">{guide.name}</div>
                      <div className="text-[10px] text-gold-400 font-medium">{guide.summitStats}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      guide.status === "On Mountain"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {guide.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links Widget */}
          <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
            <h3 className="font-bold text-sm text-offwhite-50">Quick Operations</h3>
            <div className="space-y-2 text-xs">
              <Link
                href="/admin/inquiries"
                className="flex items-center justify-between p-2.5 rounded-lg bg-charcoal-950 border border-charcoal-800 text-offwhite-200 hover:text-gold-400 hover:border-gold-500/30 transition-colors"
              >
                <span>Lead Inquiries ({mockDashboardMetrics.pendingInquiries} New)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-2.5 rounded-lg bg-charcoal-950 border border-charcoal-800 text-offwhite-200 hover:text-gold-400 hover:border-gold-500/30 transition-colors"
              >
                <span>Permits & Gateway Settings</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
