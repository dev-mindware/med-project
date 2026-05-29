import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { DocumentsSearch } from "@/components/documents-search"
import { DocumentCategories } from "@/components/document-categories"

export default function DocumentosPage() {
  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Recurso"
          title="Documentos e Arquivos"
          subtitle="Acesse documentos oficiais, brochuras da CPLP, manuais escolares e materiais educativos para download"
          stats={[
            { value: "500+", label: "Documentos" },
            { value: "Gratuito", label: "Download livre" },
            { value: "PDF", label: "Formato universal" },
          ]}
        />
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <DocumentsSearch />
          </div>
        </section>
        <section className="py-14 bg-muted/20 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <DocumentCategories />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
