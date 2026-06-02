import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { ArticlesSearch } from "@/components/articles-search"
import { ArticleCategories } from "@/components/article-categories"
import { FeaturedArticles } from "@/components/featured-articles"
import { publicApi, safePublicApi } from "@/lib/public-api"

export default async function ArtigosPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string }>
}) {
  const params = await searchParams
  const articles = await safePublicApi(
    () => publicApi.blogPosts({ q: params?.q, category: params?.category, limit: 100 }),
    { data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 0, hasNextPage: false, hasPreviousPage: false } },
  )

  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Conteúdos"
          title="Artigos e Publicações"
          subtitle="Explore artigos académicos, materiais educativos e pesquisas sobre a língua portuguesa em Angola."
          tone="soft"
          stats={[
            { value: articles.meta.total.toLocaleString("pt-PT"), label: "Publicações encontradas" },
            { value: articles.data.filter((article) => article.isFeatured).length.toLocaleString("pt-PT"), label: "Destaques nesta lista" },
            { value: articles.data.length.toLocaleString("pt-PT"), label: "Disponíveis nesta página" },
          ]}
        />
        <section className="section-paper py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <ArticlesSearch initialResults={articles.data} initialQuery={params?.q ?? ""} initialCategory={params?.category ?? ""} />
          </div>
        </section>
        <FeaturedArticles articles={articles.data} />
        <section className="section-paper py-14 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <ArticleCategories articles={articles.data} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
