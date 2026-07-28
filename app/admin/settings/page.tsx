"use client";

import { useState } from "react";
import {
  Settings,
  Shield,
  CreditCard,
  Globe,
  Bell,
  Check,
  Save,
  Phone,
  Building,
} from "lucide-react";

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
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-charcoal-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-offwhite-50">
            Agency Settings & Operations
          </h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Configure AlpineAce business profile, payment gateways, and permit rules.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>Agency settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Agency Profile */}
        <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
          <h2 className="text-sm font-bold text-offwhite-50 flex items-center gap-2">
            <Building className="w-4 h-4 text-gold-400" />
            <span>Business Profile & Credentials</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-charcoal-400 font-semibold mb-1">Company Registered Name</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-charcoal-400 font-semibold mb-1">Tourism Board License #</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none focus:border-gold-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-charcoal-400 font-semibold mb-1">WhatsApp Operations Hotline</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Config */}
        <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
          <h2 className="text-sm font-bold text-offwhite-50 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gold-400" />
            <span>Payment Gateways & Currency</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-charcoal-400 font-semibold mb-1">Primary Settlement Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full sm:w-64 bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="USD ($)">USD ($) - United States Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="NPR (Rs)">NPR (Rs) - Nepalese Rupee</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-charcoal-800">
              <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-950 border border-charcoal-800">
                <div>
                  <div className="font-semibold text-offwhite-100">Stripe Card Gateway (International)</div>
                  <div className="text-[10px] text-charcoal-400">Accept Visa, Mastercard, AMEX for trek deposits</div>
                </div>
                <input
                  type="checkbox"
                  checked={stripeEnabled}
                  onChange={(e) => setStripeEnabled(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-950 border border-charcoal-800">
                <div>
                  <div className="font-semibold text-offwhite-100">Swift / International Bank Transfer</div>
                  <div className="text-[10px] text-charcoal-400">Provide Himalayan Bank Ltd. SWIFT wire instructions</div>
                </div>
                <input
                  type="checkbox"
                  checked={wireTransferEnabled}
                  onChange={(e) => setWireTransferEnabled(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Automation & Permit Rules */}
        <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
          <h2 className="text-sm font-bold text-offwhite-50 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold-400" />
            <span>Permit & Compliance Automation</span>
          </h2>

          <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 text-xs">
            <div>
              <div className="font-semibold text-offwhite-100">Auto-Submit TIMS Permit Data</div>
              <div className="text-[10px] text-charcoal-400">Automatically push guest passport data to Nepal Tourism API upon deposit receipt</div>
            </div>
            <input
              type="checkbox"
              checked={timsAutoProcess}
              onChange={(e) => setTimsAutoProcess(e.target.checked)}
              className="w-4 h-4 accent-gold-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-xs shadow-lg shadow-gold-500/10 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
