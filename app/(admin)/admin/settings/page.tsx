"use client";

import { useState } from "react";
import {
  Shield,
  CreditCard,
  Check,
  Save,
  Building,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AdminSettingsPage() {
  const [agencyName, setAgencyName] = useState("AlpineAce Expeditions Pvt. Ltd.");
  const [licenseNumber, setLicenseNumber] = useState("NTB-REGISTERED-34981/2024");
  const [whatsapp, setWhatsapp] = useState("+977 9800000000");
  const [currency, setCurrency] = useState("USD ($)");
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [wireTransferEnabled, setWireTransferEnabled] = useState(true);
  const [timsAutoProcess, setTimsAutoProcess] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Component */}
      <AdminPageHeader
        title="Agency Settings & Operations"
        description="Configure AlpineAce business profile, payment gateways, and permit rules."
      />

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Agency settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Agency Profile */}
        <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-600" />
            <span>Business Profile & Credentials</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Company Registered Name</label>
              <Input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tourism Board License #</label>
              <Input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">WhatsApp Operations Hotline</label>
              <Input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
              />
            </div>
          </div>
        </Card>

        {/* Currency & Financial Config */}
        <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span>Payment Gateways & Currency</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Primary Settlement Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full sm:w-64 bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-md px-3 py-2 text-xs focus:outline-none"
              >
                <option value="USD ($)">USD ($) - United States Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="NPR (Rs)">NPR (Rs) - Nepalese Rupee</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900">Stripe Card Gateway (International)</div>
                  <div className="text-[10px] text-slate-500 font-medium">Accept Visa, Mastercard, AMEX for trek deposits</div>
                </div>
                <input
                  type="checkbox"
                  checked={stripeEnabled}
                  onChange={(e) => setStripeEnabled(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900">Swift / International Bank Transfer</div>
                  <div className="text-[10px] text-slate-500 font-medium">Provide Himalayan Bank Ltd. SWIFT wire instructions</div>
                </div>
                <input
                  type="checkbox"
                  checked={wireTransferEnabled}
                  onChange={(e) => setWireTransferEnabled(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Automation & Permit Rules */}
        <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Permit & Compliance Automation</span>
          </h2>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <div className="font-bold text-slate-900">Auto-Submit TIMS Permit Data</div>
              <div className="text-[10px] text-slate-500 font-medium">Automatically push guest passport data to Nepal Tourism API upon deposit receipt</div>
            </div>
            <input
              type="checkbox"
              checked={timsAutoProcess}
              onChange={(e) => setTimsAutoProcess(e.target.checked)}
              className="w-4 h-4 accent-slate-900 cursor-pointer"
            />
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-6 py-2"
          >
            <Save className="w-4 h-4 mr-1.5 text-amber-400" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
