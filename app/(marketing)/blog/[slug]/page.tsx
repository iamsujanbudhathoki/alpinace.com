"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Check, 
  Mountain, 
  ChevronRight, 
  BookOpen, 
  Loader2,
  ShieldCheck,
  Maximize2
} from "lucide-react";
import { BlogPost } from "@/lib/home-data";
import { BlogService } from "@/lib/services/admin-service";
import { BlogStatus } from "@/lib/admin-data";
import { BlogDetailSkeleton } from "@/components/marketing/skeletons/blog-detail-skeleton";
import { openSingleImage } from "@/lib/utils/lightbox";
import { toast } from "sonner";

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPostData() {
      setLoading(true);
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

        // Fetch other published blogs for recommended reading
        const allPublished = await BlogService.getAll(BlogStatus.PUBLISHED);
        const filtered = allPublished
          .filter((p) => p.slug !== resolvedParams.slug && p.id !== resolvedParams.slug)
          .slice(0, 3)
          .map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            category: p.category,
            date: p.publishedDate,
            readTime: p.readTime,
            excerpt: p.excerpt || "",
            content: p.content || "",
            image: p.image || "",
          }));
        setRelatedPosts(filtered);
      } catch (e) {
        console.warn("Failed to fetch blog post:", e);
      } finally {
        setLoading(false);
      }
    }

    loadPostData();
  }, [resolvedParams.slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Blog link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return <BlogDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="pt-32 min-h-screen bg-stone-50/60 pb-20 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-10 rounded-3xl border border-stone-200 shadow-sm text-center max-w-md w-full">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900 mb-2">
            Blog Article Not Found
          </h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            The blog article you requested could not be located. It may have been renamed or archived.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Blogs</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-stone-50/60 pb-24 font-sans text-slate-900">
      
      {/* Editorial Navigation Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <nav className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium overflow-hidden truncate">
            <Link 
              href="/" 
              className="hover:text-slate-900 transition-colors shrink-0"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link 
              href="/blog" 
              className="hover:text-slate-900 transition-colors shrink-0"
            >
              Blogs
            </Link>
            {post.category && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-slate-700 font-semibold truncate hidden sm:inline">
                  {post.category}
                </span>
              </>
            )}
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Blogs</span>
          </Link>
        </nav>
      </div>

      {/* Main Article Container */}
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Article Header */}
        <header className="pt-4 pb-8 space-y-5">
          
          {/* Category & Badge */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
              <Mountain className="w-3 h-3 text-amber-600" />
              {post.category || "Blog"}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.18]">
            {post.title}
          </h1>

          {/* Author & Publishing Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200/80 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-heading font-black text-sm flex items-center justify-center shadow-xs">
                AA
              </div>
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Alpine Ace Editorial Team</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500 inline" />
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Kathmandu Expeditions Desk
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-500 font-medium">
              {post.date && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{post.date}</span>
                </span>
              )}
              {post.readTime && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{post.readTime}</span>
                </span>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy article link"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-slate-700 hover:text-amber-600 hover:border-amber-300 transition-colors cursor-pointer text-xs font-semibold shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Share"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Featured Hero Banner */}
        {post.image && (
          <div 
            onClick={(e) => openSingleImage(post.image!, post.title, e.currentTarget, post.excerpt || post.title)}
            className="relative aspect-16/9 sm:aspect-21/9 w-full rounded-3xl overflow-hidden bg-slate-900 border border-stone-200/80 shadow-md mb-10 group cursor-pointer"
            title="Click to view full screen"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="inline-flex items-center gap-2 bg-white/95 text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                <span>View Fullscreen</span>
              </span>
            </div>
          </div>
        )}

        {/* Editorial Body Content Area */}
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-stone-200/80 shadow-xs space-y-8">
          
          {/* Excerpt / Lead Paragraph */}
          {post.excerpt && (
            <div className="relative pl-6 border-l-4 border-amber-500 py-1.5">
              <p className="text-base sm:text-xl font-normal text-slate-800 leading-relaxed italic">
                &ldquo;{post.excerpt}&rdquo;
              </p>
            </div>
          )}

          {/* Rendered HTML Rich-Text Body */}
          <div
            className="prose prose-slate max-w-none 
              text-slate-800 text-sm sm:text-base leading-[1.8] font-normal
              [&_h1]:font-heading [&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:font-extrabold [&_h1]:text-slate-950 [&_h1]:mt-10 [&_h1]:mb-4
              [&_h2]:font-heading [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:text-slate-950 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-stone-100
              [&_h3]:font-heading [&_h3]:text-lg [&_h3]:sm:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-8 [&_h3]:mb-3
              [&_p]:mb-5 [&_p]:leading-relaxed
              [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:bg-amber-50/40 [&_blockquote]:p-4 [&_blockquote]:rounded-r-2xl [&_blockquote]:my-6 [&_blockquote]:text-slate-800
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-5 [&_ul]:space-y-2 [&_ul]:marker:text-amber-500
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-5 [&_ol]:space-y-2 [&_ol]:marker:text-amber-600
              [&_li]:text-slate-800 [&_li]:leading-relaxed
              [&_img]:rounded-2xl [&_img]:my-8 [&_img]:border [&_img]:border-stone-200 [&_img]:shadow-xs [&_img]:w-full [&_img]:object-cover
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:border [&_table]:border-stone-200
              [&_th]:bg-stone-100 [&_th]:border-b [&_th]:border-stone-200 [&_th]:p-3 [&_th]:text-xs [&_th]:font-bold [&_th]:text-slate-900 [&_th]:text-left
              [&_td]:p-3 [&_td]:border-b [&_td]:border-stone-100 [&_td]:text-xs [&_td]:text-slate-700
              [&_a]:text-amber-600 [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-amber-300 [&_a]:hover:decoration-amber-600 [&_a]:font-semibold [&_a]:transition-colors"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />

          {/* Social Share & Tag Footer */}
          <div className="pt-8 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Category:
              </span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-slate-800">
                {post.category || "Expeditions"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">Share:</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied" : "Copy Link"}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Recommended Blogs */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                Recommended Blogs
              </h3>
              <Link
                href="/blog"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug || related.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                    {related.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Mountain className="w-8 h-8" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                      {related.category}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <h4 className="font-heading text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                      {related.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-stone-100">
                      <span>{related.date || "Blog"}</span>
                      <span>{related.readTime || "5 min read"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </article>
    </div>
  );
}
