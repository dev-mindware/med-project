import { BaseEntity, PostType, PostStatus } from "./common";

export type BlogPostData = {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  videoUrl?: string;
  galleryImageUrls?: string[];
  type: PostType;
  status?: PostStatus;
  category?: string;
  tags?: string[];
  isFeatured?: boolean;
};
export type BlogPostResponse = BlogPostData & BaseEntity & {
  publishedAt?: string;
  authorId?: string;
};
