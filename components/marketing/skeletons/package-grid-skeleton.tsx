import { PackageCardSkeleton } from "./package-card-skeleton";

interface PackageGridSkeletonProps {
  count?: number;
}

export function PackageGridSkeleton({ count = 6 }: PackageGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <PackageCardSkeleton key={index} />
      ))}
    </div>
  );
}
