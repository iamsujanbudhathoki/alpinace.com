"use client";

import { useEffect, useState } from "react";
import {
  Building,
  Search,
  Share2,
  Save,
  Check,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  MessageCircle,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { SettingService } from "@/lib/services/admin-service";
import { websiteDomain } from "@/lib/env.constants";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Agency Profile
    siteName: "",
    siteLogo: "",
    tagline: "",
    siteDescription: "",
    contactEmail: "",
    contactPhone: "",
    emergencyPhone: "",
    whatsappNumber: "",
    companyAddress: "",
    googleMapsUrl: "",
    officeHours: "",

    // SEO & Webmaster
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",

    // Social Links
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    tripadvisorUrl: "",
    linkedinUrl: "",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await SettingService.getAll();
        if (settings && Object.keys(settings).length > 0) {
          setFormData((prev) => ({
            ...prev,
            ...settings,
          }));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await SettingService.update(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
      if (res.success) {
        toast.success(res.message || "Site settings updated successfully!");
      } else {
        toast.error(res.message || "Failed to update settings");
      }
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      toast.error(err.message || "Failed to save settings to backend");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-600">
          Loading agency settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Top Header */}
      <AdminPageHeader
        title="Agency & Website Settings"
        description="Manage your agency contact credentials, Google Maps location, SEO metadata, and social links."
      />

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            All agency settings and SEO configuration saved successfully!
          </span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* 1. Agency Business Profile & Contact */}
        <Card className="p-6 md:p-8 bg-white border-slate-200 shadow-none space-y-6 rounded-xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100/80 border border-slate-200/60 flex items-center justify-center text-slate-700">
                <Building className="w-4 h-4" />
              </div>
              <span>Agency Profile &amp; Contact Details</span>
            </h2>
            <span className="text-[11px] font-semibold text-slate-600">
              Public Contact Info
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label htmlFor="settings-site-name" className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-600" />
                <span>Company Registered Name</span>
              </label>
              <Input
                id="settings-site-name"
                type="text"
                value={formData.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                placeholder="e.g. Alpine Ace Treks & Expeditions"
                className="text-xs"
                required
              />
            </div>

            <div>
              <label htmlFor="settings-tagline" className="block text-slate-700 font-bold mb-1.5">
                Company Slogan / Tagline
              </label>
              <Input
                id="settings-tagline"
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                placeholder="e.g. Venture Beyond the Ordinary"
                className="text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="settings-site-description" className="block text-slate-700 font-bold mb-1.5">
                Agency Bio / Footer Summary
              </label>
              <textarea
                id="settings-site-description"
                rows={3}
                value={formData.siteDescription || ""}
                onChange={(e) => handleChange("siteDescription", e.target.value)}
                placeholder="e.g. Locally-owned trek and expedition agency based in Thamel, Kathmandu. Guided routes across Everest, Annapurna, Manaslu, and Langtang..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none resize-y"
              />
            </div>

            {/* Agency Brand Logo Upload */}
            <div className="md:col-span-2 space-y-1.5 pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-500 mb-2">
                Upload your official company logo. This logo will automatically display on the website header, mobile drawer menu, and footer.
              </p>
              <AdminImageUpload
                id="settings-site-logo"
                label="Site Logo"
                value={formData.siteLogo || ""}
                onChange={(url) => handleChange("siteLogo", url)}
              />
            </div>

            <div>
              <label htmlFor="settings-contact-email" className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-600" />
                <span>Operations &amp; Booking Email</span>
              </label>
              <Input
                id="settings-contact-email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                placeholder="info@alpineacetreks.com"
                className="text-xs"
                required
              />
            </div>

            <div>
              <label htmlFor="settings-contact-phone" className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>Primary Office Landline Phone</span>
              </label>
              <Input
                id="settings-contact-phone"
                type="text"
                value={formData.contactPhone}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
                placeholder="+977 1 4700543"
                className="text-xs"
              />
            </div>

            <div>
              <label htmlFor="settings-emergency-phone" className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                <span>24/7 Mountain Emergency Hotline</span>
              </label>
              <Input
                id="settings-emergency-phone"
                type="text"
                value={formData.emergencyPhone}
                onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                placeholder="+977 9851000000"
                className="text-xs"
              />
            </div>

            <div>
              <label htmlFor="settings-whatsapp-number" className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Official WhatsApp Number (E.164 digits)</span>
              </label>
              <Input
                id="settings-whatsapp-number"
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                placeholder="9779851000000 (no leading +)"
                className="text-xs"
              />
              <span className="text-[11px] text-slate-600 mt-1 block">
                Used by the floating WhatsApp chat widget across the website.
              </span>
            </div>

            <div>
              <label htmlFor="settings-company-address" className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                <span>Physical Office Address</span>
              </label>
              <Input
                id="settings-company-address"
                type="text"
                value={formData.companyAddress}
                onChange={(e) => handleChange("companyAddress", e.target.value)}
                placeholder="Thamel Marg, Ward 26, Kathmandu, Nepal"
                className="text-xs"
              />
            </div>

            <div>
              <label htmlFor="settings-office-hours" className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                <span>Office Business Hours</span>
              </label>
              <Input
                id="settings-office-hours"
                type="text"
                value={formData.officeHours}
                onChange={(e) => handleChange("officeHours", e.target.value)}
                placeholder="Sun - Fri: 09:00 AM - 06:00 PM (NPT)"
                className="text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="settings-google-maps-url" className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-600" />
                <span>Google Maps Location / Embed URL</span>
              </label>
              <Input
                id="settings-google-maps-url"
                type="text"
                value={formData.googleMapsUrl}
                onChange={(e) => handleChange("googleMapsUrl", e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="text-xs"
              />
            </div>
          </div>
        </Card>

        {/* 2. Global SEO & Webmaster Configuration */}
        <Card className="p-6 md:p-8 bg-white border-slate-200 shadow-xs space-y-6 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
                <Search className="w-4 h-4" />
              </div>
              <span>Global SEO &amp; Search Engine Settings</span>
            </h2>
            <span className="text-[11px] font-semibold text-slate-600">
              Google Search &amp; Meta Tags
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="settings-meta-title" className="text-slate-700 font-bold">
                  Global Homepage Meta Title
                </label>
                <span className="text-[11px] text-slate-600 font-medium">
                  {formData.metaTitle.length}/65 chars recommended
                </span>
              </div>
              <Input
                id="settings-meta-title"
                type="text"
                value={formData.metaTitle}
                onChange={(e) => handleChange("metaTitle", e.target.value)}
                placeholder="Alpine Ace | Nepal Trekking, Historical Tours & Peak Expeditions"
                className="text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="settings-meta-description" className="text-slate-700 font-bold">
                  Global Search Meta Description
                </label>
                <span className="text-[11px] text-slate-600 font-medium">
                  {formData.metaDescription.length}/160 chars recommended
                </span>
              </div>
              <textarea
                id="settings-meta-description"
                rows={3}
                value={formData.metaDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange("metaDescription", e.target.value)
                }
                placeholder="Provide a compelling 2-3 sentence overview of Alpine Ace for Google search snippets..."
                className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label htmlFor="settings-meta-keywords" className="block text-slate-700 font-bold mb-1.5">
                Target SEO Keywords (Comma Separated)
              </label>
              <Input
                id="settings-meta-keywords"
                type="text"
                value={formData.metaKeywords}
                onChange={(e) => handleChange("metaKeywords", e.target.value)}
                placeholder="Nepal trekking, Everest Base Camp, peak climbing, mountain guides, luxury lodges"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label htmlFor="settings-canonical-url" className="block text-slate-700 font-bold mb-1.5">
                  Canonical Site URL
                </label>
                <Input
                  id="settings-canonical-url"
                  type="text"
                  value={formData.canonicalUrl}
                  onChange={(e) => handleChange("canonicalUrl", e.target.value)}
                  placeholder={websiteDomain}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Social Media & Online Profiles */}
        <Card className="p-6 md:p-8 bg-white border-slate-200 shadow-xs space-y-6 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600">
                <Share2 className="w-4 h-4" />
              </div>
              <span>Social Media &amp; Review Profiles</span>
            </h2>
            <span className="text-[11px] font-semibold text-slate-600">
              Header &amp; Footer Links
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label htmlFor="settings-facebook-url" className="block text-slate-700 font-bold mb-1.5">
                Facebook Page URL
              </label>
              <Input
                id="settings-facebook-url"
                type="text"
                value={formData.facebookUrl}
                onChange={(e) => handleChange("facebookUrl", e.target.value)}
                placeholder="https://facebook.com/alpineacenepal"
                className="text-xs"
              />
            </div>

            <div>
              <label htmlFor="settings-instagram-url" className="block text-slate-700 font-bold mb-1.5">
                Instagram Profile URL
              </label>
              <Input
                id="settings-instagram-url"
                type="text"
                value={formData.instagramUrl}
                onChange={(e) => handleChange("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/alpineacenepal"
                className="text-xs"
              />
            </div>

            <div>
              <label htmlFor="settings-youtube-url" className="block text-slate-700 font-bold mb-1.5">
                YouTube Channel URL
              </label>
              <Input
                id="settings-youtube-url"
                type="text"
                value={formData.youtubeUrl}
                onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                placeholder="https://youtube.com/@alpineacenepal"
                className="text-xs"
              />
            </div>

            <div>
              <label htmlFor="settings-tripadvisor-url" className="block text-slate-700 font-bold mb-1.5">
                TripAdvisor Profile URL
              </label>
              <Input
                id="settings-tripadvisor-url"
                type="text"
                value={formData.tripadvisorUrl}
                onChange={(e) => handleChange("tripadvisorUrl", e.target.value)}
                placeholder="https://tripadvisor.com/..."
                className="text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="settings-linkedin-url" className="block text-slate-700 font-bold mb-1.5">
                LinkedIn Company Page
              </label>
              <Input
                id="settings-linkedin-url"
                type="text"
                value={formData.linkedinUrl}
                onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/company/alpine-ace-expeditions"
                className="text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Save Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-600 font-medium">
            Changes apply instantly to the website, search previews, and inquiry
            endpoints.
          </p>

          <Button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
