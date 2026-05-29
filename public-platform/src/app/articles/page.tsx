import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { ArticlesSearch } from "@/components/articles-search"
import { ArticleCategories } from "@/components/article-categories"
import { FeaturedArticles } from "@/components/featured-articles"

export default function ArtigosPage() {
  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Conteúdos"
          title="Artigos e Publicações"
          subtitle="Explore artigos académicos, materiais educativos e pesquisas sobre a língua portuguesa em Angola"
        />
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <ArticlesSearch />
          </div>
        </section>
        <FeaturedArticles />
        <section className="py-14 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <ArticleCategories />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
