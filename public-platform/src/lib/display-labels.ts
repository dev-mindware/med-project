const postTypeLabels: Record<string, string> = {
  ARTICLE: "Artigo",
  VIDEO: "Vídeo",
  IMAGE: "Imagem",
  EVENT_COVERAGE: "Cobertura de evento",
  ANNOUNCEMENT: "Comunicado",
}

export function getPostTypeLabel(type?: string | null) {
  if (!type) return ""
  return postTypeLabels[type] ?? sentenceCase(type)
}

export function sentenceCase(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\p{L}/u, (match) => match.toUpperCase())
}
