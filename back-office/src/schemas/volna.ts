import { z } from "zod";

export const volnaSchema = z.object({
  term: z.string().trim().min(1, "O vocábulo é obrigatório"),
  language: z.string().trim().min(1, "A língua nacional é obrigatória"),
  grammaticalCategory: z.string().trim().optional(),
  grammaticalSubcategory: z.string().trim().optional(),
  definition: z.string().trim().min(1, "A definição é obrigatória"),
  usageExample: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type VolnaFormData = z.infer<typeof volnaSchema>;

export const reviewVolnaSchema = z.object({
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "NEEDS_CORRECTION", "ARCHIVED"]),
  reason: z.string().trim().optional(),
});

export type ReviewVolnaFormData = z.infer<typeof reviewVolnaSchema>;
