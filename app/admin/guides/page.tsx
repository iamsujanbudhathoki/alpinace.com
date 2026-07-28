"use client";

import { useState } from "react";
import {
  Users,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  Plus,
  Search,
  CheckCircle,
  MapPin,
  X,
  Mountain,
} from "lucide-react";
import { mockGuides, Guide } from "@/lib/admin-data";

export default function AdminGuidesPage() {
  const [guides, setGuides] = useState<Guide[]>(mockGuides);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New guide form state
  const [newGuideName, setNewGuideName] = useState("");
  const [newRole, setNewRole] = useState<Guide["role"]>("Senior Trekking Guide");
  const [newSummits, setNewSummits] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const filteredGuides = guides.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.certifications.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuideName) return;

    const createdGuide: Guide = {
      id: `gd-${Date.now()}`,
      name: newGuideName,
      role: newRole,
      summitStats: newSummits || "1x Everest, 2x Mera Peak",
      certifications: ["NMA Certified Mountain Guide", "Alpine First Aid"],
      status: "Available",
      phone: newPhone || "+977 9800-000000",
      email: newEmail || `${newGuideName.toLowerCase().replace(/\s+/g, ".")}@alpineace.com`,
      avatarUrl: "",
    };

    setGuides([...guides, createdGuide]);
    setShowAddModal(false);
    setNewGuideName("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-offwhite-50">
            Sherpa Guides & Expedition Crew
          </h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Certified IFMGA and NMA high-altitude Sherpa leaders, mountain instructors, and cultural guides.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-xs font-bold text-charcoal-950 transition-colors shadow-lg shadow-gold-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Guide</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guide name, certification, or role..."
            className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 placeholder-charcoal-400 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between hover:border-gold-500/40 transition-all space-y-4"
          >
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/40 text-gold-400 font-extrabold text-base flex items-center justify-center shrink-0 shadow-inner">
                    {guide.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-offwhite-50">{guide.name}</h3>
                    <div className="text-xs text-gold-400 font-medium mt-0.5">{guide.role}</div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    guide.status === "On Mountain"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {guide.status}
                </span>
              </div>

              {/* Summit Track Record */}
              <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 flex items-center gap-2.5 text-xs text-offwhite-200">
                <Mountain className="w-4 h-4 text-gold-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Summit History</span>
                  <span className="font-bold text-gold-300">{guide.summitStats}</span>
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3 text-gold-400" />
                  <span>Licenses & Certifications</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {guide.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-charcoal-950 border border-charcoal-800 text-offwhite-300 px-2.5 py-1 rounded-md font-medium"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Assignment if active */}
              {guide.currentAssignment && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span className="truncate">Assigned: {guide.currentAssignment}</span>
                </div>
              )}
            </div>

            {/* Footer Contact Info */}
            <div className="pt-4 border-t border-charcoal-800 flex items-center justify-between text-xs text-charcoal-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gold-400" />
                <span>{guide.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gold-400" />
                <span className="truncate max-w-[140px]">{guide.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Guide Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddGuide}
            className="w-full max-w-lg bg-charcoal-900 border border-charcoal-700 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <h2 className="text-lg font-bold text-offwhite-50 flex items-center gap-2">
                <Users className="w-5 h-5 text-gold-400" />
                <span>Register Sherpa Guide or Staff</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-charcoal-400 hover:text-offwhite-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-charcoal-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dawa Gyalje Sherpa"
                  value={newGuideName}
                  onChange={(e) => setNewGuideName(e.target.value)}
                  className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-charcoal-400 font-semibold mb-1">Role / Position</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="Lead Expedition Leader">Lead Expedition Leader</option>
                    <option value="Senior Trekking Guide">Senior Trekking Guide</option>
                    <option value="High Altitude Sherpa">High Altitude Sherpa</option>
                    <option value="Cultural Tour Guide">Cultural Tour Guide</option>
                  </select>
                </div>
                <div>
                  <label className="block text-charcoal-400 font-semibold mb-1">Summit Record</label>
                  <input
                    type="text"
                    placeholder="e.g. 5x Everest, 2x Manaslu"
                    value={newSummits}
                    onChange={(e) => setNewSummits(e.target.value)}
                    className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-charcoal-400 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+977 98..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-charcoal-400 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="dawa@alpineace.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-charcoal-800 text-offwhite-200 hover:bg-charcoal-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gold-500 text-charcoal-950 hover:bg-gold-400 text-xs font-bold shadow"
              >
                Register Guide
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
