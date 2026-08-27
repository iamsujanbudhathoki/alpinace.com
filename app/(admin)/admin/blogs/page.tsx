"use client";

import { BlogViewModal } from "@/components/admin/modals/blog-view-modal";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminInlineSelect, InlineSelectOption } from "@/components/admin/ui/admin-inline-select";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import {
  AdminActionButton,
  AdminTable,
  AdminTableActions,
  AdminTableBody,
  AdminTableCell,
  AdminTableContainer,
  AdminTableEmpty,
  AdminTableHead,
  AdminTableHeader,
  AdminTableLoading,
  AdminTablePagination,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { Button } from "@/components/ui/button";
import { BlogArticle, BlogStatus } from "@/lib/admin-data";
import { BlogService } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";
import { Calendar, Eye, Image as ImageIcon, Plus, ExternalLink, Maximize2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS: InlineSelectOption[] = [
  { value: BlogStatus.PUBLISHED, label: "Published" },
  { value: BlogStatus.DRAFT, label: "Draft" },
  { value: BlogStatus.ARCHIVED, label: "Archived" },
];

const DEFAULT_BLOG_CATEGORIES: InlineSelectOption[] = [
  { value: "Trekking Guides", label: "Trekking Guides" },
  { value: "Expedition Prep", label: "Expedition Prep" },
  { value: "Sherpa Culture", label: "Sherpa Culture" },
  { value: "Travel Tips", label: "Travel Tips" },
  { value: "Gear & Equipment", label: "Gear & Equipment" },
  { value: "Safety & Acclimatization", label: "Safety & Acclimatization" },
  { value: "General", label: "General" },
];

const getCategoryOptions = (currentCat?: string): InlineSelectOption[] => {
  if (!currentCat) return DEFAULT_BLOG_CATEGORIES;
  const exists = DEFAULT_BLOG_CATEGORIES.some(
    (opt) => opt.value.toLowerCase() === currentCat.toLowerCase()
  );
  if (exists) return DEFAULT_BLOG_CATEGORIES;
  return [{ value: currentCat, label: currentCat }, ...DEFAULT_BLOG_CATEGORIES];
};

export default function AdminBlogsPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeArticle, setActiveArticle] = useState<BlogArticle | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page to 1 on search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Load articles from backend
  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await BlogService.getAdminAll({
        search: debouncedSearch,
        page,
        limit,
      });
      setArticles(data);
      if (data.pagination) {
        setTotalItems(data.pagination.count);
        setTotalPages(data.pagination.lastPage);
      } else {
        setTotalItems(data.length);
        setTotalPages(Math.max(1, Math.ceil(data.length / limit)));
      }
    } catch (err) {
      console.error("Failed to load blog articles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [debouncedSearch, page, limit]);

  const handleViewArticle = (article: BlogArticle) => {
    setActiveArticle(article);
    setIsViewModalOpen(true);
  };

  const handleInlineStatusChange = async (art: BlogArticle, newStatus: string): Promise<boolean> => {
    try {
      const res = await BlogService.update(art.id, { status: newStatus as BlogStatus });
      if (res.success) {
        setArticles((prev) =>
          prev.map((a) => (a.id === art.id ? { ...a, status: newStatus as BlogStatus } : a))
        );
        toast.success(`Article "${art.title}" status updated`);
        return true;
      } else {
        toast.error(res.message || "Failed to update article status");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update article status");
      return false;
    }
  };

  const handleInlineCategoryChange = async (art: BlogArticle, newCategory: string): Promise<boolean> => {
    try {
      const res = await BlogService.update(art.id, { category: newCategory });
      if (res.success) {
        setArticles((prev) =>
          prev.map((a) => (a.id === art.id ? { ...a, category: newCategory } : a))
        );
        toast.success(`Article "${art.title}" category updated`);
        return true;
      } else {
        toast.error(res.message || "Failed to update article category");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update article category");
      return false;
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await BlogService.delete(id);
      if (res.success) {
        toast.success(res.message || "Article deleted successfully.");
        await loadArticles();
      } else {
        toast.error(res.message || "Failed to delete article.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete blog article");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blogs & Articles Management"
        description="Publish expedition preparation guides, packing lists, and Sherpa stories."
      >
        <Link href="/admin/blogs/new">
          <Button
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
            Write New Article
          </Button>
        </Link>
      </AdminPageHeader>

      {/* Filter Bar */}
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
              <AdminTableHead className="w-14 text-center">S.N.</AdminTableHead>
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
              <AdminTableLoading colSpan={7} rows={limit > 10 ? 10 : limit} />
            ) : articles.length > 0 ? (
              articles.map((art, idx) => {
                const serialNumber = (page - 1) * limit + idx + 1;
                return (
                  <AdminTableRow key={art.id}>
                    <AdminTableCell className="text-center font-semibold text-slate-500">
                      {serialNumber}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        {art.image ? (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              openSingleImage(art.image!, art.title, e.currentTarget);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                openSingleImage(art.image!, art.title, e.currentTarget);
                              }
                            }}
                            className="relative w-12 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 cursor-zoom-in group/thumb shadow-2xs hover:border-amber-400 transition-all"
                            title="Click to view image in lightbox"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={art.image}
                              alt={art.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                            />
                            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                              <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow-md" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/blog/${art.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link inline-flex items-center gap-1.5 font-bold text-slate-900 hover:text-amber-600 transition-colors"
                            title="Open article in public marketing page"
                          >
                            <span className="line-clamp-1 underline decoration-transparent group-hover/link:decoration-amber-500 underline-offset-2 transition-all">
                              {art.title}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-amber-600 opacity-0 group-hover/link:opacity-100 transition-all shrink-0" />
                          </Link>
                          <div className="text-xs text-slate-600 font-normal">
                            Read time: {art.readTime}
                          </div>
                        </div>
                      </div>
                    </AdminTableCell>

                    <AdminTableCell>
                      <AdminInlineSelect
                        value={art.category}
                        options={getCategoryOptions(art.category)}
                        onChange={(newVal) => handleInlineCategoryChange(art, newVal)}
                        variant="category"
                        title="Click to change article category"
                      />
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
                      <AdminInlineSelect
                        value={art.status}
                        options={STATUS_OPTIONS}
                        onChange={(newVal) => handleInlineStatusChange(art, newVal)}
                        variant="badge"
                        title="Click to change article status"
                      />
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
                );
              })
            ) : (
              <AdminTableEmpty
                colSpan={7}
                title="No articles found"
                description="No blog articles match your search criteria."
              />
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

      {/* Blog Article View Modal */}
      <BlogViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        article={activeArticle}
      />
    </div>
  );
}

