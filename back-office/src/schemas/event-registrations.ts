import { z } from "zod";

export const eventRegistrationSchema = z.object({
  eventId: z.string().trim().min(1, "Campo obrigatório"),
  name: z.string().trim().min(1, "Campo obrigatório"),
  email: z.string().trim().email("Email inválido").min(1, "Campo obrigatório"),
  phone: z.string().trim().optional(),
  organization: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type EventRegistrationFormData = z.infer<typeof eventRegistrationSchema>;

export const reviewEventRegistrationSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"], {
    error: (issue) => {
      if (issue.input === undefined) {
        return "Seleccione um estado";
      }

      return "Estado inválido";
    },
  }),
  notes: z.string().trim().optional(),
});

export type ReviewEventRegistrationFormData = z.infer<typeof reviewEventRegistrationSchema>;
