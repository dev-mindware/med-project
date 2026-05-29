import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { MediaGallery } from "@/components/media-gallery"
import { MediaCategories } from "@/components/media-categories"

export default function MultimidiaPage() {
  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Conteúdos"
          title="Galeria Multimídia"
          subtitle="Explore fotos e vídeos das atividades realizadas pela Comissão Nacional de Língua Portuguesa"
        />
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <MediaCategories />
          </div>
        </section>
        <section className="py-14 bg-muted/20 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <MediaGallery />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
