import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalExplorer } from "@/components/lexical-explorer"
import { PageHero } from "@/components/page-hero"
import { VonalpReferenceSection } from "@/components/vonalp-reference-section"
import { getLexicalData } from "@/lib/lexical-data"

export default async function LexicoPage() {
  const data = await getLexicalData()

  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Base lexical"
          title="Neologismos, Estrangeirismos, Topónimos, Antropónimos e VONALP"
          subtitle="Explore o acervo linguístico publicado pela API: novas palavras, estrangeirismos, nomes de lugares, nomes de pessoas e vocabulários ortográficos nacionais."
          tone="soft"
          stats={[
            { value: data.neologisms.meta.total.toLocaleString("pt-PT"), label: "Neologismos" },
            { value: data.foreignisms.meta.total.toLocaleString("pt-PT"), label: "Estrangeirismos" },
            { value: (data.vonalp.meta.total + data.vonalpEp.meta.total).toLocaleString("pt-PT"), label: "Termos VONALP" },
          ]}
        />
        <VonalpReferenceSection />
        <section className="section-paper py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalExplorer initialData={data} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
