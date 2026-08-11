import { Skeleton } from "@/components/ui/skeleton";

export function PackageDetailSkeleton() {
  return (
    <div className="pt-20 min-h-screen bg-stone-50 text-slate-900 pb-24 font-sans">
      {/* Hero Banner Skeleton */}
      <div className="relative h-96 sm:h-112 md:h-128 w-full bg-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-6">
          <Skeleton className="h-8 w-44 rounded-full bg-white/60" />
        </div>
        <div className="absolute bottom-10 left-0 right-0">
          <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-md bg-white/40" />
              <Skeleton className="h-6 w-20 rounded-md bg-white/40" />
              <Skeleton className="h-6 w-28 rounded-md bg-white/40" />
            </div>
            <Skeleton className="h-10 w-2/3 rounded-lg bg-white/60" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="py-12 max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Block */}
          <div className="lg:col-span-8 space-y-8">
            {/* Gallery Skeleton */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="grid grid-cols-4 gap-3">
                <Skeleton className="aspect-4/3 rounded-lg" />
                <Skeleton className="aspect-4/3 rounded-lg" />
                <Skeleton className="aspect-4/3 rounded-lg" />
                <Skeleton className="aspect-4/3 rounded-lg" />
              </div>
            </div>

            {/* Quick Facts Bar Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-20" /></div>
              <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-20" /></div>
              <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-20" /></div>
              <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-20" /></div>
            </div>

            {/* Tabs & Content */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
