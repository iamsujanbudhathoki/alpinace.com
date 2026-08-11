"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Share2, Loader2 } from "lucide-react";
import { BlogPost } from "@/lib/home-data";
import { BlogService } from "@/lib/services/admin-service";
import { toast } from "sonner";

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        const fetched = await BlogService.getById(resolvedParams.slug);
        if (fetched) {
          setPost({
            id: fetched.id,
            title: fetched.title,
            slug: fetched.slug,
            category: fetched.category,
            date: fetched.publishedDate,
            readTime: fetched.readTime,
            excerpt: fetched.excerpt || "",
            content: fetched.content || "",
            image: fetched.image || "",
          });
        }
      } catch (e) {
        console.warn("Failed to fetch blog post:", e);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [resolvedParams.slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        <p className="text-xs font-semibold text-stone-600">Loading journal entry...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-24 min-h-screen bg-stone-50 pb-20 font-sans flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center max-w-md">
          <h2 className="text-lg font-bold text-stone-900 mb-2">Journal Article Not Found</h2>
          <p className="text-xs text-stone-600 mb-6">The blog post you are looking for might have been moved or removed.</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-stone-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Journals</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-stone-50 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Back Action */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-700 hover:text-amber-600 font-heading text-xs font-bold uppercase tracking-wider py-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Journals</span>
        </Link>

        {/* Article Header Card */}
        <article className="bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-200">
          {/* Main high res image */}
          {post.image && (
            <div className="relative aspect-21/9 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-6 left-6 bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-md">
                {post.category}
              </span>
            </div>
          )}

          {/* Inner Content */}
          <div className="p-8 sm:p-12 space-y-6">

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700 font-bold tracking-wide">
              {post.date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  {post.date}
                </span>
              )}
              {post.readTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-600" />
                  {post.readTime}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading text-2xl sm:text-4xl font-bold text-slate-900 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt / Intro */}
            {post.excerpt && (
              <p className="text-slate-800 text-sm sm:text-base font-medium leading-relaxed border-l-4 border-amber-500 pl-6 py-1 italic">
                &ldquo;{post.excerpt}&rdquo;
              </p>
            )}

            {/* Detailed Content (Supports HTML from TipTap Rich Text Editor) */}
            <div
              className="text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 font-normal prose max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_img]:rounded-xl [&_img]:my-4 [&_table]:border-collapse [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_th]:bg-slate-100"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Sharing row */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-10">
              <div className="text-xs text-slate-800 font-bold uppercase tracking-wider">Share this article:</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="bg-stone-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

          </div>
        </article>
      </div>
    </div>
  );
}
