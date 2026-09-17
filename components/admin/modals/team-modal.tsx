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
    setError(null);
    setSaving(false);
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
  }, [memberToEdit, isOpen]);

  const handleClose = () => {
    setError(null);
    setSaving(false);
    onClose();
  };

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

      const res = memberToEdit
        ? await adminTeamsApi.update(memberToEdit.id, formData)
        : await adminTeamsApi.create(formData);

      if (res.success) {
        toast.success(res.message || (memberToEdit ? `Updated "${formData.name}" successfully` : `Added "${formData.name}" to team`));
        onSuccess();
        onClose();
      } else {
        const msg = res.message || "Failed to save team member. Please try again.";
        setError(msg);
        toast.error(msg);
      }
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
        onClick={handleClose}
        disabled={saving}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="team-member-form"
        disabled={saving}
        className="flex items-center gap-1.5"
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
      onClose={handleClose}
      title={memberToEdit ? "Edit Team Member" : "Create New Team Member"}
      description="Manage mountain guide credentials, role titles, and avatar photos."
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
          placeholder="e.g. Chhewang Tamang"
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
            placeholder="e.g. Lead Guide • 12 yrs"
          />
        </div>

        {/* Avatar Image Selection */}
        <AdminImageUpload
          label="Avatar Photo"
          value={formData.avatar || ""}
          onChange={(url, mediaId) => setFormData({ ...formData, avatar: url, avatarMediaId: mediaId })}
        />

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
            onChange={(val) => setFormData({ ...formData, status: val as "active" | "inactive" })}
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
