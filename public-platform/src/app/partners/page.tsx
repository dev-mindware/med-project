import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { PartnersGrid } from "@/components/partners-grid"
import { PartnershipTypes } from "@/components/partnership-types"

export default function ParceirosPage() {
  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Sobre"
          title="Parceiros e Ligações"
          subtitle="Conheça as instituições e organizações que colaboram connosco na promoção da língua portuguesa"
        />
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <PartnershipTypes />
          </div>
        </section>
        <section className="py-14 bg-muted/20 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <PartnersGrid />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
