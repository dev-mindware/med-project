import { z } from "zod";

export const userSchema = z.object({
  email: z.string().trim().email("Email inválido").min(1, "Campo obrigatório"),
  password: z.string().trim().min(6, "Mínimo de 6 caracteres").optional(),
  name: z.string().trim().min(1, "Campo obrigatório"),
  role: z.enum(["ADMIN", "SUPERVISOR", "OPERATOR"]).optional(),
  isActive: z.boolean().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
