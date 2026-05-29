import { BlogPostResponse } from "@/types";
import { create } from "zustand";

interface BlogPostStore {
  currentBlogPost: BlogPostResponse | undefined;
  setCurrentBlogPost: (blogPost: BlogPostResponse | undefined) => void;
}

export const currentBlogPostStore = create<BlogPostStore>((set) => ({
  currentBlogPost: undefined,
  setCurrentBlogPost: (blogPost) => set({ currentBlogPost: blogPost }),
}));
