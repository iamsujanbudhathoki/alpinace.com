import { Skeleton } from "@/components/ui/skeleton";

export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-stone-200 flex flex-col justify-between h-full shadow-2xs">
      <div>
        {/* Image Frame Skeleton */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
          <Skeleton className="w-full h-full rounded-none bg-stone-200/60" />
          <Skeleton className="absolute top-3.5 left-3.5 h-6 w-24 bg-stone-300/60 rounded-md" />
        </div>

        {/* Content Skeleton */}
        <div className="p-6 space-y-3">
          {/* Date & Read Time */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20 rounded-md bg-stone-200/60" />
            <Skeleton className="h-3 w-14 rounded-md bg-stone-200/60" />
          </div>

          {/* Title */}
          <Skeleton className="h-5 w-4/5 rounded-md bg-stone-200/70" />

          {/* Excerpt */}
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3 w-full rounded-md bg-stone-200/60" />
            <Skeleton className="h-3 w-3/4 rounded-md bg-stone-200/60" />
          </div>
        </div>
      </div>

      {/* Read Article CTA Skeleton */}
      <div className="p-6 pt-0 mt-3">
        <div className="pt-3 border-t border-stone-100">
          <Skeleton className="h-3.5 w-28 rounded-md bg-stone-200/70" />
        </div>
      </div>
    </div>
  );
}
