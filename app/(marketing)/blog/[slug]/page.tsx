"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { BLOG_POSTS } from "@/lib/home-data";

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const resolvedParams = use(params);
  const post = BLOG_POSTS.find((p) => p.slug === resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="pt-24 min-h-screen bg-stone-50 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Back Action */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-700 hover:text-gold-600 font-heading text-xs font-bold uppercase tracking-wider py-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Journals</span>
        </Link>

        {/* Article Header Card */}
        <article className="bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-200">
          {/* Main high res image */}
          <div className="relative aspect-21/9 w-full overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-6 left-6 bg-gold-500 text-slate-950 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-md">
              {post.category}
            </span>
          </div>

          {/* Inner Content */}
          <div className="p-8 sm:p-12 space-y-6">

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-mono font-medium tracking-wide">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gold-600" />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gold-600" />
                {post.readTime}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-2xl sm:text-4xl font-bold text-slate-900 leading-tight">
              {post.title}
            </h1>

            {/* Author Card Block */}
            <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-slate-200 w-fit">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border-2 border-gold-300"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{post.author.name}</h3>
                <p className="text-[11px] text-slate-500 leading-none font-mono uppercase">{post.author.role}</p>
              </div>
            </div>

            {/* Excerpt / Intro */}
            <p className="text-slate-800 text-sm sm:text-base font-medium leading-relaxed border-l-4 border-gold-500 pl-6 py-1 italic">
              &ldquo;{post.excerpt}&rdquo;
            </p>

            {/* Detailed Content */}
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-6 font-light">
              <p>{post.content}</p>
            </div>

            {/* Sharing row */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-10">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Share this article:</div>
              <div className="flex gap-2">
                <button className="bg-stone-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1">
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
