"use client";

import { useEffect, useState } from "react";
import { Check, Save, Building } from "lucide-react";
import { toast } from "sonner";
import { SettingService } from "@/lib/services/admin-service";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("Alpine Ace Expeditions");
  const [contactEmail, setContactEmail] = useState("expeditions@alpineace.com");
  const [contactPhone, setContactPhone] = useState("+977 1 4545890");
  const [companyAddress, setCompanyAddress] = useState("Thamel, Kathmandu, Nepal");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await SettingService.getAll();
        if (settings) {
          if (settings.siteName) setSiteName(settings.siteName);
          if (settings.contactEmail) setContactEmail(settings.contactEmail);
          if (settings.contactPhone) setContactPhone(settings.contactPhone);
          if (settings.companyAddress) setCompanyAddress(settings.companyAddress);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await SettingService.update({
        siteName,
        contactEmail,
        contactPhone,
        companyAddress,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      toast.error(err.message || "Failed to save agency settings");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header Component */}
      <AdminPageHeader
        title="Agency Settings"
        description="Configure AlpineAce official business profile and contact information."
      />

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Agency settings saved successfully to backend!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Agency Profile */}
        <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-600" />
            <span>Business Profile &amp; Contact Info</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Company Registered Name</label>
              <Input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200 text-slate-900 font-medium focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Operations Contact Email</label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200 text-slate-900 font-medium focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Operations Contact Phone</label>
              <Input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200 text-slate-900 font-medium focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Physical Address</label>
              <Input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200 text-slate-900 font-medium focus:bg-white"
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
