"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { BlogArticleForm } from "@/components/admin/forms/blog-form";
import { BlogService } from "@/lib/services/admin-service";
import { BlogFormValues } from "@/lib/admin-schemas";
import { BlogArticle } from "@/lib/admin-data";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      try {
        const data = await BlogService.getById(resolvedParams.id);
        if (data) {
          setArticle(data);
        } else {
          toast.error("Article not found.");
          router.push("/admin/blogs");
        }
      } catch (err) {
        console.error("Failed to fetch article:", err);
        toast.error("Failed to load article details.");
      } finally {
        setLoading(false);
      }
    }
    if (resolvedParams.id) {
      loadArticle();
    }
  }, [resolvedParams.id, router]);

  const handleUpdate = async (values: BlogFormValues) => {
    if (!resolvedParams.id) return;
    setIsSubmitting(true);
    try {
      const res = await BlogService.update(resolvedParams.id, values);
      if (res.success) {
        toast.success(res.message || "Blog article updated successfully!");
        router.push("/admin/blogs");
      } else {
        toast.error(res.message || "Failed to update blog article.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update blog article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Loading blog article content...</p>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="space-y-6">
      <BlogArticleForm
        initialData={article}
        isEdit={true}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
