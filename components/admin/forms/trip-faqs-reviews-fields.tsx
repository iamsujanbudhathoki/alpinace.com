"use client";

import { useState } from "react";
import { Plus, Trash2, HelpCircle, Star, MessageSquareQuote, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface TripFaqItem {
  question: string;
  answer: string;
}

export interface TripReviewItem {
  id?: string;
  author: string;
  country: string;
  date?: string;
  rating: number;
  avatar?: string;
  content: string;
}

interface TripFaqsManagerProps {
  faqs: TripFaqItem[];
  onChange: (faqs: TripFaqItem[]) => void;
}

export function TripFaqsManager({ faqs = [], onChange }: TripFaqsManagerProps) {
  const handleAddFaq = () => {
    onChange([
      ...faqs,
      {
        question: "",
        answer: "",
      },
    ]);
  };

  const handleUpdateFaq = (index: number, field: "question" | "answer", value: string) => {
    const updated = faqs.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(updated);
  };

  const handleRemoveFaq = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div>
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>Trip Specific FAQs ({faqs.length})</span>
          </h4>
          <p className="text-[11px] text-slate-600 font-medium">
            Add questions &amp; answers specifically relevant to this trip itinerary.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleAddFaq}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-8 px-3 rounded-lg cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1 text-amber-400" />
          Add FAQ
        </Button>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-8 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No trip-specific FAQs added</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Common questions like permits, gear, and physical fitness can be added here.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddFaq}
            className="mt-3 text-xs font-semibold cursor-pointer text-slate-800"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-amber-500" />
            Add First FAQ
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-2xs relative group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                  Question #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(index)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50 cursor-pointer"
                  title="Remove FAQ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Question
                </label>
                <Input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleUpdateFaq(index, "question", e.target.value)}
                  placeholder="e.g. What is the required fitness level for this route?"
                  className="text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-lg h-8"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Answer
                </label>
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => handleUpdateFaq(index, "answer", e.target.value)}
                  placeholder="Provide a clear, detailed answer..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900 font-medium"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface TripReviewsManagerProps {
  reviews: TripReviewItem[];
  onChange: (reviews: TripReviewItem[]) => void;
}

export function TripReviewsManager({ reviews = [], onChange }: TripReviewsManagerProps) {
  const handleAddReview = () => {
    onChange([
      ...reviews,
      {
        id: `rev-${Date.now()}`,
        author: "",
        country: "United States",
        rating: 5,
        date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        content: "",
      },
    ]);
  };

  const handleUpdateReview = (
    index: number,
    field: keyof TripReviewItem,
    value: string | number
  ) => {
    const updated = reviews.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(updated);
  };

  const handleRemoveReview = (index: number) => {
    onChange(reviews.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div>
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <MessageSquareQuote className="w-4 h-4 text-amber-500" />
            <span>Customer Testimonials &amp; Reviews ({reviews.length})</span>
          </h4>
          <p className="text-[11px] text-slate-600 font-medium">
            Manage verified client reviews and ratings displayed on this package&apos;s page.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleAddReview}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-8 px-3 rounded-lg cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1 text-amber-400" />
          Add Review
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No client reviews added yet</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Add authentic traveler feedback to build trust and boost bookings.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddReview}
            className="mt-3 text-xs font-semibold cursor-pointer text-slate-800"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-amber-500" />
            Add First Review
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {reviews.map((rev, index) => (
            <div
              key={index}
              className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-2xs relative group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  Review #{index + 1}
                </span>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleUpdateReview(index, "rating", star)}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            star <= (rev.rating || 5)
                              ? "text-amber-500 fill-amber-500"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveReview(index)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50 cursor-pointer ml-1"
                    title="Remove Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Author Name
                  </label>
                  <Input
                    type="text"
                    value={rev.author}
                    onChange={(e) => handleUpdateReview(index, "author", e.target.value)}
                    placeholder="e.g. Jonathan Vance"
                    className="text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-lg h-8"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Guest Country
                  </label>
                  <Input
                    type="text"
                    value={rev.country}
                    onChange={(e) => handleUpdateReview(index, "country", e.target.value)}
                    placeholder="e.g. United States"
                    className="text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-lg h-8"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date / Season
                  </label>
                  <Input
                    type="text"
                    value={rev.date || ""}
                    onChange={(e) => handleUpdateReview(index, "date", e.target.value)}
                    placeholder="e.g. Oct 2025"
                    className="text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-lg h-8"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Review Text / Feedback
                </label>
                <textarea
                  rows={2}
                  value={rev.content}
                  onChange={(e) => handleUpdateReview(index, "content", e.target.value)}
                  placeholder="Detailed traveler feedback and experience..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900 font-medium"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
