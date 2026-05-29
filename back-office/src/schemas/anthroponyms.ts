import { z } from "zod";

export const anthroponymSchema = z.object({
  name: z.string().trim().min(1, "Campo obrigatório"),
  gender: z.string().trim().optional(),
  etymology: z.string().trim().optional(),
  meaning: z.string().trim().optional(),
  surname: z.string().trim().optional(),
  surnameMeaning: z.string().trim().optional(),
  historicalFigure: z.string().trim().optional(),
  historicalFigurePseudonym: z.string().trim().optional(),
  historicalFigureDomain: z.string().trim().optional(),
  isVocabulary: z.boolean().optional(),
  isVocabularyEP: z.boolean().optional(),
  isForeignism: z.boolean().optional(),
});

export type AnthroponymFormData = z.infer<typeof anthroponymSchema>;

export const reviewAnthroponymSchema = z.object({
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "NEEDS_CORRECTION", "ARCHIVED"], {
    error: (issue) => {
      if (issue.input === undefined) {
        return "Seleccione um estado";
      }

      return "Estado inválido";
    },
  }),
  reason: z.string().trim().optional(),
});

export type ReviewAnthroponymFormData = z.infer<typeof reviewAnthroponymSchema>;
