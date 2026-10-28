import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CollectionHeader } from "@/components/collection-header"
import { DictionarySearch } from "@/components/dictionary-search"
import { FeaturedWords } from "@/components/featured-words"
import { publicApi, safePublicApi } from "@/lib/public-api"

export default async function DicionarioPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string
    category?: string
    grammaticalSubcategory?: string
    languageCode?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const page = Number(params?.page || 1)
  const [stats, entries] = await Promise.all([
    safePublicApi(() => publicApi.stats(), null),
    safePublicApi(
      () =>
        publicApi.dictionary({
          q: params?.q,
          category: params?.category,
          grammaticalSubcategory: params?.grammaticalSubcategory,
          languageCode: params?.languageCode,
          page: Number.isFinite(page) ? page : 1,
          limit: 6,
        }),
      { data: [], meta: { total: 0, page: 1, limit: 6, totalPages: 0, hasNextPage: false, hasPreviousPage: false } },
    ),
  ])

  // Defensivo: nunca rebentar a página se a API omitir o total
  const total = entries.meta.total ?? entries.data.length

  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <CollectionHeader
          title="Dicionário de Língua Portuguesa"
          subtitle="Consulte definições, etimologias, exemplos de uso e informações gramaticais aprovadas para consulta pública."
          total={(stats?.dictionaryEntries ?? total).toLocaleString("pt-PT")}
          unit="entradas aprovadas"
        />
        <section className="section-paper py-8 md:py-10">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <DictionarySearch
              initialResults={entries.data}
              initialMeta={entries.meta}
              initialQuery={params?.q ?? ""}
              initialCategory={params?.category ?? ""}
              initialSubcategory={params?.grammaticalSubcategory ?? ""}
              initialLanguageCode={params?.languageCode ?? ""}
            />
          </div>
        </section>
        <section className="section-ice py-14 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <FeaturedWords entries={entries.data} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
