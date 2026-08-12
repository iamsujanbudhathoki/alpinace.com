import { Skeleton } from "@/components/ui/skeleton";

export function BlogDetailSkeleton() {
  return (
    <div className="pt-24 min-h-screen bg-stone-50/60 pb-24 font-sans text-slate-900 animate-pulse">
      {/* Navigation Skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12 rounded-md bg-stone-200" />
            <Skeleton className="h-3 w-3 rounded-full bg-stone-200" />
            <Skeleton className="h-4 w-16 rounded-md bg-stone-200" />
            <Skeleton className="h-3 w-3 rounded-full bg-stone-200" />
            <Skeleton className="h-4 w-28 rounded-md bg-stone-200" />
          </div>
          <Skeleton className="h-4 w-20 rounded-md bg-stone-200" />
        </div>
      </div>

      {/* Main Article Container Skeleton */}
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="pt-4 pb-8 space-y-5">
          <Skeleton className="h-6 w-32 rounded-full bg-stone-200" />
          <div className="space-y-3">
            <Skeleton className="h-10 sm:h-12 w-4/5 rounded-2xl bg-stone-200" />
            <Skeleton className="h-10 sm:h-12 w-3/5 rounded-2xl bg-stone-200" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full bg-stone-200" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-40 rounded-md bg-stone-200" />
                <Skeleton className="h-3 w-28 rounded-md bg-stone-200" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20 rounded-md bg-stone-200" />
              <Skeleton className="h-4 w-16 rounded-md bg-stone-200" />
              <Skeleton className="h-7 w-16 rounded-lg bg-stone-200" />
            </div>
          </div>
        </header>

        {/* Hero Image Skeleton */}
        <div className="w-full aspect-16/9 sm:aspect-21/9 rounded-3xl bg-stone-200 mb-10 overflow-hidden shadow-xs" />

        {/* Body Content Card Skeleton */}
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-stone-200 space-y-6 shadow-2xs">
          {/* Excerpt Pull-quote Skeleton */}
          <div className="border-l-4 border-stone-300 pl-6 py-2">
            <Skeleton className="h-5 w-11/12 rounded-md bg-stone-200" />
          </div>

          {/* Paragraph lines Skeleton */}
          <div className="space-y-3 pt-4">
            <Skeleton className="h-4 w-full rounded-md bg-stone-200" />
            <Skeleton className="h-4 w-full rounded-md bg-stone-200" />
            <Skeleton className="h-4 w-5/6 rounded-md bg-stone-200" />
          </div>

          {/* Section Heading Skeleton */}
          <Skeleton className="h-7 w-1/3 rounded-lg bg-stone-200 pt-4" />

          {/* Additional Paragraphs Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full rounded-md bg-stone-200" />
            <Skeleton className="h-4 w-full rounded-md bg-stone-200" />
            <Skeleton className="h-4 w-3/4 rounded-md bg-stone-200" />
          </div>

          {/* Footer Share Skeleton */}
          <div className="pt-8 border-t border-stone-100 flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded-md bg-stone-200" />
            <Skeleton className="h-7 w-24 rounded-xl bg-stone-200" />
          </div>
        </div>

      </article>
    </div>
  );
}
