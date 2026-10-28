import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import type { ComponentType } from "react"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { EventRegistrationForm } from "@/components/event-registration-form"
import { ArrowLeft, Calendar, CalendarPlus, Clock, MapPin, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatDate as formatDay, formatTime as formatHour } from "@/lib/format-date"
import { SITE_URL } from "@/lib/entry-slug"
import { publicApi, safePublicApi } from "@/lib/public-api"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const event = await safePublicApi(() => publicApi.eventDetails(id), null)
  if (!event) return { title: "Evento não encontrado", robots: { index: false } }
  const description = [formatDay(event.startDate), event.location, event.description].filter(Boolean).join(" · ").slice(0, 200)
  return {
    title: event.title,
    description,
    alternates: { canonical: `${SITE_URL}/events/${event.slug || event.id}` },
    openGraph: { title: event.title, description, type: "article", locale: "pt_AO", ...(event.coverImageUrl ? { images: [event.coverImageUrl] } : {}) },
  }
}

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let event

  try {
    event = await publicApi.eventDetails(id)
  } catch {
    notFound()
  }

  const startDate = new Date(event.startDate)
  const endDate = event.endDate ? new Date(event.endDate) : null
  const full = Boolean(event.maxRegistrations && (event.registrationCount ?? 0) >= event.maxRegistrations)
  const finished = (endDate ?? startDate).getTime() < Date.now()
  const calendarHref = `/events/${event.slug || event.id}/calendar.ics`
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.startDate,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    ...(event.description ? { description: event.description } : {}),
    ...(event.location ? { location: { "@type": "Place", name: event.location } } : {}),
    ...(event.coverImageUrl ? { image: event.coverImageUrl } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: { "@type": "Organization", name: "Comissão Nacional de Língua Portuguesa de Angola", url: SITE_URL },
  }

  return (
    <div className="min-h-screen bg-background pt-[4.75rem]">
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <section className="relative overflow-hidden border-b border-border bg-slate-950 text-white">
          {event.coverImageUrl && (
            <img src={event.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-42" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,18,43,0.92),rgba(0,94,234,0.48),rgba(4,18,43,0.78))]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_45%_20%,rgba(255,255,255,0.18),transparent_70%)]" />

          <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
            <Link href="/events" className="inline-flex items-center gap-2 text-sm text-white/72 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Voltar aos eventos
            </Link>

            <div className="mt-10 max-w-4xl">
              <div className="flex flex-wrap gap-2">
                {event.category && <Badge className="rounded-md bg-white/18 text-white backdrop-blur">{event.category}</Badge>}
                {event.publishedAt && <Badge variant="outline" className="rounded-md border-white/25 text-white">Publicado em {formatDate(event.publishedAt)}</Badge>}
              </div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-6xl">{event.title}</h1>
              {event.description && (
                <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/76">{event.description}</p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                {!finished && !full && (
                  <Button size="lg" className="rounded-md bg-white text-primary hover:bg-blue-50" asChild>
                    <a href="#inscricao">Inscrever-se</a>
                  </Button>
                )}
                <Button size="lg" variant="outline" className="rounded-md border-white/30 bg-white/10 text-white hover:bg-white hover:text-primary" asChild>
                  <a href={calendarHref}><CalendarPlus className="mr-2 h-4 w-4" />Adicionar ao calendário</a>
                </Button>
                <Button size="lg" variant="outline" className="rounded-md border-white/30 bg-white/10 text-white hover:bg-white hover:text-primary" asChild>
                  <Link href="/events">Ver agenda</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="section-paper">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-12">
            <article className="space-y-8">
              <div className="rounded-lg border border-blue-100/80 bg-white/84 p-6 shadow-sm backdrop-blur">
                <h2 className="text-2xl font-bold">Descrição</h2>
                <p className="mt-3 whitespace-pre-line text-base leading-8 text-muted-foreground">
                  {event.description ?? "Descrição não disponível."}
                </p>
              </div>

              {event.coverImageUrl && (
                <img src={event.coverImageUrl} alt={event.title} className="aspect-video w-full rounded-lg object-cover" />
              )}

              <div id="inscricao" className="scroll-mt-28 rounded-lg border border-blue-100/80 bg-white/84 p-6 shadow-sm backdrop-blur">
                <h2 className="text-2xl font-bold">Inscrição</h2>
                {finished ? (
                  <p className="mt-3 text-muted-foreground">Este evento já terminou.</p>
                ) : full ? (
                  <p className="mt-3 text-muted-foreground">As inscrições para este evento estão esgotadas.</p>
                ) : (
                  <div className="mt-4">
                    <EventRegistrationForm event={event} />
                  </div>
                )}
              </div>
            </article>

            <div className="h-fit rounded-lg border border-blue-100/80 bg-white/88 p-5 shadow-sm backdrop-blur">
              <h2 className="text-lg font-bold">Dados do evento</h2>
              <Separator className="my-4" />
              <dl className="space-y-4 text-sm">
                <Detail icon={Calendar} label="Início" value={`${formatDate(event.startDate)} às ${formatTime(startDate)}`} />
                {endDate && <Detail icon={Clock} label="Fim" value={`${formatDate(event.endDate!)} às ${formatTime(endDate)}`} />}
                {event.location && <Detail icon={MapPin} label="Local" value={event.location} />}
                <Detail icon={Users} label="Inscrições" value={`${event.registrationCount ?? 0}${event.maxRegistrations ? `/${event.maxRegistrations}` : ""}`} />
                {event.category && <Detail label="Categoria" value={event.category} />}
                {event.publishedAt && <Detail label="Publicado em" value={formatDateTime(event.publishedAt)} />}
              </dl>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon?: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        {label}
      </dt>
      <dd className="mt-1 break-words text-foreground">{value}</dd>
    </div>
  )
}

function formatDate(value: string) {
  return formatDay(value)
}

function formatTime(value: Date) {
  return formatHour(value)
}

function formatDateTime(value: string) {
  return `${formatDate(value)} às ${formatTime(new Date(value))}`
}
