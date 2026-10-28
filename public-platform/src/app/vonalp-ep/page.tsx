import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalExplorer } from "@/components/lexical-explorer"
import { CollectionHeader } from "@/components/collection-header"
import { VonalpReferenceSection } from "@/components/vonalp-reference-section"
import { getLexicalData } from "@/lib/lexical-data"

export default async function VonalpEpPage() {
  const data = await getLexicalData()

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <CollectionHeader
          title="VONALP-EP"
          subtitle="Vocabulário Ortográfico Nacional de Angola da Língua Portuguesa para o Ensino Primário."
          total={data.vonalpEp.meta.total.toLocaleString("pt-PT")}
          unit="vocábulos publicados"
        />
        <VonalpReferenceSection />
        <section className="section-paper py-8 md:py-10">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalExplorer initialData={data} initialActive="vonalpEp" visibleCollections={["vonalpEp"]} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
