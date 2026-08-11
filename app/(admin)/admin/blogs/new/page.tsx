"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BlogArticleForm } from "@/components/admin/forms/blog-form";
import { BlogService } from "@/lib/services/admin-service";
import { BlogFormValues } from "@/lib/admin-schemas";

export default function NewBlogPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (values: BlogFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await BlogService.create(values);
      if (res.success) {
        toast.success(res.message || "Blog article created successfully!");
        router.push("/admin/blogs");
      } else {
        toast.error(res.message || "Failed to create blog article.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create blog article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <BlogArticleForm
        isEdit={false}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
