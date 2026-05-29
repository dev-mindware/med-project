import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().trim().min(1, "Campo obrigatório"),
  slug: z.string().trim().min(1, "Campo obrigatório"),
  excerpt: z.string().trim().optional(),
  content: z.string().trim().optional(),
  coverImageUrl: z.string().trim().optional(),
  videoUrl: z.string().trim().optional(),
  galleryImageUrls: z.union([z.array(z.string()), z.string()]).optional(),
  type: z.enum(["ARTICLE", "VIDEO", "IMAGE", "EVENT_COVERAGE", "ANNOUNCEMENT"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  category: z.string().trim().optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  isFeatured: z.boolean().optional(),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;

export const reviewBlogPostSchema = z.object({
  status: z.enum(
    [
      "DRAFT",
      "PUBLISHED",
      "ARCHIVED",
    ],
    {
      error: (issue) => {
        if (issue.input === undefined) {
          return "Seleccione um estado";
        }

        return "Estado inválido";
      },
    }
  ),

  reason: z.string().trim().optional(),
});

export type ReviewBlogPostFormData = z.infer<typeof reviewBlogPostSchema>;
