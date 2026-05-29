import type { BlogPostData, BlogPostResponse, PostStatus } from "@/types";
import { api } from "./api";

export const blogPostsService = {
  addBlogPost: async (data: BlogPostData) => {
    return api.post<BlogPostResponse>("/blog-posts", data);
  },
  updateBlogPost: async (id: string, data: BlogPostData) => {
    return api.patch<BlogPostResponse>(`/blog-posts/${id}`, data);
  },
  deleteBlogPost: async (id: string) => {
    return api.delete<BlogPostResponse>(`/blog-posts/${id}`);
  },
  updateStatus: async (id: string, data: { status: PostStatus }) => {
    return api.patch<BlogPostResponse>(`/blog-posts/${id}/status`, data);
  },
};
