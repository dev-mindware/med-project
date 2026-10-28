import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalExplorer } from "@/components/lexical-explorer"
import { CollectionHeader } from "@/components/collection-header"
import { getLexicalData } from "@/lib/lexical-data"

export default async function AntroponimosPage() {
  const data = await getLexicalData()

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <CollectionHeader
          title="Antropónimos"
          subtitle="Pesquise nomes próprios, significados, etimologia e referências históricas publicadas."
          total={data.anthroponyms.meta.total.toLocaleString("pt-PT")}
          unit="antropónimos publicados"
        />
        <section className="section-paper py-8 md:py-10">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalExplorer initialData={data} initialActive="anthroponyms" visibleCollections={["anthroponyms"]} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
