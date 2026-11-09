const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://cn-iilp.ao").replace(/\/$/, "")

/** «Abcedário» → «abcedario» (sem acentos, minúsculas, hífenes). */
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Caminho do verbete: palavra legível + id (o id garante unicidade sem migração na API). */
export function entryPath(entry: { id: string; entry: string }) {
  const slug = slugify(entry.entry)
  return `/dictionary/${slug ? `${slug}-` : ""}${entry.id}`
}

/** Extrai o id do último segmento do URL; aceita também só o id. */
export function entryIdFromParam(param: string) {
  return decodeURIComponent(param).match(UUID)?.[0]
}
