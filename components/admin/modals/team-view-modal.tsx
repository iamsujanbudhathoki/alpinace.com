"use client";

import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Award, Edit3, User } from "lucide-react";
import { TeamMemberItem } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";

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
    <div className="flex items-center justify-end gap-2.5">
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
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Team Member Profile"
      footer={footer}
      maxWidth="md"
      fixedHeight={false}
    >
      <div className="space-y-5">
        {/* Profile Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              onClick={(e) => openSingleImage(member.avatar!, member.name, e.currentTarget)}
              className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity shadow-xs"
              title="Click to view image lightbox"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-xs">
              <User className="w-8 h-8" />
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 leading-snug truncate">
                {member.name}
              </h3>
              <AdminStatusBadge status={member.status} />
            </div>

            <p className="text-xs font-semibold text-slate-600 truncate">{member.role}</p>

            {member.experience && (
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/80">
                  <Award className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{member.experience}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Biography & Background */}
        {member.bio ? (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Biography &amp; Background
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line bg-slate-50/70 border border-slate-200/60 rounded-xl p-3.5">
              {member.bio}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No biography provided for this team member.</p>
        )}
      </div>
    </AdminModal>
  );
}
