import Link from "next/link"
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CollectionHeader } from "@/components/collection-header"
import { EventCard } from "@/components/event-card"
import { ListPagination } from "@/components/list-pagination"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { publicApi, safePublicApi, type PublicEvent, type PublicPaginated } from "@/lib/public-api"

export const metadata: Metadata = {
  title: "Eventos e actividades",
  description: "Conferências, workshops, seminários e actividades da Comissão Nacional de Língua Portuguesa.",
}

type Period = "upcoming" | "ongoing" | "past"
const PAGE_SIZE = 10
const periods: { key: Period; label: string }[] = [
  { key: "upcoming", label: "Próximos" },
  { key: "ongoing", label: "Em curso" },
  { key: "past", label: "Passados" },
]
const emptyPage: PublicPaginated<PublicEvent> = {
  data: [],
  meta: { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
}

export default async function EventosPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; period?: string; page?: string }>
}) {
  const params = await searchParams
  const period: Period = periods.some((item) => item.key === params?.period) ? (params!.period as Period) : "upcoming"
  const category = params?.category || undefined
  const page = Math.max(1, Number(params?.page) || 1)

  const [events, facets] = await Promise.all([
    safePublicApi(() => publicApi.events({ period, category, page, limit: PAGE_SIZE }), emptyPage),
    safePublicApi(() => publicApi.facets("events"), null),
  ])

  const hrefFor = (next: { period?: Period; category?: string | null; page?: number }) => {
    const query = new URLSearchParams()
    const nextPeriod = next.period ?? period
    if (nextPeriod !== "upcoming") query.set("period", nextPeriod)
    const nextCategory = next.category === null ? undefined : (next.category ?? category)
    if (nextCategory) query.set("category", nextCategory)
    if (next.page && next.page > 1) query.set("page", String(next.page))
    const text = query.toString()
    return text ? `/events?${text}` : "/events"
  }
  const categories = Object.keys(facets?.facets.category ?? {}).sort((a, b) => a.localeCompare(b, "pt"))
  const counts = facets?.facets.period ?? {}
  const linkClass = (active: boolean) => `rounded-md border px-3 py-1.5 text-sm font-medium ${active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-primary/10"}`

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <CollectionHeader
          title="Eventos e actividades"
          subtitle="Conferências, workshops, seminários e actividades da Comissão Nacional de Língua Portuguesa."
          total={(facets?.total ?? events.meta.total).toLocaleString("pt-PT")}
          unit="eventos publicados"
        />
        <section className="section-paper py-8 md:py-10">
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            <nav aria-label="Período" className="flex flex-wrap gap-2">
              {periods.map((item) => (
                <Link key={item.key} href={hrefFor({ period: item.key, category: null })} aria-current={period === item.key ? "page" : undefined} className={linkClass(period === item.key)}>
                  {item.label}{counts[item.key] !== undefined ? ` (${counts[item.key]})` : ""}
                </Link>
              ))}
            </nav>
            {categories.length > 0 && (
              <nav aria-label="Categorias" className="mt-3 flex flex-wrap gap-2">
                <Link href={hrefFor({ category: null })} aria-current={!category ? "page" : undefined} className={linkClass(!category)}>Todas</Link>
                {categories.map((name) => (
                  <Link key={name} href={hrefFor({ category: name })} aria-current={category === name ? "page" : undefined} className={linkClass(category === name)}>
                    {name} ({facets?.facets.category[name]})
                  </Link>
                ))}
              </nav>
            )}

            {events.data.length > 0 ? (
              <div className="mt-8 space-y-4">
                {events.data.map((event) => <EventCard key={event.id} event={event} />)}
              </div>
            ) : (
              <p className="mt-10 rounded-md border border-dashed p-10 text-center text-muted-foreground">
                {period === "upcoming" ? "Não há eventos programados de momento." : period === "ongoing" ? "Não há eventos em curso." : "Não há eventos passados neste filtro."}
              </p>
            )}

            <ListPagination meta={events.meta} hrefFor={(next) => hrefFor({ page: next })} />
          </div>
        </section>
        <section className="section-ice border-t border-border/40 py-12">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-12">
            <NewsletterSignup />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
