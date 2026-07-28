"use client";

import { useState } from "react";
import { Check, Save, Building } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AdminSettingsPage() {
  const [agencyName, setAgencyName] = useState("AlpineAce Expeditions Pvt. Ltd.");
  const [licenseNumber, setLicenseNumber] = useState("NTB-REGISTERED-34981/2024");
  const [email, setEmail] = useState("operations@alpineace.com");
  const [whatsapp, setWhatsapp] = useState("+977 9800000000");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
          <span>Agency settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Agency Profile */}
        <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-600" />
            <span>Business Profile & Contact Info</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Company Registered Name</label>
              <Input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tourism Board License #</label>
              <Input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Operations Contact Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">WhatsApp Operations Hotline</label>
              <Input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
