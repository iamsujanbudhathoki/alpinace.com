"use client";

import { useEffect, useState } from "react";
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
  ShieldCheck,
  Maximize2,
} from "lucide-react";
import { BlogPost } from "@/lib/home-data";
import { BlogService } from "@/lib/services/admin-service";
import { BlogStatus } from "@/lib/admin-data";
import { BlogDetailSkeleton } from "@/components/marketing/skeletons/blog-detail-skeleton";
import { openSingleImage } from "@/lib/utils/lightbox";
import { toast } from "sonner";

interface BlogDetailClientProps {
  initialPost: BlogPost | null;
  slug: string;
}

export function BlogDetailClient({ initialPost, slug }: BlogDetailClientProps) {
  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(!initialPost);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPostData() {
      try {
        if (!initialPost) {
          const fetched = await BlogService.getById(slug);
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
        }

        // Fetch other published blogs for recommended reading
        const allPublished = await BlogService.getAll(BlogStatus.PUBLISHED);
        if (Array.isArray(allPublished)) {
          const filtered = allPublished
            .filter((p) => p.slug !== slug && p.id !== slug)
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
        }
      } catch (e) {
        console.warn("Failed to fetch blog post:", e);
      } finally {
        setLoading(false);
      }
    }

    loadPostData();
  }, [slug, initialPost]);

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
      <div className="pt-32 min-h-screen bg-stone-50 pb-20 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-sm border border-stone-200 text-center max-w-md w-full">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-stone-700" />
          </div>
          <h2 className="text-xl font-bold font-heading text-stone-900 mb-2">
            Blog Article Not Found
          </h2>
          <p className="text-xs text-stone-600 mb-6 leading-relaxed">
            The blog article you requested could not be located. It may have been renamed or archived.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 w-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-5 py-3 rounded-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Blogs</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-stone-50 pb-24 font-sans text-stone-900">
      {/* Editorial Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <nav className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-stone-500 font-medium overflow-hidden truncate">
            <Link
              href="/"
              className="hover:text-stone-900 transition-colors shrink-0"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
            <Link
              href="/blog"
              className="hover:text-stone-900 transition-colors shrink-0"
            >
              Blogs
            </Link>
            {post.category && (
              <>
                <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="text-stone-900 font-semibold truncate hidden sm:inline">
                  {post.category}
                </span>
              </>
            )}
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-950 transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Blogs</span>
          </Link>
        </nav>
      </div>

      {/* Main Article Container - Expanded Width, No Card Wrapper */}
      <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Article Header */}
        <header className="pt-4 pb-8 space-y-5">
          {/* Category Badge */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider bg-stone-100 text-stone-900 border border-stone-200">
              <Mountain className="w-3 h-3 text-stone-700" />
              {post.category || "Blog"}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold text-stone-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Author & Publishing Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-900 text-white font-heading font-bold text-sm flex items-center justify-center">
                AA
              </div>
              <div>
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>AlpineAce Editorial Team</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-600 inline" />
                </div>
                <div className="text-xs text-stone-500 font-medium">
                  Kathmandu Expeditions Desk
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-stone-500 font-medium">
              {post.date && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>{post.date}</span>
                </span>
              )}
              {post.readTime && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{post.readTime}</span>
                </span>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy article link"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm bg-white border border-stone-200 text-stone-800 hover:text-stone-950 hover:border-stone-400 transition-colors cursor-pointer text-xs font-semibold"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>{copied ? "Copied" : "Share"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Featured Hero Banner */}
        {post.image && (
          <div
            onClick={(e) =>
              openSingleImage(
                post.image!,
                post.title,
                e.currentTarget,
                post.excerpt || post.title,
              )
            }
            className="relative aspect-16/9 sm:aspect-21/9 w-full rounded-sm overflow-hidden bg-stone-900 border border-stone-200 mb-10 group cursor-pointer"
            title="Click to view full screen"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
            />
            <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="inline-flex items-center gap-2 bg-white/95 text-stone-900 px-4 py-2 rounded-sm text-xs font-bold shadow-lg backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <Maximize2 className="w-3.5 h-3.5 text-stone-700" />
                <span>View Fullscreen</span>
              </span>
            </div>
          </div>
        )}

        {/* Unboxed Main Article Body Content Area - Flows Directly in Page */}
        <div className="space-y-8 py-2">
          {/* Excerpt / Lead Paragraph */}
          {post.excerpt && (
            <div className="relative pl-6 border-l-4 border-stone-900 py-1.5 mb-8">
              <p className="text-lg sm:text-2xl font-normal text-stone-800 leading-relaxed italic">
                &ldquo;{post.excerpt}&rdquo;
              </p>
            </div>
          )}

          {/* Rendered HTML Rich-Text Body */}
          <div
            className="prose prose-slate max-w-none 
              text-stone-800 text-base sm:text-lg leading-[1.85] font-normal
              [&_h1]:font-heading [&_h1]:text-3xl [&_h1]:sm:text-4xl [&_h1]:font-bold [&_h1]:text-stone-950 [&_h1]:mt-12 [&_h1]:mb-5
              [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:text-stone-950 [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:pb-2.5 [&_h2]:border-b [&_h2]:border-stone-200
              [&_h3]:font-heading [&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:font-bold [&_h3]:text-stone-900 [&_h3]:mt-10 [&_h3]:mb-4
              [&_p]:mb-6 [&_p]:leading-relaxed
              [&_blockquote]:border-l-4 [&_blockquote]:border-stone-900 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:bg-stone-100/70 [&_blockquote]:p-5 [&_blockquote]:rounded-r-sm [&_blockquote]:my-8 [&_blockquote]:text-stone-800
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-6 [&_ul]:space-y-2.5 [&_ul]:marker:text-stone-700
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-6 [&_ol]:space-y-2.5 [&_ol]:marker:text-stone-900
              [&_li]:text-stone-800 [&_li]:leading-relaxed
              [&_img]:rounded-sm [&_img]:my-10 [&_img]:border [&_img]:border-stone-200 [&_img]:w-full [&_img]:object-cover
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-8 [&_table]:rounded-sm [&_table]:overflow-hidden [&_table]:border [&_table]:border-stone-200
              [&_th]:bg-stone-100 [&_th]:border-b [&_th]:border-stone-200 [&_th]:p-3.5 [&_th]:text-sm [&_th]:font-bold [&_th]:text-stone-900 [&_th]:text-left
              [&_td]:p-3.5 [&_td]:border-b [&_td]:border-stone-100 [&_td]:text-sm [&_td]:text-stone-700
              [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-stone-400 [&_a]:hover:decoration-stone-900 [&_a]:font-semibold [&_a]:transition-colors"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />

          {/* Social Share & Tag Footer */}
          <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Category:
              </span>
              <span className="inline-block px-3 py-1 rounded-sm text-xs font-bold bg-stone-100 text-stone-900 border border-stone-200">
                {post.category || "Expeditions"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-500">Share:</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white border border-stone-200 hover:border-stone-400 text-stone-800 hover:text-stone-950 text-xs font-bold transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>{copied ? "Link Copied" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Blogs */}
        {relatedPosts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-stone-200 space-y-6">
            <div className="flex items-center justify-between pb-3">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-stone-700" />
                Recommended Articles
              </h3>
              <Link
                href="/blog"
                className="text-xs font-bold text-stone-700 hover:text-stone-950 inline-flex items-center gap-1 hover:underline cursor-pointer"
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
                  className="group bg-white rounded-sm overflow-hidden border border-stone-200 hover:border-stone-400 transition-all flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
                    {related.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-600">
                        <Mountain className="w-8 h-8" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-sm">
                      {related.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <h4 className="font-heading text-sm sm:text-base font-bold text-stone-900 group-hover:text-stone-600 transition-colors line-clamp-2 leading-snug">
                      {related.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100 font-medium">
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
