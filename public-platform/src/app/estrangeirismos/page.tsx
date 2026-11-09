import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LexicalExplorer } from "@/components/lexical-explorer"
import { CollectionHeader } from "@/components/collection-header"
import { getLexicalData } from "@/lib/lexical-data"

export default async function EstrangeirismosPage() {
  const data = await getLexicalData()

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <CollectionHeader
          title="Estrangeirismos"
          subtitle="Explore vocábulos de origem estrangeira aprovados, com língua original, país de origem, campo de uso, forma adaptada e classificação gramatical."
          total={data.foreignisms.meta.total.toLocaleString("pt-PT")}
          unit="estrangeirismos publicados"
        />
        <section className="section-paper py-8 md:py-10">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <LexicalExplorer initialData={data} initialActive="foreignisms" visibleCollections={["foreignisms"]} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
