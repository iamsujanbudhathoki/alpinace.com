"use client";

import { useState } from "react";
import { Plus, FileText, Calendar, Eye, User } from "lucide-react";
import { mockBlogArticles, BlogArticle } from "@/lib/admin-data";
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
  const [articles, setArticles] = useState<BlogArticle[]>(mockBlogArticles);
  const [searchQuery, setSearchQuery] = useState("");

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
          onClick={() => alert("Opening Create New Article editor...")}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
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
                      Read time: {art.readTime}
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
                      <span>{art.publishedDate}</span>
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="font-bold text-slate-900">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-700" />
                      <span>{art.views.toLocaleString()}</span>
                    </div>
                  </AdminTableCell>

                  <AdminTableCell>
                    <AdminStatusBadge status={art.status} />
                  </AdminTableCell>

                  <AdminTableCell align="right">
                    <AdminTableActions>
                      <AdminActionButton
                        variant="edit"
                        onClick={() => alert(`Editing article: ${art.title}`)}
                        title="Edit Article"
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
