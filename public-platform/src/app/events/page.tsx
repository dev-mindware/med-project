import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { EventsCalendar } from "@/components/events-calendar"
import { EventsList } from "@/components/events-list"
import { NewsletterSignup } from "@/components/newsletter-signup"

export default function EventosPage() {
  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Agenda"
          title="Eventos e Actividades"
          subtitle="Acompanhe conferências, workshops, seminários e outras actividades da Comissão Nacional de Língua Portuguesa"
          stats={[
            { value: "45+", label: "Eventos por ano" },
            { value: "Online", label: "Inscrição fácil" },
            { value: "Aberto", label: "Ao público" },
          ]}
        />
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <EventsCalendar />
          </div>
        </section>
        <section className="py-14 bg-muted/20 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <EventsList />
          </div>
        </section>
        <section className="py-14 border-t border-border/40">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-12">
            <NewsletterSignup />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
