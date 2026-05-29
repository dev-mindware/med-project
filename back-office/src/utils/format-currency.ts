/**
 * Formata um valor numérico para o padrão de moeda (atualmente fixo em AOA/KZ)
 * @param value Valor numérico ou string
 * @param currencyCode Código da moeda (opcional, padrão: AOA)
 */
export function formatCurrency(value: number | string, currencyCode: string = "AOA"): string {
  const amount = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(amount)) return "0,00 KZ";

  // Using custom formatter to ensure correct symbol and space
  const formatted = new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  // In case Intl.NumberFormat pt-AO uses Kz or similar
  return formatted.replace("Kz", "KZ");
}
