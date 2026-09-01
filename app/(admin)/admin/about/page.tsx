"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Info,
  Globe,
  Save,
  Check,
  Loader2,
  ExternalLink,
  Plus,
  Trash2,
  FileText,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { AboutUsData, AboutUsService, MediaService } from "@/lib/services/admin-service";
import { websiteDomain } from "@/lib/env.constants";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AdminInputField,
  AdminTextareaField,
} from "@/components/admin/forms/admin-form-fields";
import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload";
import { AppRichTextEditor } from "@/components/admin/rich-text/rich-text-editor";
import { aboutUsSchema, isRichTextEmpty } from "@/lib/admin-schemas";

export default function AdminAboutUsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<AboutUsData>({
    heroTitle: "",
    heroSubtitle: "",
    heroImage: "",
    storyTitle: "",
    storyContent: "",
    storyImage: "",
    mission: "",
    vision: "",
    values: [],
    stats: [],
    status: "published",

    // Core Meta SEO
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  useEffect(() => {
    async function loadAboutUs() {
      try {
        const data = await AboutUsService.getAdmin();
        if (data) {
          setFormData({
            heroTitle: data.heroTitle || "",
            heroSubtitle: data.heroSubtitle || "",
            heroImage: data.heroImage || "",
            storyTitle: data.storyTitle || "",
            storyContent: data.storyContent || "",
            storyImage: data.storyImage || "",
            mission: data.mission || "",
            vision: data.vision || "",
            values: Array.isArray(data.values) ? data.values : [],
            stats: Array.isArray(data.stats) ? data.stats : [],
            status: data.status || "published",
            metaTitle: data.metaTitle || "",
            metaDescription: data.metaDescription || "",
            metaKeywords: data.metaKeywords || "",
          });
        }
      } catch (err) {
        console.error("Failed to load About Us content:", err);
        toast.error("Failed to load About Us content from backend");
      } finally {
        setLoading(false);
      }
    }
    loadAboutUs();
  }, []);

  const handleChange = (field: keyof AboutUsData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[field];
        return newErrs;
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

  // Stat item handlers
  const addStat = () => {
    setFormData((prev) => ({
      ...prev,
      stats: [...(prev.stats || []), { number: "", label: "" }],
    }));
  };

  const updateStat = (index: number, field: "number" | "label", val: string) => {
    setFormData((prev) => {
      const newStats = [...(prev.stats || [])];
      newStats[index] = { ...newStats[index], [field]: val };
      return { ...prev, stats: newStats };
    });
    const key = `stats.${index}.${field}`;
    if (errors[key]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[key];
        return newErrs;
      });
    }
  };

  const removeStat = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      stats: (prev.stats || []).filter((_, i) => i !== index),
    }));
  };

  // Value item handlers
  const addValue = () => {
    setFormData((prev) => ({
      ...prev,
      values: [...(prev.values || []), { title: "", desc: "" }],
    }));
  };

  const updateValue = (index: number, field: "title" | "desc", val: string) => {
    setFormData((prev) => {
      const newValues = [...(prev.values || [])];
      newValues[index] = { ...newValues[index], [field]: val };
      return { ...prev, values: newValues };
    });
    const key = `values.${index}.${field}`;
    if (errors[key]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[key];
        return newErrs;
      });
    }
  };

  const removeValue = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      values: (prev.values || []).filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const result = aboutUsSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const pathKey = issue.path.join(".");
        if (pathKey && !fieldErrors[pathKey]) {
          fieldErrors[pathKey] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please fix form validation errors before saving.");
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const res = await AboutUsService.update(formData);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
        toast.success(res.message || "About Us content saved successfully!");
      } else {
        toast.error(res.message || "Failed to save About Us content");
      }
    } catch (err: any) {
      console.error("Failed to save About Us content:", err);
      toast.error(err.message || "Failed to save content to backend");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-600">
          Loading About Us content...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <AdminPageHeader
        title="About Us Management"
        description="Manage company story, commitments, mission, vision, and public page SEO metadata."
      >
        <Link href="/about" target="_blank">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-slate-700 border-slate-300 font-semibold text-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>View Public Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Button>
        </Link>
      </AdminPageHeader>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            About Us page content and SEO metadata saved successfully!
          </span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "content"
              ? "border-slate-900 text-slate-900 font-bold"
              : "border-transparent text-slate-700 hover:text-slate-900"
          }`}
        >
          <Info className="w-4 h-4 text-slate-700" />
          <span>Page Content</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "seo"
              ? "border-slate-900 text-slate-900 font-bold"
              : "border-transparent text-slate-700 hover:text-slate-900"
          }`}
        >
          <Globe className="w-4 h-4 text-slate-700" />
          <span>SEO &amp; Metadata</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {activeTab === "content" ? (
          <>
            {/* 1. Page Hero Section */}
            <Card className="p-6 bg-white border-slate-200 shadow-none space-y-5 rounded-xl">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Hero Section
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Primary banner and introductory text displayed at the top of the /about page.
                </p>
              </div>

              <div className="space-y-4">
                <AdminInputField
                  label="Hero Heading (H1)"
                  required={true}
                  placeholder="e.g. Sherpa-guided treks planned from Kathmandu."
                  value={formData.heroTitle || ""}
                  onChange={(e) => handleChange("heroTitle", e.target.value)}
                  error={errors.heroTitle}
                />

                <AdminTextareaField
                  label="Hero Subtitle / Overview"
                  placeholder="Provide a 2-3 sentence overview introducing AlpineAce's history and mission..."
                  rows={3}
                  value={formData.heroSubtitle || ""}
                  onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                  error={errors.heroSubtitle}
                />

                <AdminImageUpload
                  label="Hero Background Image"
                  value={formData.heroImage || ""}
                  onChange={(url, mediaId) =>
                    setFormData((prev) => ({ ...prev, heroImage: url, heroMediaId: mediaId }))
                  }
                  error={errors.heroImage}
                  libraryOnly={true}
                />
              </div>
            </Card>

            {/* 2. Story & Main Description */}
            <Card className="p-6 bg-white border-slate-200 shadow-none space-y-5 rounded-xl">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Company Story &amp; Narrative
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Detailed backstory, history, and narrative about AlpineAce.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AdminInputField
                    label="Story Section Heading"
                    placeholder="e.g. Twelve years of guided expeditions"
                    value={formData.storyTitle || ""}
                    onChange={(e) => handleChange("storyTitle", e.target.value)}
                    error={errors.storyTitle}
                  />

                  <AdminImageUpload
                    label="Story Image (Optional)"
                    value={formData.storyImage || ""}
                    onChange={(url, mediaId) =>
                      setFormData((prev) => ({ ...prev, storyImage: url, storyMediaId: mediaId }))
                    }
                    error={errors.storyImage}
                    libraryOnly={true}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 block">
                    Story Content (Rich Text)
                  </label>
                  <AppRichTextEditor
                    value={formData.storyContent || ""}
                    onChange={(html) => handleChange("storyContent", html)}
                    onMediaUpload={handleRichTextMediaUpload}
                    placeholder="Write your company story, origins, and expedition background..."
                    showMediaUpload={true}
                    height="300px"
                  />
                  {errors.storyContent && (
                    <p className="text-xs font-semibold text-rose-600 mt-0.5">
                      {errors.storyContent}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* 3. Mission & Vision */}
            <Card className="p-6 bg-white border-slate-200 shadow-none space-y-5 rounded-xl">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Mission &amp; Vision Statements
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Optional mission and vision statements. If left empty, these blocks are gracefully hidden on the frontend.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-slate-600" />
                    <span>Our Mission (Rich Text)</span>
                  </label>
                  <AppRichTextEditor
                    value={formData.mission || ""}
                    onChange={(html) => handleChange("mission", html)}
                    onMediaUpload={handleRichTextMediaUpload}
                    placeholder="Describe your company's primary mission..."
                    showMediaUpload={false}
                    height="200px"
                  />
                  {errors.mission && (
                    <p className="text-xs font-semibold text-rose-600 mt-0.5">
                      {errors.mission}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>Our Vision (Rich Text)</span>
                  </label>
                  <AppRichTextEditor
                    value={formData.vision || ""}
                    onChange={(html) => handleChange("vision", html)}
                    onMediaUpload={handleRichTextMediaUpload}
                    placeholder="Describe your company's long-term vision..."
                    showMediaUpload={false}
                    height="200px"
                  />
                  {errors.vision && (
                    <p className="text-xs font-semibold text-rose-600 mt-0.5">
                      {errors.vision}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* 4. Stats & Highlights */}
            <Card className="p-6 bg-white border-slate-200 shadow-none space-y-5 rounded-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Key Highlights &amp; Statistics
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Highlight statistics displayed alongside the story (e.g. 100% Sherpa owned).
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={addStat}
                  size="sm"
                  variant="outline"
                  className="text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stat</span>
                </Button>
              </div>

              <div className="space-y-3">
                {(!formData.stats || formData.stats.length === 0) && (
                  <p className="text-xs text-slate-500 italic py-1">
                    No stats added yet. Click &quot;Add Stat&quot; above to add highlight counters.
                  </p>
                )}

                {formData.stats?.map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <div className="w-full sm:w-1/3">
                      <AdminInputField
                        label="Stat Number"
                        required={true}
                        placeholder="e.g. 100% or 25+"
                        value={stat.number}
                        onChange={(e) => updateStat(idx, "number", e.target.value)}
                        error={errors[`stats.${idx}.number`]}
                      />
                    </div>
                    <div className="w-full sm:flex-1">
                      <AdminInputField
                        label="Stat Label"
                        required={true}
                        placeholder="e.g. Sherpa owned & operated"
                        value={stat.label}
                        onChange={(e) => updateStat(idx, "label", e.target.value)}
                        error={errors[`stats.${idx}.label`]}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStat(idx)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0 self-end sm:self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* 5. Core Values */}
            <Card className="p-6 bg-white border-slate-200 shadow-none space-y-5 rounded-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Core Commitments &amp; Values
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Core company values and ethical principles.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={addValue}
                  size="sm"
                  variant="outline"
                  className="text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Commitment</span>
                </Button>
              </div>

              <div className="space-y-3">
                {(!formData.values || formData.values.length === 0) && (
                  <p className="text-xs text-slate-500 italic py-1">
                    No commitments added yet. Click &quot;Add Commitment&quot; to list core company values.
                  </p>
                )}

                {formData.values?.map((val, idx) => (
                  <div
                    key={idx}
                    className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Commitment #{idx + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeValue(idx)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 px-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span className="text-xs font-semibold">Remove</span>
                      </Button>
                    </div>

                    <AdminInputField
                      label="Commitment Title"
                      required={true}
                      placeholder="e.g. Environmental responsibility"
                      value={val.title}
                      onChange={(e) => updateValue(idx, "title", e.target.value)}
                      error={errors[`values.${idx}.title`]}
                    />

                    <AdminTextareaField
                      label="Commitment Description"
                      required={true}
                      placeholder="Description explaining this commitment..."
                      rows={2}
                      value={val.desc}
                      onChange={(e) => updateValue(idx, "desc", e.target.value)}
                      error={errors[`values.${idx}.desc`]}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          /* SEO & Metadata Tab */
          <Card className="p-6 bg-white border-slate-200 shadow-none space-y-5 rounded-xl">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                SEO &amp; Social Media Metadata
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Configure search engine title, meta description, canonical URL, and Open Graph share previews.
              </p>
            </div>

            {/* Google SERP Snippet Preview */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-xs font-medium text-emerald-800 truncate">
                {`${websiteDomain}/about`}
              </div>
              <div className="text-sm font-bold text-blue-700 truncate">
                {formData.metaTitle?.trim() ||
                  (formData.heroTitle
                    ? `${formData.heroTitle} | AlpineAce`
                    : "About AlpineAce | Our Team, Sherpa Heritage & Values")}
              </div>
              <div className="text-xs text-slate-600 font-normal line-clamp-2 leading-relaxed">
                {formData.metaDescription?.trim() ||
                  formData.heroSubtitle?.trim() ||
                  "AlpineAce is a Sherpa-owned trekking and expedition company based in Thamel, Kathmandu."}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900">
                    Meta Title
                  </label>
                  <span
                    className={`text-[10px] font-semibold ${
                      (formData.metaTitle?.length || 0) > 100
                        ? "text-rose-600"
                        : "text-slate-400"
                    }`}
                  >
                    {formData.metaTitle?.length || 0} / 100
                  </span>
                </div>
                <AdminInputField
                  placeholder="e.g. About AlpineAce | Our Team, Sherpa Heritage & Values"
                  value={formData.metaTitle || ""}
                  onChange={(e) => handleChange("metaTitle", e.target.value)}
                  error={errors.metaTitle}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900">
                    Meta Description
                  </label>
                  <span
                    className={`text-[10px] font-semibold ${
                      (formData.metaDescription?.length || 0) > 300
                        ? "text-rose-600"
                        : "text-slate-400"
                    }`}
                  >
                    {formData.metaDescription?.length || 0} / 300
                  </span>
                </div>
                <AdminTextareaField
                  rows={3}
                  placeholder="Brief summary for Google search result snippets and social media previews..."
                  value={formData.metaDescription || ""}
                  onChange={(e) => handleChange("metaDescription", e.target.value)}
                  error={errors.metaDescription}
                />
              </div>

              <AdminInputField
                label="Focus Keywords (comma separated)"
                placeholder="e.g. About AlpineAce, Sherpa owned trek company, Kathmandu agency"
                value={formData.metaKeywords || ""}
                onChange={(e) => handleChange("metaKeywords", e.target.value)}
                error={errors.metaKeywords}
              />
              {formData.metaKeywords && (
                <div className="flex flex-wrap gap-1 items-center pt-1">
                  {formData.metaKeywords.split(",").map(
                    (kw, i) =>
                      kw.trim() && (
                        <span
                          key={i}
                          className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                        >
                          {kw.trim()}
                        </span>
                      )
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Sticky Bottom Actions Bar */}
        <div className="sticky bottom-4 sm:bottom-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-lg flex items-center justify-between sm:justify-end gap-3 transition-all">
          <Link href="/admin" className="w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-slate-700 border-slate-300 font-semibold text-xs cursor-pointer"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-400" />
                <span>Save All Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
