import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalExplorer } from "@/components/lexical-explorer"
import { PageHero } from "@/components/page-hero"
import { getLexicalData } from "@/lib/lexical-data"

export default async function AntroponimosPage() {
  const data = await getLexicalData()

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Antroponímia"
          title="Antropónimos"
          subtitle="Pesquise nomes próprios, sobrenomes, significados, etimologia e referências históricas publicadas."
          tone="soft"
          stats={[
            { value: data.anthroponyms.meta.total.toLocaleString("pt-PT"), label: "Antropónimos publicados" },
            { value: data.anthroponyms.data.filter((item) => item.gender).length.toLocaleString("pt-PT"), label: "Registos com género nesta página" },
            { value: data.anthroponyms.meta.totalPages.toLocaleString("pt-PT"), label: "Páginas disponíveis" },
          ]}
        />
        <section className="section-paper py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalExplorer initialData={data} initialActive="anthroponyms" visibleCollections={["anthroponyms"]} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
