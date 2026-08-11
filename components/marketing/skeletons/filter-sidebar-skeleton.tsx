import { Skeleton } from "@/components/ui/skeleton";

export function FilterSidebarSkeleton() {
  return (
    <div className="space-y-5">
      {/* Search Input Skeleton */}
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-28 rounded-md" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>

      {/* Pill buttons Skeleton */}
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-24 rounded-md" />
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </div>

      {/* Range Slider Skeleton */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-3 w-12 rounded-md" />
        </div>
        <Skeleton className="h-4 w-full rounded-md" />
      </div>

      {/* Sort Select Skeleton */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}
