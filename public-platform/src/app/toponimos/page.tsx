import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalExplorer } from "@/components/lexical-explorer"
import { PageHero } from "@/components/page-hero"
import { getLexicalData } from "@/lib/lexical-data"

export default async function ToponimosPage() {
  const data = await getLexicalData()

  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Toponímia"
          title="Topónimos"
          subtitle="Consulte nomes de lugares, províncias, municípios, gentílicos, significados e história toponímica publicados."
          tone="ice"
          stats={[
            { value: data.toponyms.meta.total.toLocaleString("pt-PT"), label: "Topónimos publicados" },
            { value: data.toponyms.data.filter((item) => item.province).length.toLocaleString("pt-PT"), label: "Registos com província nesta página" },
            { value: data.toponyms.meta.totalPages.toLocaleString("pt-PT"), label: "Páginas disponíveis" },
          ]}
        />
        <section className="section-paper py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalExplorer initialData={data} initialActive="toponyms" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
