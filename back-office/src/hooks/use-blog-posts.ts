import { BlogPostData, BlogPostResponse } from "@/types";
import { blogPostsService } from "@/services/blog-posts-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SucessMessage } from "@/utils/messages";

export function useAddBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BlogPostData) => blogPostsService.addBlogPost(data),
    onSuccess: () => {
      SucessMessage("Registro adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogPostData> }) =>
      blogPostsService.updateBlogPost(id, data as any),
    onSuccess: () => {
      SucessMessage("Registo actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

export function useUpdateStatusBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; rejectionReason?: string } }) => 
      blogPostsService.updateStatus(id, data as any),
    onSuccess: () => {
      SucessMessage("Estado actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogPostsService.deleteBlogPost(id),
    onSuccess: () => {
      SucessMessage("Registo eliminado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}
