import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalExplorer } from "@/components/lexical-explorer"
import { CollectionHeader } from "@/components/collection-header"
import { VonalpReferenceSection } from "@/components/vonalp-reference-section"
import { getLexicalData } from "@/lib/lexical-data"

export default async function VonalpPage() {
  const data = await getLexicalData()

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <CollectionHeader
          title="VONALP"
          subtitle="Vocabulário Ortográfico Nacional de Angola da Língua Portuguesa"
          total={data.vonalp.meta.total.toLocaleString("pt-PT")}
          unit="vocábulos publicados"
        />
        <VonalpReferenceSection />
        <section className="section-paper py-8 md:py-10">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalExplorer initialData={data} initialActive="vonalp" visibleCollections={["vonalp"]} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
