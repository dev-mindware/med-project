import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalExplorer } from "@/components/lexical-explorer"
import { PageHero } from "@/components/page-hero"
import { getLexicalData } from "@/lib/lexical-data"

export default async function EstrangeirismosPage() {
  const data = await getLexicalData()

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Empréstimos linguísticos"
          title="Estrangeirismos"
          subtitle="Explore termos de origem estrangeira aprovados, com língua original, país de origem, campo de uso, forma adaptada e classificação gramatical."
          tone="ice"
          stats={[
            { value: data.foreignisms.meta.total.toLocaleString("pt-PT"), label: "Estrangeirismos publicados" },
            { value: data.foreignisms.data.filter((item) => item.originalLanguage).length.toLocaleString("pt-PT"), label: "Com língua de origem" },
            { value: data.foreignisms.data.filter((item) => item.adaptedForm).length.toLocaleString("pt-PT"), label: "Com forma adaptada" },
          ]}
        />
        <section className="section-paper py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalExplorer initialData={data} initialActive="foreignisms" visibleCollections={["foreignisms"]} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
