import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { AboutAngola } from "@/components/about-angola"
import { AboutCommission } from "@/components/about-commission"
import { ContactInfo } from "@/components/contact-info"

export default function SobrePage() {
  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Sobre"
          title="A Comissão Nacional de Língua Portuguesa"
          subtitle="Conheça a história de Angola, a importância da língua portuguesa e a missão da nossa comissão"
        />
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <AboutCommission />
          </div>
        </section>
        <section className="py-14 bg-muted/20 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <AboutAngola />
          </div>
        </section>
        <section className="py-14 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <ContactInfo />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
