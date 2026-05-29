import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "A palavra-passe é obrigatória"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
