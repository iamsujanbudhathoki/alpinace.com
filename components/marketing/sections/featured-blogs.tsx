import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BLOG_POSTS } from "@/lib/home-data";

export function FeaturedBlogs() {
  return (
    <section className="py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-gold-600 text-xs uppercase tracking-widest font-extrabold block mb-2">
              Mountain Chronicles
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
              The Himalayan Dispatch
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-slate-900 hover:text-gold-600 font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-1 mt-4 md:mt-0 transition-colors cursor-pointer"
          >
            <span>Read All Chronicles</span>
            <ChevronRight className="h-4 w-4 text-gold-600" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOG_POSTS.slice(0, 3).map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-slate-200 transition-all duration-300 flex flex-col h-full cursor-pointer group">
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 bg-slate-950 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                    {post.category}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold font-mono tracking-widest block mb-2">
                    {post.date} &mdash; {post.readTime}
                  </span>
                  <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors mb-2 leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed font-normal line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-8 h-8 rounded-full object-cover border border-amber-300"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{post.author.name}</h4>
                      <p className="text-[10px] text-slate-500 leading-none">{post.author.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
