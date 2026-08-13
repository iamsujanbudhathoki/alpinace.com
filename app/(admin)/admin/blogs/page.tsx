"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, Eye, Image as ImageIcon } from "lucide-react";
import { BlogArticle } from "@/lib/admin-data";
import { toast } from "sonner";
import { BlogService } from "@/lib/services/admin-service";
import { BlogViewModal } from "@/components/admin/modals/blog-view-modal";
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
  AdminTableLoading,
  AdminTableActions,
  AdminActionButton,
} from "@/components/admin/ui/admin-table";

export default function AdminBlogsPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeArticle, setActiveArticle] = useState<BlogArticle | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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

  const handleViewArticle = (article: BlogArticle) => {
    setActiveArticle(article);
    setIsViewModalOpen(true);
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await BlogService.delete(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      if (res.success) {
        toast.success(res.message || "Article deleted successfully.");
      } else {
        toast.error(res.message || "Failed to delete article.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete blog article");
    }
  };

  const filteredArticles = articles.filter(
    (art) =>
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blogs & Articles Management"
        description="Publish expedition preparation guides, packing lists, and Sherpa stories."
      >
        <Link href="/admin/blogs/new">
          <Button
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
            Create New Article
          </Button>
        </Link>
      </AdminPageHeader>

      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search article title or category..."
      />

      {/* Blogs Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead>Article Title</AdminTableHead>
              <AdminTableHead>Category</AdminTableHead>
              <AdminTableHead>Published Date</AdminTableHead>
              <AdminTableHead>Views</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <AdminTableLoading colSpan={6} rows={5} />
            ) : filteredArticles.length > 0 ? (
              filteredArticles.map((art) => (
                <AdminTableRow key={art.id}>
                  <AdminTableCell>
                    <div className="flex items-center gap-3">
                      {art.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={art.image}
                          alt={art.title}
                          className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">
                          {art.title}
                        </div>
                        <div className="text-xs text-slate-600 font-normal">
                          Read time: {art.readTime}
                        </div>
                      </div>
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="font-medium text-slate-800">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {art.category}
                    </span>
                  </AdminTableCell>

                  <AdminTableCell className="font-medium text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                      <span>{art.publishedDate}</span>
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="font-medium text-slate-800">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>{(art.views || 0).toLocaleString()}</span>
                    </div>
                  </AdminTableCell>

                  <AdminTableCell>
                    <AdminStatusBadge status={art.status} />
                  </AdminTableCell>

                  <AdminTableCell align="right">
                    <AdminTableActions>
                      <AdminActionButton
                        variant="view"
                        onClick={() => handleViewArticle(art)}
                        title="View Article Details"
                      />
                      <Link href={`/admin/blogs/${art.id}/edit`}>
                        <AdminActionButton
                          variant="edit"
                          title="Edit Article"
                        />
                      </Link>
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
                colSpan={6}
                title="No articles found"
                description="No blog articles match your search criteria."
              />
            )}
          </AdminTableBody>
        </AdminTable>
      </AdminTableContainer>

      {/* Blog Article View Modal */}
      <BlogViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        article={activeArticle}
      />
    </div>
  );
}
