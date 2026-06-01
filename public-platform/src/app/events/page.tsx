import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { EventsCalendar } from "@/components/events-calendar"
import { EventsList } from "@/components/events-list"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { publicApi, safePublicApi } from "@/lib/public-api"

export default async function EventosPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; period?: "upcoming" | "ongoing" | "past" }>
}) {
  const params = await searchParams
  const period = params?.period ?? "upcoming"
  const events = await safePublicApi(
    () => publicApi.events({ period, q: params?.q, category: params?.category, limit: 100 }),
    { data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 0, hasNextPage: false, hasPreviousPage: false } },
  )

  return (
    <div className="min-h-screen flex flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Agenda"
          title="Eventos e Atividades"
          subtitle="Acompanhe conferências, workshops, seminários e atividades publicadas pela Comissão Nacional de Língua Portuguesa."
          tone="ice"
          stats={[
            { value: events.meta.total.toLocaleString("pt-PT"), label: "Eventos encontrados" },
            { value: events.data.filter((event) => event.maxRegistrations).length.toLocaleString("pt-PT"), label: "Com vagas definidas nesta lista" },
            { value: period === "upcoming" ? "Próximos" : period === "ongoing" ? "Em andamento" : "Passados", label: "Período ativo" },
          ]}
        />
        <section className="section-paper py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <EventsCalendar initialEvents={events.data} initialPeriod={period} />
          </div>
        </section>
        <section className="section-ice py-14 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <EventsList events={events.data} />
          </div>
        </section>
        <section className="section-paper py-14 border-t border-border/40">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-12">
            <NewsletterSignup />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
