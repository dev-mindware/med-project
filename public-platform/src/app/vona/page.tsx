import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { VonaSearch } from "@/components/vona-search"
import { VonaCategories } from "@/components/vona-categories"

export default function VonaPage() {
  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Recurso"
          title="Vocabulário Ortográfico Nacional de Angola"
          subtitle="Consulta interactiva do vocabulário oficial angolano com filtros por letra, categoria gramatical e topónimos"
          stats={[
            { value: "8 900+", label: "Termos nacionais" },
            { value: "18", label: "Províncias cobertas" },
            { value: "CPLP", label: "Norma oficial" },
          ]}
        />
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <VonaSearch />
          </div>
        </section>
        <section className="py-14 bg-muted/20 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <VonaCategories />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
