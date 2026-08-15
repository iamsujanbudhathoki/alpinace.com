"use client";

import { Star } from "lucide-react";

export interface ReviewItemProp {
  id?: string;
  author: string;
  country?: string;
  content: string;
  avatar?: string;
  rating?: number;
}

export interface PackageReviewsProps {
  reviews: ReviewItemProp[];
  title?: string;
  subtitle?: string;
  overallRating?: number;
}

export function PackageReviews({
  reviews,
  title = "Verified Traveler Reviews",
  subtitle = "Real feedback from adventurers who completed this journey",
  overallRating = 5.0,
}: PackageReviewsProps) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="pt-8 border-t border-[#E6E0D5] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl font-bold text-[#1E2420]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#6B726C] mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1 bg-[#EAE5DC] text-[#242E27] px-3 py-1 rounded-md text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-[#C28835] text-[#C28835]" />
          <span>{overallRating.toFixed(1)} / 5.0 Rating</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev, idx) => (
          <div
            key={rev.id || idx}
            className="p-5 bg-white border border-[#EAE5DC] rounded-xl space-y-3 shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  rev.avatar ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                }
                alt={rev.author}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-[#1E2420]">
                  {rev.author}
                </h4>
                {rev.country && (
                  <span className="text-[11px] text-[#6B726C]">
                    {rev.country}
                  </span>
                )}
              </div>
              <div className="ml-auto flex gap-0.5 text-[#C28835]">
                {[...Array(rev.rating || 5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 fill-[#C28835] text-[#C28835]"
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-[#3A423C] leading-relaxed italic">
              &ldquo;{rev.content}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
