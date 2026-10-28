import type { MetadataRoute } from "next"
import { entryPath, SITE_URL } from "@/lib/entry-slug"
import { publicApi, safePublicApi } from "@/lib/public-api"

/** A API limita a 50 por página: pagina-se até ao fim (com teto de segurança). */
const PAGE_SIZE = 50
const MAX_PAGES = 400
export const revalidate = 3600

const staticRoutes = ["", "/dictionary", "/neologismos", "/estrangeirismos", "/toponimos", "/antroponimos", "/vonalp", "/vonalp-ep", "/volna", "/articles", "/events", "/about"]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await safePublicApi(() => publicApi.dictionary({ page, limit: PAGE_SIZE }), null)
    if (!result) break
    result.data.forEach((entry) =>
      entries.push({
        url: `${SITE_URL}${entryPath(entry)}`,
        lastModified: entry.updatedAt ?? entry.approvedAt ?? undefined,
      }),
    )
    if (!result.meta.hasNextPage) break
  }
  return [...staticRoutes.map((route) => ({ url: `${SITE_URL}${route}` })), ...entries]
}
