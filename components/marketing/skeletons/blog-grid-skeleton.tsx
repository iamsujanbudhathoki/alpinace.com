import { BlogCardSkeleton } from "./blog-card-skeleton";

interface BlogGridSkeletonProps {
  count?: number;
}

export function BlogGridSkeleton({ count = 6 }: BlogGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <BlogCardSkeleton key={index} />
      ))}
    </div>
  );
}
