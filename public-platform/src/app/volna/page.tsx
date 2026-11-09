import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalExplorer } from "@/components/lexical-explorer"
import { CollectionHeader } from "@/components/collection-header"
import { getLexicalData } from "@/lib/lexical-data"

export default async function VolnaPage() {
  const data = await getLexicalData()

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <CollectionHeader
          title="VOLNA"
          subtitle="Vocabulário das Línguas Nacionais de Angola"
          total={data.volna.meta.total.toLocaleString("pt-PT")}
          unit="vocábulos publicados"
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
        <section className="section-paper py-8 md:py-10">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalExplorer initialData={data} initialActive="volna" visibleCollections={["volna"]} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
