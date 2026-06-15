import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalExplorer } from "@/components/lexical-explorer"
import { PageHero } from "@/components/page-hero"
import { VonalpReferenceSection } from "@/components/vonalp-reference-section"
import { getLexicalData } from "@/lib/lexical-data"

export default async function VonalpPage() {
  const data = await getLexicalData()

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Norma nacional"
          title="VONALP"
          subtitle="Vocabulário Ortográfico Nacional de Angola da Língua Portuguesa"
          tone="ice"
          stats={[
            { value: data.vonalp.meta.total.toLocaleString("pt-PT"), label: "Vocábulos publicados" },
            { value: data.vonalp.data.filter((item) => item.grammaticalCategory).length.toLocaleString("pt-PT"), label: "Natureza das fontes" },
            { value: data.vonalp.meta.totalPages.toLocaleString("pt-PT"), label: "Páginas disponíveis" },
          ]}
        />
        <VonalpReferenceSection />
        <section className="section-paper py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalExplorer initialData={data} initialActive="vonalp" visibleCollections={["vonalp"]} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
