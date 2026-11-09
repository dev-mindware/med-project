import Link from "next/link"
import type { Metadata } from "next"
import { Search } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CollectionHeader } from "@/components/collection-header"
import { ArticleCard } from "@/components/article-card"
import { ListPagination } from "@/components/list-pagination"
import { NoticeStrip } from "@/components/notice-strip"
import { publicApi, safePublicApi, type PublicPaginated, type PublicBlogPost } from "@/lib/public-api"

export const metadata: Metadata = {
  title: "Artigos e publicações",
  description: "Artigos, materiais educativos e pesquisas sobre a língua portuguesa em Angola.",
}

const PAGE_SIZE = 12
const emptyPage: PublicPaginated<PublicBlogPost> = {
  data: [],
  meta: { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
}

export default async function ArtigosPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; page?: string }>
}) {
  const params = await searchParams
  const q = params?.q?.trim() || undefined
  const category = params?.category || undefined
  const page = Math.max(1, Number(params?.page) || 1)

  const [articles, facets] = await Promise.all([
    safePublicApi(() => publicApi.blogPosts({ q, category, page, limit: PAGE_SIZE }), emptyPage),
    safePublicApi(() => publicApi.facets("articles"), null),
  ])

  const categories = Object.entries(facets?.facets.category ?? {}).sort(([a], [b]) => a.localeCompare(b, "pt"))
  const hrefFor = (next: { category?: string; page?: number }) => {
    const query = new URLSearchParams()
    if (q) query.set("q", q)
    const nextCategory = "category" in next ? next.category : category
    if (nextCategory) query.set("category", nextCategory)
    if (next.page && next.page > 1) query.set("page", String(next.page))
    const text = query.toString()
    return text ? `/articles?${text}` : "/articles"
  }

  // O primeiro artigo em destaque abre a lista (só na primeira página e sem filtros)
  const showFeatured = page === 1 && !q && !category
  const featured = showFeatured ? articles.data.find((article) => article.isFeatured) : undefined
  const rest = featured ? articles.data.filter((article) => article.id !== featured.id) : articles.data

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <NoticeStrip />
      <main className="flex-1">
        <CollectionHeader
          title="Artigos e publicações"
          subtitle="Artigos, materiais educativos e pesquisas sobre a língua portuguesa em Angola."
          total={(facets?.total ?? articles.meta.total).toLocaleString("pt-PT")}
          unit="publicações"
        />
        <section className="section-paper py-8 md:py-10">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <form action="/articles" role="search" className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-background px-3">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Pesquisar artigos, autores ou temas…"
                  aria-label="Pesquisar artigos"
                  className="h-11 w-full bg-transparent text-base outline-none"
                />
                {category && <input type="hidden" name="category" value={category} />}
              </div>
              <button type="submit" className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">Pesquisar</button>
            </form>

            {categories.length > 0 && (
              <nav aria-label="Categorias" className="mt-4 flex flex-wrap gap-2">
                <Link href={hrefFor({ category: undefined })} aria-current={!category ? "page" : undefined} className={`rounded-md border px-3 py-1.5 text-sm font-medium ${!category ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-primary/10"}`}>
                  Todas
                </Link>
                {categories.map(([name, count]) => (
                  <Link key={name} href={hrefFor({ category: name })} aria-current={category === name ? "page" : undefined} className={`rounded-md border px-3 py-1.5 text-sm font-medium ${category === name ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-primary/10"}`}>
                    {name} ({count})
                  </Link>
                ))}
              </nav>
            )}

            {featured && <div className="mt-8"><ArticleCard article={featured} featured /></div>}

            {articles.data.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article) => <ArticleCard key={article.id} article={article} />)}
              </div>
            ) : (
              <p className="mt-10 rounded-md border border-dashed p-10 text-center text-muted-foreground">
                Nenhuma publicação encontrada. Tente outras palavras ou limpe a categoria.
              </p>
            )}

            <ListPagination meta={articles.meta} hrefFor={(next) => hrefFor({ page: next })} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
