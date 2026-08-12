import { Skeleton } from "@/components/ui/skeleton";

export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 animate-pulse flex flex-col h-[380px] shadow-2xs">
      {/* Image Skeleton */}
      <Skeleton className="w-full aspect-16/10 rounded-none bg-stone-200/80" />
      
      {/* Content Skeleton */}
      <div className="p-6 flex flex-col flex-grow justify-between space-y-3">
        <div className="space-y-2.5">
          {/* Date & Read time */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20 rounded-md bg-stone-200/70" />
            <Skeleton className="h-3 w-14 rounded-md bg-stone-200/70" />
          </div>
          {/* Title */}
          <Skeleton className="h-5 w-4/5 rounded-md bg-stone-200/90" />
          {/* Excerpt */}
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3 w-full rounded-md bg-stone-200/60" />
            <Skeleton className="h-3 w-3/4 rounded-md bg-stone-200/60" />
          </div>
        </div>

        {/* Read full article link */}
        <div className="pt-3 border-t border-stone-100">
          <Skeleton className="h-3.5 w-28 rounded-md bg-stone-200/70" />
        </div>
      </div>
    </div>
  );
}
