import { z } from "zod";

export const toponymSchema = z.object({
  toponym: z.string().trim().min(1, "Campo obrigatório"),
  pronunciation: z.string().trim().optional(),
  meaning: z.string().trim().optional(),
  province: z.string().trim().min(1, "Campo obrigatório"),
  municipality: z.string().trim().optional(),
  location: z.string().trim().optional(),
  gentilic: z.string().trim().optional(),
  locationImage: z.string().trim().optional(),
  toponymHistory: z.string().trim().optional(),
  toponymProvenance: z.string().trim().optional(),
  commonUsage: z.string().trim().optional(),
  graphicVariation: z.string().trim().optional(),
  toponymClasses: z.array(z.string()).optional(),
  toponymSubclasses: z.array(z.string()).optional(),
  languageCode: z.string().trim().optional(),
  isVocabulary: z.boolean().optional(),
  isVocabularyEP: z.boolean().optional(),
  isForeignism: z.boolean().optional(),
});

export type ToponymFormData = z.infer<typeof toponymSchema>;

export const reviewToponymSchema = z.object({
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

export type ReviewToponymFormData = z.infer<typeof reviewToponymSchema>;
