"use client";

import { useEffect, useState } from "react";
import { Plus, FileText, Calendar, Eye, User } from "lucide-react";
import { BlogArticle } from "@/lib/admin-data";
import { toast } from "sonner";
import { BlogService } from "@/lib/services/admin-service";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import {
  AdminTableContainer,
  AdminTable,
  AdminTableHeader,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableActions,
  AdminActionButton,
} from "@/components/admin/ui/admin-table";

export default function AdminBlogsPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        const data = await BlogService.getAll();
        setArticles(data);
      } catch (err) {
        console.error("Failed to load blog articles:", err);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  const handleCreateArticle = async () => {
    const title = prompt("Enter new article title:");
    if (!title) return;
    try {
      const res = await BlogService.create({
        title,
        category: "Expedition Prep",
        author: "Admin Team",
        status: "Published",
        readTime: "5 min read",
        excerpt: "New article excerpt...",
      });
      setArticles((prev) => [res.data, ...prev]);
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.message || "Failed to create blog article");
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Delete article: ${title}?`)) return;
    try {
      const res = await BlogService.delete(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete blog article");
    }
  };

  const filteredArticles = articles.filter(
    (art) =>
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blogs & Articles Management"
        description="Publish expedition preparation guides, packing lists, and Sherpa stories."
      >
        <Button
          size="sm"
          onClick={handleCreateArticle}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
          Create New Article
        </Button>
      </AdminPageHeader>

      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search article title, author, or category..."
      />

      {/* Blogs Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead>Article Title</AdminTableHead>
              <AdminTableHead>Category</AdminTableHead>
              <AdminTableHead>Author</AdminTableHead>
              <AdminTableHead>Published Date</AdminTableHead>
              <AdminTableHead>Views</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {filteredArticles.length > 0 ? (
              filteredArticles.map((art) => (
                <AdminTableRow key={art.id}>
                  <AdminTableCell>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{art.title}</span>
                    </div>
                    <div className="text-xs text-slate-700 mt-0.5 font-semibold">
                      Read time: {art.readTime || "5 min read"}
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="font-semibold text-slate-800">
                    {art.category}
                  </AdminTableCell>

                  <AdminTableCell className="font-semibold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-700" />
                      <span>{art.author}</span>
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="font-semibold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-700" />
                      <span>{art.publishedDate || "2026-08-01"}</span>
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="font-bold text-slate-900">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-700" />
                      <span>{(art.views || 0).toLocaleString()}</span>
                    </div>
                  </AdminTableCell>

                  <AdminTableCell>
                    <AdminStatusBadge status={art.status} />
                  </AdminTableCell>

                  <AdminTableCell align="right">
                    <AdminTableActions>
                      <AdminActionButton
                        variant="delete"
                        onClick={() => handleDeleteArticle(art.id, art.title)}
                        title="Delete Article"
                      />
                    </AdminTableActions>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            ) : (
              <AdminTableEmpty
                colSpan={7}
                title="No articles found"
                description="No blog articles match your search criteria."
              />
            )}
          </AdminTableBody>
        </AdminTable>
      </AdminTableContainer>
    </div>
  );
}
