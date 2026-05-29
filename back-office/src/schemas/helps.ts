import { z } from "zod";

export const taxNumberSchema = z
  .string()
  .trim()
  .nonempty("Campo obrigatorio")
  .refine(
    (value) => /^\d{9}[A-Z]{2}\d{3}$/.test(value) || /^\d{10}$/.test(value),
    "NIF inválido — use formato de pessoa singular ou coletiva",
  );

export const phoneNumberSchema = z
  .string({ error: "Insira um número de telefone válido" })
  .trim()
  .max(9, "O número deve ter 9 dígitos")
  .refine(
    (value) => !value || /^(92|99|91|95|93|94|97)\d{7}$/.test(value),
    "Insira número de telemovél válido",
  );
