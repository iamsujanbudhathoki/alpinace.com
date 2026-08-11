"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Sparkles, 
  Calendar, 
  Clock, 
  Tag, 
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { BlogArticle, BlogStatus } from "@/lib/admin-data";
import { blogSchema, BlogFormValues } from "@/lib/admin-schemas";
import { 
  AdminInputField, 
  AdminSelectField, 
  AdminTextareaField 
} from "@/components/admin/forms/admin-form-fields";
import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload";
import { AppRichTextEditor } from "@/components/admin/rich-text/rich-text-editor";
import { MediaService } from "@/lib/services/admin-service";
import { Button } from "@/components/ui/button";

interface BlogArticleFormProps {
  initialData?: BlogArticle | null;
  isEdit?: boolean;
  onSubmit: (values: BlogFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const CATEGORY_OPTIONS = [
  { label: "Expedition Prep", value: "Expedition Prep" },
  { label: "Trekking Guides", value: "Trekking Guides" },
  { label: "Sherpa Culture", value: "Sherpa Culture" },
  { label: "Gear & Equipment", value: "Gear & Equipment" },
  { label: "Safety & Health", value: "Safety & Health" },
  { label: "Mountain Stories", value: "Mountain Stories" },
];

const STATUS_OPTIONS = [
  { label: "Published", value: BlogStatus.PUBLISHED },
  { label: "Draft", value: BlogStatus.DRAFT },
  { label: "Archived", value: BlogStatus.ARCHIVED },
];

export function BlogArticleForm({
  initialData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
}: BlogArticleFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<BlogFormValues>({
    title: initialData?.title || "",
    category: initialData?.category || "Expedition Prep",
    readTime: initialData?.readTime || "5 min read",
    status: initialData?.status || BlogStatus.PUBLISHED,
    publishedDate: initialData?.publishedDate || new Date().toISOString().split("T")[0],
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    image: initialData?.image || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localSubmitting, setLocalSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        category: initialData.category || "Expedition Prep",
        readTime: initialData.readTime || "5 min read",
        status: initialData.status || BlogStatus.PUBLISHED,
        publishedDate: initialData.publishedDate || new Date().toISOString().split("T")[0],
        excerpt: initialData.excerpt || "",
        content: initialData.content || "",
        image: initialData.image || "",
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof BlogFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleRichTextMediaUpload = async (file: File): Promise<string> => {
    try {
      const res = await MediaService.uploadFile(file);
      if (res?.data?.url) {
        return res.data.url;
      }
      return URL.createObjectURL(file);
    } catch (err) {
      console.error("Rich text image upload error:", err);
      toast.error("Failed to upload image to editor");
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = blogSchema.safeParse(formData);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(formattedErrors);
      toast.error("Please resolve the validation errors before saving.");
      return;
    }

    setLocalSubmitting(true);
    try {
      await onSubmit(result.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to save blog article.");
    } finally {
      setLocalSubmitting(false);
    }
  };

  const loading = isSubmitting || localSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blogs"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>{isEdit ? "Edit Blog Article" : "Create New Blog Article"}</span>
            </h1>
            <p className="text-xs text-slate-700 font-medium">
              {isEdit ? "Modify article content, metadata, and publication status." : "Draft a new expedition guide or mountain journal."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/admin/blogs" className="w-1/2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-slate-700 border-slate-300 font-semibold text-xs cursor-pointer"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="w-1/2 sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-400" />
                <span>{isEdit ? "Update Article" : "Publish Article"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 cols): Article Details & Rich-Text Editor */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Article Basic Information Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Article Overview
            </h2>

            <AdminInputField
              label="Article Title"
              placeholder="e.g. Essential Gear List for Everest Base Camp Trek 2026"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              error={errors.title}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminSelectField
                label="Category"
                options={CATEGORY_OPTIONS}
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                error={errors.category}
                required
              />

              <AdminSelectField
                label="Status"
                options={STATUS_OPTIONS}
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value as any)}
                error={errors.status}
                required
              />
            </div>

            <AdminTextareaField
              label="Article Excerpt / Summary"
              placeholder="Provide a short 2-3 sentence overview that will appear on blog listing cards and search previews..."
              rows={3}
              value={formData.excerpt || ""}
              onChange={(e) => handleChange("excerpt", e.target.value)}
              error={errors.excerpt}
            />
          </div>

          {/* Rich Text Editor Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Rich Text Article Body
              </h2>
              <span className="text-xs text-slate-600 font-medium">TipTap Editor with Full Formatting</span>
            </div>

            <AppRichTextEditor
              value={formData.content || ""}
              onChange={(htmlValue) => handleChange("content", htmlValue)}
              onMediaUpload={handleRichTextMediaUpload}
              placeholder="Write your article content here... Add headings, images, blockquotes, lists, and formatted tables."
              showMediaUpload={true}
              height="450px"
            />
            {errors.content && (
              <p className="text-xs font-semibold text-rose-600 mt-1">{errors.content}</p>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Featured Image & Publishing Meta */}
        <div className="space-y-6">

          {/* Featured Image Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500" />
              Featured Cover Image
            </h2>

            <AdminImageUpload
              label="Cover Image"
              value={formData.image || ""}
              onChange={(url) => handleChange("image", url)}
              error={errors.image}
            />
          </div>

          {/* Publication Metadata Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Publication Settings
            </h2>

            <AdminInputField
              label="Published Date"
              type="date"
              value={formData.publishedDate || ""}
              onChange={(e) => handleChange("publishedDate", e.target.value)}
              error={errors.publishedDate}
            />

            <AdminInputField
              label="Estimated Read Time"
              placeholder="e.g. 5 min read"
              value={formData.readTime}
              onChange={(e) => handleChange("readTime", e.target.value)}
              error={errors.readTime}
            />
          </div>

        </div>
      </div>
    </form>
  );
}
