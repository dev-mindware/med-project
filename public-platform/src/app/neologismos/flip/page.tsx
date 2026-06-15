import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalFlipbook } from "@/components/lexical-flipbook"
import { PageHero } from "@/components/page-hero"
import { getNeologismsFlipbookData } from "@/lib/flipbook-data"

export default async function NeologismosFlipPage() {
  const data = await getNeologismsFlipbookData()

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Flipbook"
          title="Neologismos em modo livro"
          subtitle="Navegue pelas novas palavras aprovadas em páginas leves e pesquisáveis."
          tone="soft"
          stats={[
            { value: data.meta.total.toLocaleString("pt-PT"), label: "Neologismos" },
            { value: data.meta.totalPages.toLocaleString("pt-PT"), label: "Páginas do flipbook" },
          ]}
        />
        <section className="section-paper py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalFlipbook collection="neologisms" initialData={data} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
