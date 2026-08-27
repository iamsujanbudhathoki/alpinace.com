"use client";

import { useState, useEffect } from "react";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { TeamMemberItem, TeamMemberFormValues } from "@/lib/services/admin-service";
import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload";
import { AdminInputField, AdminSelectField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { toast } from "sonner";

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
      setError("Role title is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { adminTeamsApi } = await import("@/lib/services/admin-service");

      if (memberToEdit) {
        await adminTeamsApi.update(memberToEdit.id, formData);
        toast.success(`Updated "${formData.name}" successfully`);
      } else {
        await adminTeamsApi.create(formData);
        toast.success(`Added "${formData.name}" to team`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to save team member:", err);
      const msg = err?.message || "Failed to save team member. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-2.5">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={saving}
        className="text-xs font-semibold h-9 px-4 rounded-lg cursor-pointer"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="team-member-form"
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
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? "Edit Team Member" : "Create New Team Member"}
      description="Manage Sherpa guide credentials, role titles, and avatar photos."
      footer={footer}
      maxWidth="lg"
      fixedHeight={false}
    >
      {error && (
        <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <form id="team-member-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Member Name */}
        <AdminInputField
          label="Full Name"
          required
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Chhewang Sherpa"
        />

        {/* Role & Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminInputField
            label="Role / Title"
            required
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g. Lead Expedition Leader"
          />

          <AdminInputField
            label="Badge / Experience Tag"
            type="text"
            value={formData.experience || ""}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            placeholder="e.g. IFMGA Guide • 12 yrs"
          />
        </div>

        {/* Avatar Image Selection */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Avatar Photo
          </label>
          <AdminImageUpload
            value={formData.avatar || ""}
            onChange={(url) => setFormData({ ...formData, avatar: url })}
          />
        </div>

        {/* Display Order & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminInputField
            label="Display Order Priority"
            type="number"
            min={0}
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />

          <AdminSelectField
            label="Active Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
            options={[
              { label: "Active (Visible on Website)", value: "active" },
              { label: "Inactive (Hidden)", value: "inactive" },
            ]}
          />
        </div>

        {/* Bio / Description */}
        <AdminTextareaField
          label="Bio & Profile Summary"
          rows={4}
          value={formData.bio || ""}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Enter brief background, achievements, or summit credentials..."
        />
      </form>
    </AdminModal>
  );
}
