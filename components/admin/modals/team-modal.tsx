"use client";

import { useState, useEffect } from "react";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, X, Loader2, Save, Sparkles } from "lucide-react";
import { TeamMemberItem, TeamMemberFormValues } from "@/lib/services/admin-service";
import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload";

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  memberToEdit?: TeamMemberItem | null;
}

export function TeamModal({
  isOpen,
  onClose,
  onSuccess,
  memberToEdit,
}: TeamModalProps) {
  const [formData, setFormData] = useState<TeamMemberFormValues>({
    name: "",
    role: "",
    bio: "",
    avatar: "",
    experience: "",
    status: "active",
    order: 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        name: memberToEdit.name || "",
        role: memberToEdit.role || "",
        bio: memberToEdit.bio || "",
        avatar: memberToEdit.avatar || "",
        experience: memberToEdit.experience || "",
        status: memberToEdit.status || "active",
        order: memberToEdit.order ?? 0,
      });
    } else {
      setFormData({
        name: "",
        role: "",
        bio: "",
        avatar: "",
        experience: "",
        status: "active",
        order: 0,
      });
    }
    setError(null);
  }, [memberToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Team member name is required.");
      return;
    }
    if (!formData.role.trim()) {
      setError("Role / Position title is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { adminTeamsApi } = await import("@/lib/services/admin-service");

      if (memberToEdit) {
        await adminTeamsApi.update(memberToEdit.id, formData);
      } else {
        await adminTeamsApi.create(formData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to save team member:", err);
      setError(err?.message || "Failed to save team member. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-slate-700" />
            <span>{memberToEdit ? "Edit Team Member" : "Create New Team Member"}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Member Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Chhewang Sherpa"
              className="text-xs bg-slate-50/80 border-slate-200 text-slate-900 focus:bg-white rounded-lg h-9"
            />
          </div>

          {/* Role & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Role / Title <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Lead Expedition Leader"
                className="text-xs bg-slate-50/80 border-slate-200 text-slate-900 focus:bg-white rounded-lg h-9"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Badge / Experience Tag
              </label>
              <Input
                type="text"
                value={formData.experience || ""}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. IFMGA Guide • 12 yrs"
                className="text-xs bg-slate-50/80 border-slate-200 text-slate-900 focus:bg-white rounded-lg h-9"
              />
            </div>
          </div>

          {/* Avatar Image Selection */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Avatar Image Photo
            </label>
            <AdminImageUpload
              value={formData.avatar || ""}
              onChange={(url) => setFormData({ ...formData, avatar: url })}
              categoryFilter="Team"
            />
          </div>

          {/* Display Order & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Display Order Priority
              </label>
              <Input
                type="number"
                min={0}
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="text-xs bg-slate-50/80 border-slate-200 text-slate-900 focus:bg-white rounded-lg h-9"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Lower numbers appear first.</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Active Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                className="w-full text-xs bg-white border border-slate-200 text-slate-900 font-semibold rounded-lg px-3 py-2 focus:outline-none cursor-pointer h-9"
              >
                <option value="active">Active (Visible on Website)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Bio / Description */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Bio & Profile Summary
            </label>
            <textarea
              rows={4}
              value={formData.bio || ""}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Enter brief background, achievements, or summit credentials..."
              className="w-full p-3 text-xs bg-slate-50/80 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none resize-y"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-semibold h-9 px-4 rounded-lg cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-9 px-4 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{memberToEdit ? "Update Member" : "Create Member"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
