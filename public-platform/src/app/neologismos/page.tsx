import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalExplorer } from "@/components/lexical-explorer"
import { PageHero } from "@/components/page-hero"
import { getLexicalData } from "@/lib/lexical-data"

export default async function NeologismosPage() {
  const data = await getLexicalData()

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Novas palavras"
          title="Neologismos"
          subtitle="Consulte neologismos aprovados, com classe e subclasse gramatical, definições, exemplos de uso e mídias ligadas ao registo."
          tone="soft"
          stats={[
            { value: data.neologisms.meta.total.toLocaleString("pt-PT"), label: "Neologismos publicados" },
            { value: data.neologisms.data.filter((item) => item.grammaticalCategory).length.toLocaleString("pt-PT"), label: "Com classe nesta página" },
            { value: data.neologisms.data.filter((item) => item.audioUrl || item.imageUrl || item.videoUrl).length.toLocaleString("pt-PT"), label: "Com mídia nesta página" },
          ]}
        />
        <section className="section-paper py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalExplorer initialData={data} initialActive="neologisms" visibleCollections={["neologisms"]} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
