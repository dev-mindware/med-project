import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalExplorer } from "@/components/lexical-explorer"
import { PageHero } from "@/components/page-hero"
import { getLexicalData } from "@/lib/lexical-data"

export default async function VolnaPage() {
  const data = await getLexicalData()

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Línguas nacionais"
          title="VOLNA"
          subtitle="Vocabulário das Línguas Nacionais de Angola"
          tone="ice"
          stats={[
            { value: data.volna.meta.total.toLocaleString("pt-PT"), label: "Vocábulos publicados" },
            { value: data.volna.data.filter((item) => item.language).length.toLocaleString("pt-PT"), label: "Línguas nesta consulta" },
            { value: data.volna.meta.totalPages.toLocaleString("pt-PT"), label: "Páginas disponíveis" },
          ]}
        />
        <section className="section-soft border-y border-border/40 py-10">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="rounded-md border border-emerald-100/80 bg-white/86 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Referência</p>
              <h2 className="mt-2 text-2xl font-extrabold">VOLNA — Vocabulário das Línguas Nacionais de Angola</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                Este acervo reúne vocábulos publicados das línguas nacionais de Angola, com definição, classificação gramatical e exemplos de uso quando disponíveis.
              </p>
            </div>
          </div>
        </section>
        <section className="section-paper py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalExplorer initialData={data} initialActive="volna" visibleCollections={["volna"]} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
