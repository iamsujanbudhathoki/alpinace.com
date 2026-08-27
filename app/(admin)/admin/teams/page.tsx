"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import {
  AdminTableContainer,
  AdminTable,
  AdminTableHeader,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
  AdminTablePagination,
  AdminTableLoading,
  AdminTableActions,
  AdminActionButton,
} from "@/components/admin/ui/admin-table";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  User,
  Award,
} from "lucide-react";
import { adminTeamsApi, TeamMemberItem } from "@/lib/services/admin-service";
import { TeamModal } from "@/components/admin/modals/team-modal";
import { TeamViewModal } from "@/components/admin/modals/team-view-modal";
import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { openSingleImage } from "@/lib/utils/lightbox";

export default function AdminTeamsPage() {
  const [members, setMembers] = useState<TeamMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberItem | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<TeamMemberItem | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<TeamMemberItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminTeamsApi.getAll({
        search: searchQuery,
        status: statusFilter !== "All" ? statusFilter : undefined,
        page,
        limit,
      });

      setMembers(res);
      setTotalItems(res.pagination?.count || res.length);
      setTotalPages(res.pagination?.lastPage || 1);
    } catch (err) {
      console.error("Failed to fetch team members:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, page, limit]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleOpenCreateModal = () => {
    setEditingMember(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (member: TeamMemberItem) => {
    setEditingMember(member);
    setModalOpen(true);
  };

  const handleOpenViewModal = (member: TeamMemberItem) => {
    setViewingMember(member);
    setViewModalOpen(true);
  };

  const handlePromptDelete = (member: TeamMemberItem) => {
    setDeletingMember(member);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMember) return;
    try {
      setIsDeleting(true);
      await adminTeamsApi.delete(deletingMember.id);
      setDeleteConfirmOpen(false);
      setDeletingMember(null);
      fetchMembers();
    } catch (err) {
      console.error("Failed to delete member:", err);
      alert("Failed to delete team member.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const newMembers = [...members];
    const temp = newMembers[index];
    newMembers[index] = newMembers[targetIndex];
    newMembers[targetIndex] = temp;

    // Re-assign order indices
    const updatedItems = newMembers.map((m, idx) => ({
      id: m.id,
      order: idx + 1,
    }));

    setMembers(
      newMembers.map((m, idx) => ({
        ...m,
        order: idx + 1,
      }))
    );

    try {
      await adminTeamsApi.reorder(updatedItems);
    } catch (err) {
      console.error("Failed to reorder team members:", err);
      fetchMembers();
    }
  };

  const handleImageClick = (e: React.MouseEvent, avatarUrl: string, name: string) => {
    e.stopPropagation();
    if (avatarUrl) {
      openSingleImage(avatarUrl, `${name} Avatar Photo`, e.currentTarget);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Team Members & Leadership"
        description="Manage Sherpa guides, expedition leaders, and executive staff displayed on the marketing website."
      >
        <Button
          onClick={handleOpenCreateModal}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </Button>
      </AdminPageHeader>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search team member name, role, or bio..."
            className="pl-9 text-xs bg-slate-50/80 border-slate-200 text-slate-900 focus:bg-white rounded-lg h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-white border border-slate-200 text-slate-900 font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400/10 cursor-pointer"
          >
            <option value="All">All Members ({totalItems})</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead>Team Member</AdminTableHead>
              <AdminTableHead>Role &amp; Position</AdminTableHead>
              <AdminTableHead>Badge / Experience</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <AdminTableLoading colSpan={5} rows={5} />
            ) : members.length > 0 ? (
              members.map((member, idx) => {
                return (
                  <AdminTableRow key={member.id}>

                    {/* Member Info */}
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            onClick={(e) => handleImageClick(e, member.avatar!, member.name)}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-85 hover:scale-105 transition-all"
                            title="Click to view image lightbox"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <button
                            type="button"
                            onClick={() => handleOpenViewModal(member)}
                            className="font-bold text-slate-900 text-xs hover:underline text-left cursor-pointer"
                          >
                            {member.name}
                          </button>
                          {member.bio && (
                            <div className="text-[11px] text-slate-500 font-normal line-clamp-1 max-w-xs">
                              {member.bio}
                            </div>
                          )}
                        </div>
                      </div>
                    </AdminTableCell>

                    {/* Role */}
                    <AdminTableCell>
                      <span className="font-semibold text-slate-900 text-xs">
                        {member.role}
                      </span>
                    </AdminTableCell>

                    {/* Badge / Experience */}
                    <AdminTableCell>
                      {member.experience ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          <Award className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{member.experience}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </AdminTableCell>

                    {/* Status */}
                    <AdminTableCell>
                      <AdminStatusBadge status={member.status} />
                    </AdminTableCell>

                    {/* Actions: View Profile, Edit, Delete */}
                    <AdminTableCell align="right">
                      <AdminTableActions>
                        <AdminActionButton
                          variant="view"
                          onClick={() => handleOpenViewModal(member)}
                          title="View Member Profile"
                        />
                        <AdminActionButton
                          variant="edit"
                          onClick={() => handleOpenEditModal(member)}
                          title="Edit Team Member"
                        />
                        <AdminActionButton
                          variant="delete"
                          onClick={() => handlePromptDelete(member)}
                          title="Delete Team Member"
                        />
                      </AdminTableActions>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            ) : (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="text-center py-12 text-slate-500 text-xs">
                  No team members found. Click &quot;Add Team Member&quot; to create one.
                </AdminTableCell>
              </AdminTableRow>
            )}
          </AdminTableBody>
        </AdminTable>
        <AdminTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={limit}
          onPageChange={setPage}
          onPageSizeChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </AdminTableContainer>

      {/* View Profile Modal */}
      {viewModalOpen && (
        <TeamViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          member={viewingMember}
          onEdit={handleOpenEditModal}
        />
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <TeamModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchMembers}
          memberToEdit={editingMember}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <AdminConfirmModal
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Team Member"
          description={`Are you sure you want to remove "${deletingMember?.name}" (${deletingMember?.role}) from the team?`}
          confirmText="Remove Member"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
