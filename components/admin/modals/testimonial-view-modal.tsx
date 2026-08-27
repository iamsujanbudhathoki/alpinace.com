"use client";

import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Edit3, Star, User, MapPin, Compass } from "lucide-react";
import { TestimonialItem } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";

interface TestimonialViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial: TestimonialItem | null;
  onEdit?: (testimonial: TestimonialItem) => void;
}

export function TestimonialViewModal({
  isOpen,
  onClose,
  testimonial,
  onEdit,
}: TestimonialViewModalProps) {
  if (!testimonial) return null;

  const footer = (
    <div className="flex items-center justify-end gap-2.5">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="text-xs font-semibold h-9 px-4 rounded-lg cursor-pointer"
      >
        Close
      </Button>
      {onEdit && (
        <Button
          type="button"
          onClick={() => {
            onClose();
            onEdit(testimonial);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-9 px-4 rounded-lg cursor-pointer flex items-center gap-1.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Testimonial</span>
        </Button>
      )}
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Testimonial Details"
      footer={footer}
      maxWidth="md"
      fixedHeight={false}
    >
      <div className="space-y-5">
        {/* Profile Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          {testimonial.avatar ? (
            <img
              src={testimonial.avatar}
              alt={testimonial.author}
              onClick={(e) => openSingleImage(testimonial.avatar!, testimonial.author, e.currentTarget)}
              className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity shadow-xs"
              title="Click to view image lightbox"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-xs">
              <User className="w-8 h-8" />
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 leading-snug truncate">
                {testimonial.author}
              </h3>
              <AdminStatusBadge status={testimonial.status} />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              {testimonial.role && <span className="font-semibold">{testimonial.role}</span>}
              {testimonial.country && (
                <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {testimonial.country}
                </span>
              )}
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-1 pt-1">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs font-bold text-slate-700 ml-1">
                {testimonial.rating || 5} / 5
              </span>
            </div>
          </div>
        </div>

        {/* Trip Information */}
        {testimonial.tripName && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50/70 border border-amber-200/60 rounded-lg text-amber-900 text-xs font-semibold">
            <Compass className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Trip: {testimonial.tripName}</span>
          </div>
        )}

        {/* Testimonial Content */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-700 block">
            Testimonial Review
          </span>
          <p className="text-xs text-slate-700 leading-relaxed font-normal italic whitespace-pre-line bg-slate-50/70 border border-slate-200/60 rounded-xl p-3.5">
            &ldquo;{testimonial.content}&rdquo;
          </p>
        </div>
      </div>
    </AdminModal>
  );
}
