import { Skeleton } from "@/components/ui/skeleton";

export function PackageCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs">
      <div>
        {/* Image Box Skeleton */}
        <Skeleton className="h-44 sm:h-48 w-full rounded-none bg-slate-200/90" />

        {/* Content Skeleton */}
        <div className="p-4 space-y-3">
          {/* Region & Days */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>

          {/* Title */}
          <Skeleton className="h-4 w-4/5 rounded-md" />

          {/* Description lines */}
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-3/4 rounded-md" />
          </div>

          {/* Meta line */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-3 w-10 rounded-md" />
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="p-4 pt-0 border-t border-slate-100 mt-2">
        <div className="flex items-center justify-between pt-3">
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-16 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-16 rounded-xl" />
            <Skeleton className="h-7 w-16 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
