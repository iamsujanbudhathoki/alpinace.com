"use client";

import { useEffect, useState } from "react";
import { Save, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SettingService, MediaService } from "@/lib/services/admin-service";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppRichTextEditor } from "@/components/admin/rich-text/rich-text-editor";

export default function AdminTermsAndConditionsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const settings = await SettingService.getAll();
        setContent(settings?.termsAndConditions || "");
      } catch (err) {
        console.error("Failed to load terms and conditions:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleMediaUpload = async (file: File): Promise<string> => {
    const res = await MediaService.uploadFile(file);
    if (res.success && res.data?.path) {
      return res.data.path;
    }
    throw new Error("Media upload failed");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content || content.trim() === "" || content === "<p></p>") {
      toast.error("Terms & Conditions content cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const res = await SettingService.update({ termsAndConditions: content });
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
        toast.success(res.message || "Terms & Conditions saved successfully.");
      } else {
        toast.error(res.message || "Failed to save Terms & Conditions.");
      }
    } catch (err: any) {
      console.error("Failed to save terms and conditions:", err);
      toast.error(err?.message || "Failed to save Terms & Conditions.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-600">
          Loading Terms &amp; Conditions...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      <AdminPageHeader
        title="Terms & Conditions"
        description="Edit the Terms & Conditions displayed on the public website. Changes take effect immediately after saving."
      />

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Terms &amp; Conditions saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <Card className="p-6 md:p-8 bg-white border-slate-200 shadow-none space-y-4 rounded-xl">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900">Content</h2>
            <p className="text-xs text-slate-500 mt-1">
              Write your full Terms &amp; Conditions below. Supports headings, lists, links, and tables.
            </p>
          </div>

          <AppRichTextEditor
            value={content}
            onChange={setContent}
            onMediaUpload={handleMediaUpload}
            showMediaUpload={false}
            placeholder="Start writing your Terms & Conditions..."
            height="500px"
          />
        </Card>

        {/* Save Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-600 font-medium">
            The saved content will appear on the public Terms &amp; Conditions page immediately.
          </p>
          <Button
            type="submit"
            disabled={saving}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-6 py-2.5 rounded-lg cursor-pointer flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Terms &amp; Conditions</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
