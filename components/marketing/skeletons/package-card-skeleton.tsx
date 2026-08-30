import { Skeleton } from "@/components/ui/skeleton";

export function PackageCardSkeleton() {
  return (
    <div className="bg-white rounded-sm border border-stone-200 overflow-hidden flex flex-col justify-between h-full shadow-2xs">
      <div>
        {/* Clean Image Frame Skeleton */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
          <Skeleton className="w-full h-full rounded-none bg-stone-200/60" />
          <Skeleton className="absolute top-3 left-3 h-5 w-20 bg-stone-300/60 rounded-xs" />
          <Skeleton className="absolute top-3 right-3 h-5 w-16 bg-stone-300/60 rounded-xs" />
        </div>

        {/* Card Body Skeleton */}
        <div className="p-5 space-y-3">
          {/* Title Skeleton */}
          <Skeleton className="h-5 w-4/5 bg-stone-200/70 rounded-xs" />

          {/* Key Specs Row Skeleton */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <Skeleton className="h-3.5 w-28 bg-stone-200/60 rounded-xs" />
            <Skeleton className="h-3.5 w-20 bg-stone-200/60 rounded-xs" />
          </div>
        </div>
      </div>

      {/* Footer Row Skeleton */}
      <div className="p-5 pt-0 border-t border-stone-100 mt-2">
        <div className="flex items-center justify-between pt-3">
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-8 bg-stone-200/60 rounded-xs" />
            <Skeleton className="h-5 w-20 bg-stone-200/70 rounded-xs" />
          </div>

          <Skeleton className="h-4 w-24 bg-stone-200/70 rounded-xs" />
        </div>
      </div>
    </div>
  );
}
