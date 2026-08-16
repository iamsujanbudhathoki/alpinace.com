"use client";

import { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  HelpCircle,
  Star,
  MessageSquareQuote,
  User,
  Upload,
  Image as ImageIcon,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaService } from "@/lib/services/admin-service";
import { toast } from "sonner";

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

const PRESET_AVATARS = [
  {
    name: "Elena",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "Marcus",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "Sophie",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "David",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "Hannah",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  },
];

export function TripReviewsManager({ reviews = [], onChange }: TripReviewsManagerProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleAddReview = () => {
    onChange([
      ...reviews,
      {
        id: `rev-${Date.now()}`,
        author: "",
        country: "United States",
        rating: 5,
        date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        avatar: "",
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

  const handleAvatarFileUpload = async (index: number, file: File) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const res = await MediaService.uploadFile(file);
      const uploadedUrl = res?.data?.url || (res as any)?.url;
      if (uploadedUrl) {
        handleUpdateReview(index, "avatar", uploadedUrl);
        toast.success(`Photo "${file.name}" uploaded successfully!`);
      } else {
        toast.error("Could not retrieve uploaded image URL.");
      }
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast.error(err?.message || "Failed to upload reviewer photo.");
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div>
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <MessageSquareQuote className="w-4 h-4 text-amber-500" />
            <span>Customer Testimonials &amp; Reviews ({reviews.length})</span>
          </h4>
          <p className="text-[11px] text-slate-600 font-medium">
            Manage verified client reviews, traveler photos, and star ratings displayed on this package.
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
            Add authentic traveler feedback with photos to build credibility and trust.
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
        <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
          {reviews.map((rev, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs relative group"
            >
              {/* Card Header: Review badge, rating picker, delete button */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <span className="text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  Review #{index + 1}
                </span>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-amber-50/80 px-2 py-0.5 rounded-lg border border-amber-200/60">
                    <span className="text-[10px] font-bold text-amber-800 mr-1">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleUpdateReview(index, "rating", star)}
                        className="cursor-pointer hover:scale-110 transition-transform"
                        title={`Set rating to ${star} star${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            star <= (rev.rating || 5)
                              ? "text-amber-500 fill-amber-500"
                              : "text-slate-200"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-[11px] font-bold text-amber-900 ml-1">
                      {rev.rating || 5}.0
                    </span>
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

              {/* Reviewer Avatar Upload & Presets Section */}
              <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                    Reviewer Photo / Avatar
                  </label>
                  {rev.avatar && (
                    <button
                      type="button"
                      onClick={() => handleUpdateReview(index, "avatar", "")}
                      className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Remove Photo
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Avatar Preview */}
                  <div className="relative shrink-0">
                    {rev.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rev.avatar}
                        alt="Reviewer Avatar"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400/80 bg-white"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    {uploadingIndex === index && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Upload Controls & URL Input */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[index] = el;
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarFileUpload(index, file);
                        }}
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        className="hidden"
                      />

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={uploadingIndex === index}
                        onClick={() => fileInputRefs.current[index]?.click()}
                        className="h-7 text-xs font-semibold bg-white hover:bg-slate-100 border-slate-300 text-slate-800 cursor-pointer"
                      >
                        {uploadingIndex === index ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin text-amber-600" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3 mr-1 text-amber-600" />
                            Upload Photo
                          </>
                        )}
                      </Button>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Presets:
                        </span>
                        {PRESET_AVATARS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleUpdateReview(index, "avatar", preset.url)}
                            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded transition-colors cursor-pointer ${
                              rev.avatar === preset.url
                                ? "bg-amber-600 text-white"
                                : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                            }`}
                            title={`Select preset portrait for ${preset.name}`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Input
                      type="text"
                      value={rev.avatar || ""}
                      onChange={(e) => handleUpdateReview(index, "avatar", e.target.value)}
                      placeholder="Or paste direct image URL (https://...)"
                      className="text-[11px] bg-white border-slate-200 rounded-md h-7"
                    />
                  </div>
                </div>
              </div>

              {/* Author, Country & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Author Name <span className="text-rose-500">*</span>
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
                    Guest Country / City
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
                    placeholder="e.g. Autumn 2025"
                    className="text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-lg h-8"
                  />
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Review Text / Feedback <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={rev.content}
                  onChange={(e) => handleUpdateReview(index, "content", e.target.value)}
                  placeholder="Detailed traveler feedback, highlights, guide mentions..."
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
