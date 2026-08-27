"use client";

import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Award, Calendar, Edit3, User, Hash } from "lucide-react";
import { TeamMemberItem } from "@/lib/services/admin-service";

interface TeamViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMemberItem | null;
  onEdit?: (member: TeamMemberItem) => void;
}

export function TeamViewModal({
  isOpen,
  onClose,
  member,
  onEdit,
}: TeamViewModalProps) {
  if (!member) return null;

  const footer = (
    <div className="flex items-center justify-between">
      <div className="text-[11px] text-slate-500 font-medium">
        Member ID: <span className="font-mono text-slate-700 font-semibold">{member.id}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="text-xs font-semibold h-9 px-4 rounded-lg cursor-pointer"
        >
          Close
        </Button>
        {onEdit && (
          <Button
            type="button"
            onClick={() => {
              onClose();
              onEdit(member);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-9 px-4 rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Team Member Profile"
      description="Detailed overview and credentials of team leadership."
      footer={footer}
      maxWidth="lg"
      fixedHeight={false}
    >
      <div className="space-y-6">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
              <User className="w-9 h-9" />
            </div>
          )}

          <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {member.name}
              </h3>
              <AdminStatusBadge status={member.status} />
            </div>
            <p className="text-xs font-semibold text-slate-700">{member.role}</p>

            {member.experience && (
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold shadow-2xs">
                  <Award className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{member.experience}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bio & Details Grid */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">
              Bio & Profile Summary
            </h4>
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
              {member.bio || "No detailed biography provided for this team member."}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Display Order Priority</span>
              </div>
              <p className="font-mono text-sm font-bold text-slate-900">
                Position #{member.order}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Created Date</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">
                {member.createdAt
                  ? new Date(member.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminModal>
  );
}
