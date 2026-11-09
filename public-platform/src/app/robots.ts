import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/entry-slug"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/pesquisar", "/*/flip"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
