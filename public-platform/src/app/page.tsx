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
      () => publicApi.dictionary({ limit: 6 }),
      { data: [], meta: { total: 0, page: 1, limit: 6, totalPages: 0, hasNextPage: false, hasPreviousPage: false } },
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
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <HeroSection
          stats={stats ? [
            { value: stats.dictionaryEntries.toLocaleString("pt-PT"), label: "Entradas aprovadas" },
            { value: (stats.vonalpTerms + stats.vonalpEpTerms).toLocaleString("pt-PT"), label: "Vocábulos VONALP publicados" },
            { value: (stats.volnaTerms ?? 0).toLocaleString("pt-PT"), label: "Vocábulos VOLNA publicados" },
            { value: stats.toponyms.toLocaleString("pt-PT"), label: "Topónimos publicados" },
          ] : []}
        />
        <ServicesSection stats={stats} />
        <HomeVisualSection />
        <FeaturedActivities events={events.data} />

        <section className="word-parallax-section py-20">
          <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="mb-10 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-100">Base lexical</p>
              <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-white">Palavra do Dia</h2>
              <p className="mx-auto max-w-xl text-lg text-blue-50/82">
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
