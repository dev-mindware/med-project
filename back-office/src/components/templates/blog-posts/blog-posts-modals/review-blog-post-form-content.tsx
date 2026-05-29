"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  SelectField
} from "@/components";
import { reviewBlogPostSchema, ReviewBlogPostFormData } from "@/schemas/blog-posts";
import { BlogPostResponse } from "@/types";
import { blogPostsService } from "@/services/blog-posts-service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/stores";

interface ReviewBlogPostFormContentProps {
  blogPost: BlogPostResponse;
}

const postStatusOptions = [
  { label: "Publicado", value: "PUBLISHED" },
  { label: "Rascunho", value: "DRAFT" },
  { label: "Arquivado", value: "ARCHIVED" },
];

export function ReviewBlogPostFormContent({ blogPost }: ReviewBlogPostFormContentProps) {
  const { closeModal } = useModal();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewBlogPostFormData>({
    resolver: zodResolver(reviewBlogPostSchema),
    defaultValues: {
      status: (blogPost.status as any) || "DRAFT",
    },
  });

  const onSubmit = async (data: ReviewBlogPostFormData) => {
    try {
      await blogPostsService.updateStatus(blogPost.id, data as any);
      toast.success("Estado actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      closeModal("REVIEW_MODAL");
    } catch (error) {
      toast.error("Erro ao actualizar estado");
      console.error(error);
    }
  };

  return (
    <form id="review-blog-post-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
      <Controller
        control={control}
        name="status"
        render={({ field: { value, onChange } }) => (
          <SelectField
            label="Estado da publicação"
            value={value}
            options={postStatusOptions}
            onValueChange={onChange}
            error={errors.status?.message}
            placeholder="Seleccione o novo estado"
          />
        )}
      />
    </form>
  );
}
