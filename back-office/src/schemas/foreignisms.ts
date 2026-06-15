import { z } from "zod";

export const foreignismSchema = z.object({
  term: z.string().trim().min(1, "O vocábulo é obrigatório"),
  pronunciation: z.string().trim().optional(),
  originalLanguage: z.string().trim().optional(),
  originCountry: z.string().trim().optional(),
  adaptedForm: z.string().trim().optional(),
  originalForm: z.string().trim().optional(),
  meaning: z.string().trim().optional(),
  definition: z.string().trim().optional(),
  usageExample: z.string().trim().optional(),
  context: z.string().trim().optional(),
  field: z.string().trim().optional(),
  abbreviation: z.string().trim().optional(),
  acronym: z.string().trim().optional(),
  reduction: z.string().trim().optional(),
  shortForm: z.string().trim().optional(),
  fullForm: z.string().trim().optional(),
  grammaticalCategory: z.string().trim().optional(),
  isVocabulary: z.boolean().optional(),
  isVocabularyEP: z.boolean().optional(),
  isForeignism: z.boolean().optional(),
});

export type ForeignismFormData = z.infer<typeof foreignismSchema>;

export const reviewForeignismSchema = z.object({
  status: z.enum(
    [
      "DRAFT",
      "PENDING_APPROVAL",
      "APPROVED",
      "REJECTED",
      "NEEDS_CORRECTION",
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

export type ReviewForeignismFormData = z.infer<typeof reviewForeignismSchema>;
