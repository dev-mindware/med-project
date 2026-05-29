import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { DictionarySearch } from "@/components/dictionary-search"
import { FeaturedWords } from "@/components/featured-words"

export default function DictionarioPage() {
  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Recurso"
          title="Dicionário de Língua Portuguesa"
          subtitle="Consulte definições, etimologias, exemplos de uso e informações gramaticais completas"
          stats={[
            { value: "15 000+", label: "Entradas lexicais" },
            { value: "8 900+", label: "Termos angolanos" },
            { value: "3 línguas", label: "Cobertura nacional" },
          ]}
        />
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <DictionarySearch />
          </div>
        </section>
        <section className="py-14 bg-muted/20 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <FeaturedWords />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
