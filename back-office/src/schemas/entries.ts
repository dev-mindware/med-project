import { z } from "zod";

export const entrySchema = z.object({
  entry: z.string().trim().min(1, "Campo obrigatório"),
  pronunciation: z.string().trim().optional(),
  syllabicDivision: z.string().trim().optional(),
  etymology: z.string().trim().optional(),
  firstDefinition: z.string().trim().min(1, "Campo obrigatório"),
  secondDefinition: z.string().trim().optional(),
  thirdDefinition: z.string().trim().optional(),
  usageExample: z.string().trim().optional(),
  abbreviation: z.string().trim().optional(),
  acronym: z.string().trim().optional(),
  acronymMeaning: z.string().trim().optional(),
  reduction: z.string().trim().optional(),
  reductionMeaning: z.string().trim().optional(),
  shortForm: z.string().trim().optional(),
  fullForm: z.string().trim().optional(),
  grammaticalCategory: z.string().trim().optional(),
  grammaticalSubcategory: z.string().trim().optional(),
  grammaticalStatus: z.string().trim().optional(),
  languageCode: z.string().trim().optional(),
  audioUrl: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  videoUrl: z.string().trim().optional(),
  isVocabulary: z.boolean().optional(),
  isVocabularyEP: z.boolean().optional(),
  isForeignism: z.boolean().optional(),
});

export type EntryFormData = z.infer<typeof entrySchema>;

export const reviewEntrySchema = z.object({
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

export type ReviewEntryFormData = z.infer<typeof reviewEntrySchema>;
