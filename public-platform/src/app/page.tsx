import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { HomeVisualSection } from "@/components/home-visual-section"
import { WordOfTheDay } from "@/components/word-of-the-day"
import { FeaturedActivities } from "@/components/featured-activities"
import { FeaturedArticles } from "@/components/featured-articles"
import { Footer } from "@/components/footer"
import { publicApi, safePublicApi } from "@/lib/public-api"

export default async function HomePage() {
  const [stats, articles, events, dictionary] = await Promise.all([
    safePublicApi(() => publicApi.stats(), null),
    safePublicApi(
      () => publicApi.blogPosts({ limit: 6 }),
      { data: [], meta: { total: 0, page: 1, limit: 6, totalPages: 0, hasNextPage: false, hasPreviousPage: false } },
    ),
    safePublicApi(
      () => publicApi.events({ period: "upcoming", limit: 3 }),
      { data: [], meta: { total: 0, page: 1, limit: 3, totalPages: 0, hasNextPage: false, hasPreviousPage: false } },
    ),
    safePublicApi(
      () => publicApi.dictionary({ limit: 100 }),
      { data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 0, hasNextPage: false, hasPreviousPage: false } },
    ),
  ])

  const entries = dictionary.data
  let wordOfTheDay = undefined
  if (entries.length > 0) {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
    )
    wordOfTheDay = entries[dayOfYear % entries.length]
  }

  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <HeroSection
          stats={stats ? [
            { value: stats.dictionaryEntries.toLocaleString("pt-PT"), label: "Entradas aprovadas" },
            { value: (stats.vonalpTerms + stats.vonalpEpTerms).toLocaleString("pt-PT"), label: "Termos VONALP completos" },
            { value: stats.toponyms.toLocaleString("pt-PT"), label: "Topónimos publicados" },
          ] : []}
        />
        <ServicesSection stats={stats} />
        <HomeVisualSection />
        <FeaturedActivities events={events.data} />

        <section className="section-paper py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Léxico</p>
              <h2 className="text-4xl font-extrabold tracking-tight mb-3">Palavra do Dia</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Descubra e aprenda uma nova palavra do português de Angola todos os dias
              </p>
            </div>
            <WordOfTheDay word={wordOfTheDay} />
          </div>
        </section>

        <FeaturedArticles articles={articles.data} />
      </main>
      <Footer />
    </div>
  )
}
