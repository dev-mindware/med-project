import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { GrammarTopics } from "@/components/grammar-topics"
import { GrammarSearch } from "@/components/grammar-search"

export default function GramaticaPage() {
  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Recurso"
          title="Gramática da Língua Portuguesa"
          subtitle="Regras gramaticais explicadas de forma clara com exemplos práticos e ligações directas ao dicionário"
          stats={[
            { value: "4", label: "Categorias" },
            { value: "32+", label: "Tópicos" },
            { value: "80+", label: "Lições" },
          ]}
        />
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <GrammarSearch />
          </div>
        </section>
        <section className="py-14 bg-muted/20 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <GrammarTopics />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
