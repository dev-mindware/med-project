import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalFlipbook } from "@/components/lexical-flipbook"
import { PageHero } from "@/components/page-hero"
import { getToponymsFlipbookData } from "@/lib/flipbook-data"

export default async function ToponimosFlipPage() {
  const data = await getToponymsFlipbookData()

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Flipbook"
          title="Topónimos em modo livro"
          subtitle="Navegue pelos nomes de lugares em páginas leves, com leitura confortável."
          tone="ice"
          stats={[
            { value: data.meta.total.toLocaleString("pt-PT"), label: "Topónimos" },
            { value: data.meta.totalPages.toLocaleString("pt-PT"), label: "Páginas do flipbook" },
          ]}
        />
        <section className="section-paper py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalFlipbook collection="toponyms" initialData={data} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
