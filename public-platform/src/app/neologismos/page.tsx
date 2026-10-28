import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalExplorer } from "@/components/lexical-explorer"
import { CollectionHeader } from "@/components/collection-header"
import { getLexicalData } from "@/lib/lexical-data"

export default async function NeologismosPage() {
  const data = await getLexicalData()

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <CollectionHeader
          title="Neologismos"
          subtitle="Consulte neologismos aprovados, com classe e subclasse gramatical, definições, exemplos de uso e conteúdo multimédia ligado ao registo."
          total={data.neologisms.meta.total.toLocaleString("pt-PT")}
          unit="neologismos publicados"
        />
        <section className="section-paper py-8 md:py-10">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalExplorer initialData={data} initialActive="neologisms" visibleCollections={["neologisms"]} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
