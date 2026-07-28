"use client";

import { useState } from "react";
import { Plus, FileText, Calendar, Eye, User } from "lucide-react";
import { mockBlogArticles, BlogArticle } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="font-bold text-slate-700 text-xs">Article Title</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Category</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Author</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Published Date</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Views</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Status</TableHead>
              <TableHead className="text-right font-bold text-slate-700 text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs">
            {filteredArticles.map((art) => (
              <TableRow key={art.id} className="hover:bg-slate-50/80 transition-colors">
                <TableCell className="py-3.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{art.title}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    Read time: {art.readTime}
                  </div>
                </TableCell>

                <TableCell className="py-3.5 font-semibold text-slate-800">
                  {art.category}
                </TableCell>

                <TableCell className="py-3.5 text-slate-700 font-medium">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{art.author}</span>
                  </div>
                </TableCell>

                <TableCell className="py-3.5 text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{art.publishedDate}</span>
                  </div>
                </TableCell>

                <TableCell className="py-3.5 font-bold text-slate-900">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>{art.views.toLocaleString()}</span>
                  </div>
                </TableCell>

                <TableCell className="py-3.5">
                  <AdminStatusBadge status={art.status} />
                </TableCell>

                <TableCell className="py-3.5 text-right">
                  <Button variant="outline" size="sm" className="text-xs font-semibold h-8">
                    Edit Article
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
