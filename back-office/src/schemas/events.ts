import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().trim().min(1, "Campo obrigatório"),
  slug: z.string().trim().min(1, "Campo obrigatório"),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  coverImageUrl: z.string().trim().optional(),
  startDate: z.string().trim().min(1, "Campo obrigatório"),
  endDate: z.string().trim().min(1, "Campo obrigatório"),
  location: z.string().trim().min(1, "Campo obrigatório"),
  maxRegistrations: z.number().int().positive().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "ARCHIVED"]).optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;

export const reviewEventSchema = z.object({
  status: z.enum(
    [
      "DRAFT",
      "PUBLISHED",
      "CANCELLED",
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

export type ReviewEventFormData = z.infer<typeof reviewEventSchema>;
