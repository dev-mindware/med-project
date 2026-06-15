import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalFlipbook } from "@/components/lexical-flipbook"
import { PageHero } from "@/components/page-hero"
import { getVonalpFlipbookData } from "@/lib/flipbook-data"

export default async function VonalpFlipPage() {
  const data = await getVonalpFlipbookData()

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Flipbook"
          title="VONALP em modo livro"
          subtitle="Vocabulário Ortográfico Nacional de Angola da Língua Portuguesa em navegação de livro."
          tone="ice"
          stats={[
            { value: data.meta.total.toLocaleString("pt-PT"), label: "Vocábulos" },
            { value: data.meta.totalPages.toLocaleString("pt-PT"), label: "Páginas do flipbook" },
          ]}
        />
        <section className="section-paper py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalFlipbook collection="vonalp" initialData={data} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
