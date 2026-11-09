/** Minutos de leitura estimados (200 palavras por minuto) a partir de HTML ou texto. */
export function readingMinutes(content?: string | null) {
  if (!content) return null
  const words = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .split(/\s+/)
    .filter(Boolean).length
  return words === 0 ? null : Math.max(1, Math.round(words / 200))
}
