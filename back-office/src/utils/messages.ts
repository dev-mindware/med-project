import { toast } from "sonner";

export function SucessMessage(message: string | null) {
  toast.success(message);
}

export function ErrorMessage(message: string | null) {
  toast.error(normalizeMessage(message) || "Ocorreu um erro");
}

export function WarningMessage(message: string | null) {
  toast.warning(message);
}

export function InfoMessage(message: string | null) {
  toast.info(message);
}

function normalizeMessage(message: unknown): string | null {
  if (!message) return null;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "object") {
    const value = message as Record<string, any>;
    return normalizeMessage(value.message || value.error?.message || value.error) || JSON.stringify(value);
  }
  return String(message);
}
