"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Eye,
  ExternalLink,
  Tag,
  BookOpen,
  Image as ImageIcon,
  Globe,
} from "lucide-react";
import { BlogArticle } from "@/lib/admin-data";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";

interface BlogViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: BlogArticle | null;
}

export function BlogViewModal({
  isOpen,
  onClose,
  article,
}: BlogViewModalProps) {
  if (!article) return null;

  const publicUrl = `/blog/${article.slug || article.id}`;

  const footer = (
    <div className="flex items-center justify-between w-full pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="text-xs font-semibold h-9 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
      >
        Close
      </Button>

      <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
        <Button
          type="button"
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs h-9 px-4 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
        >
          <span>View on Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Article Details"
      description="View article summary, metadata, and live public destination."
      maxWidth="2xl"
      footer={footer}
    >
      <div className="space-y-6 text-xs text-slate-800">
        {/* Cover Image Banner */}
        {article.image ? (
          <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 shadow-xs">
                  <Tag className="w-3 h-3" />
                  {article.category}
                </span>
                <AdminStatusBadge status={article.status} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-xs">
                {article.title}
              </h2>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                <Tag className="w-3 h-3" />
                {article.category}
              </span>
              <AdminStatusBadge status={article.status} />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {article.title}
            </h2>
          </div>
        )}

        {/* Metadata Summary Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Category
            </span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span className="truncate">{article.category}</span>
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Published Date
            </span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{article.publishedDate || "Not Set"}</span>
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Read Time
            </span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{article.readTime}</span>
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Total Views
            </span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>{(article.views || 0).toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Excerpt Callout Block */}
        {article.excerpt && (
          <div className="space-y-1.5">
            <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
              Article Excerpt
            </span>
            <div className="bg-amber-50/50 border border-amber-200/70 p-3.5 rounded-xl text-slate-800 font-medium leading-relaxed italic">
              &ldquo;{article.excerpt}&rdquo;
            </div>
          </div>
        )}

        {/* Article Body Content Preview */}
        {article.content && (
          <div className="space-y-2">
            <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
              Content Preview
            </span>
            <div
              className="bg-slate-50 border border-slate-200 p-4 rounded-xl prose prose-sm max-w-none text-slate-800 max-h-72 overflow-y-auto leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        )}

        {/* SEO Information Block */}
        <div className="space-y-2">
          <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            SEO &amp; Search Engine Metadata
          </span>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
              <div className="text-[11px] font-bold text-emerald-800 truncate">
                https://alpineacetreks.com/blog/{article.slug || article.id}
              </div>
              <div className="text-xs font-extrabold text-blue-700 truncate">
                {article.metaTitle || `${article.title} | AlpineAce Journal`}
              </div>
              <div className="text-[11px] text-slate-700 font-medium line-clamp-2 leading-relaxed">
                {article.metaDescription ||
                  article.excerpt ||
                  "Read Himalayan preparation guides and stories on AlpineAce."}
              </div>
            </div>

            {article.keywords && (
              <div className="flex flex-wrap items-center gap-1 pt-1">
                <span className="text-[10px] font-bold text-slate-500 mr-1">
                  Keywords:
                </span>
                {article.keywords.split(",").map(
                  (kw, i) =>
                    kw.trim() && (
                      <span
                        key={i}
                        className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded"
                      >
                        {kw.trim()}
                      </span>
                    ),
                )}
              </div>
            )}
          </div>
        </div>

        {/* Public Slug URL Indicator */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Website Destination Route
            </span>
            <code className="text-slate-900 font-mono text-[11px] font-semibold">
              {publicUrl}
            </code>
          </div>
          <Link
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:text-amber-700 font-bold text-xs inline-flex items-center gap-1 hover:underline cursor-pointer shrink-0"
          >
            <span>Open Link</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </AdminModal>
  );
}
