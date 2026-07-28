"use client";

import { useState } from "react";
import {
  Users,
  Award,
  Phone,
  Mail,
  Plus,
  MapPin,
  Mountain,
} from "lucide-react";
import { mockGuides, Guide } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
      {/* Page Header */}
      <AdminPageHeader
        title="Sherpa Guides & Expedition Crew"
        description="Certified IFMGA and NMA high-altitude Sherpa leaders, mountain instructors, and cultural guides."
      >
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
          Add New Guide
        </Button>
      </AdminPageHeader>

      {/* Filter Bar */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search guide name, certification, or role..."
      />

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGuides.map((guide) => (
          <Card
            key={guide.id}
            className="p-6 bg-white border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
          >
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs">
                    {guide.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{guide.name}</h3>
                    <div className="text-xs text-amber-700 font-semibold mt-0.5">{guide.role}</div>
                  </div>
                </div>

                <AdminStatusBadge status={guide.status} />
              </div>

              {/* Summit Track Record */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-800">
                <Mountain className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Summit History</span>
                  <span className="font-bold text-slate-900">{guide.summitStats}</span>
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-600" />
                  <span>Licenses & Certifications</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {guide.certifications.map((cert, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-[10px] bg-slate-50 text-slate-700 border-slate-200 font-medium"
                    >
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Current Assignment if active */}
              {guide.currentAssignment && (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 font-medium">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span className="truncate">Assigned: {guide.currentAssignment}</span>
                </div>
              )}
            </div>

            {/* Footer Contact Info */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <span>{guide.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate max-w-[140px]">{guide.email}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Guide Dialog */}
      {showAddModal && (
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-lg bg-white border-slate-200 p-6 space-y-4">
            <form onSubmit={handleAddGuide} className="space-y-4">
              <DialogHeader className="border-b border-slate-100 pb-3">
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  <span>Register Sherpa Guide or Staff</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Add high-altitude mountaineer certifications and contact credentials.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Dawa Gyalje Sherpa"
                    value={newGuideName}
                    onChange={(e) => setNewGuideName(e.target.value)}
                    className="text-xs bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Role / Position</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-md px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="Lead Expedition Leader">Lead Expedition Leader</option>
                      <option value="Senior Trekking Guide">Senior Trekking Guide</option>
                      <option value="High Altitude Sherpa">High Altitude Sherpa</option>
                      <option value="Cultural Tour Guide">Cultural Tour Guide</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Summit Record</label>
                    <Input
                      type="text"
                      placeholder="e.g. 5x Everest, 2x Manaslu"
                      value={newSummits}
                      onChange={(e) => setNewSummits(e.target.value)}
                      className="text-xs bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                    <Input
                      type="text"
                      placeholder="+977 98..."
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="text-xs bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                    <Input
                      type="email"
                      placeholder="dawa@alpineace.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="text-xs bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                  Register Guide
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
