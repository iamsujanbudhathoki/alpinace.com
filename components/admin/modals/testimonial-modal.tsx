"use client";

import { useState, useEffect } from "react";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Star } from "lucide-react";
import { TestimonialItem, TestimonialFormValues, adminTestimonialsApi } from "@/lib/services/admin-service";
import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload";
import { AdminInputField, AdminSelectField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { AdminCountrySelect } from "@/components/admin/forms/admin-country-select";
import { toast } from "sonner";

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  testimonialToEdit?: TestimonialItem | null;
}

export function TestimonialModal({
  isOpen,
  onClose,
  onSuccess,
  testimonialToEdit,
}: TestimonialModalProps) {
  const [formData, setFormData] = useState<TestimonialFormValues>({
    author: "",
    role: "",
    country: "",
    tripName: "",
    content: "",
    avatar: "",
    rating: 5,
    status: "active",
    order: 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setSaving(false);
    if (testimonialToEdit) {
      setFormData({
        author: testimonialToEdit.author || "",
        role: testimonialToEdit.role || "",
        country: testimonialToEdit.country || "",
        tripName: testimonialToEdit.tripName || "",
        content: testimonialToEdit.content || "",
        avatar: testimonialToEdit.avatar || "",
        rating: testimonialToEdit.rating ?? 5,
        status: testimonialToEdit.status || "active",
        order: testimonialToEdit.order ?? 0,
      });
    } else {
      setFormData({
        author: "",
        role: "",
        country: "",
        tripName: "",
        content: "",
        avatar: "",
        rating: 5,
        status: "active",
        order: 0,
      });
    }
  }, [testimonialToEdit, isOpen]);

  const handleClose = () => {
    setError(null);
    setSaving(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author.trim()) {
      setError("Customer/Author name is required.");
      return;
    }
    if (!formData.content.trim()) {
      setError("Testimonial content is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = testimonialToEdit
        ? await adminTestimonialsApi.update(testimonialToEdit.id, formData)
        : await adminTestimonialsApi.create(formData);

      if (res.success) {
        toast.success(res.message || (testimonialToEdit ? `Updated testimonial by "${formData.author}" successfully` : `Added testimonial by "${formData.author}"`));
        onSuccess();
        handleClose();
      } else {
        const msg = res.message || "Failed to save testimonial. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      console.error("Failed to save testimonial:", err);
      const msg = err?.message || "Failed to save testimonial. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-2.5">
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={saving}
        className="text-xs font-semibold h-9 px-4 rounded-lg cursor-pointer"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="testimonial-form"
        disabled={saving}
        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-9 px-4 rounded-lg cursor-pointer flex items-center gap-1.5"
      >
        {saving ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save className="w-3.5 h-3.5" />
            <span>{testimonialToEdit ? "Update Testimonial" : "Create Testimonial"}</span>
          </>
        )}
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={handleClose}
      title={testimonialToEdit ? "Edit Testimonial" : "Create New Testimonial"}
      description="Manage customer reviews, trekker feedback, and rating scores."
      footer={footer}
      maxWidth="lg"
      fixedHeight={false}
    >
      {error && (
        <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <form id="testimonial-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Customer / Author Name */}
        <AdminInputField
          label="Customer / Author Name"
          required
          type="text"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          placeholder="e.g. Jonathan Vance"
        />

        {/* Role & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminInputField
            label="Role / Designation"
            type="text"
            value={formData.role || ""}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g. Expedition Member"
          />

          <AdminCountrySelect
            label="Country / Origin"
            value={formData.country || ""}
            onChange={(val) => setFormData({ ...formData, country: val })}
            placeholder="Select or search country..."
          />
        </div>

        {/* Trip Name & Rating */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminInputField
            label="Trip / Expedition Name"
            type="text"
            value={formData.tripName || ""}
            onChange={(e) => setFormData({ ...formData, tripName: e.target.value })}
            placeholder="e.g. Ama Dablam Expedition"
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Star Rating (1 - 5)
            </label>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                  title={`${star} Star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= (formData.rating || 5)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 fill-slate-100"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-slate-700">
                {formData.rating || 5} / 5
              </span>
            </div>
          </div>
        </div>

        {/* Customer Photo Upload */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Customer / Profile Photo
          </label>
          <AdminImageUpload
            value={formData.avatar || ""}
            onChange={(url, mediaId) => setFormData({ ...formData, avatar: url, avatarMediaId: mediaId })}
          />
        </div>

        {/* Display Order & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminInputField
            label="Display Order Priority"
            type="number"
            min={0}
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />

          <AdminSelectField
            label="Active Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
            options={[
              { label: "Active (Visible on Website)", value: "active" },
              { label: "Inactive (Hidden)", value: "inactive" },
            ]}
          />
        </div>

        {/* Testimonial Content */}
        <AdminTextareaField
          label="Testimonial Content"
          required
          rows={4}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter the full customer review or feedback statement..."
        />
      </form>
    </AdminModal>
  );
}
