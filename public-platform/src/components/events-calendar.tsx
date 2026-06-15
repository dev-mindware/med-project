"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EventRegistrationDialog } from "@/components/event-registration-dialog"
import { publicApi, type PublicEvent } from "@/lib/public-api"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"

const typeAccent: Record<string, { color: string; bg: string; line: string }> = {
  Conferência: { color: "text-blue-700", bg: "bg-blue-500/10", line: "bg-blue-500" },
  Workshop: { color: "text-cyan-700", bg: "bg-cyan-500/10", line: "bg-cyan-500" },
  Seminário: { color: "text-indigo-700", bg: "bg-indigo-500/10", line: "bg-indigo-500" },
  Concurso: { color: "text-violet-700", bg: "bg-violet-500/10", line: "bg-violet-500" },
  Colóquio: { color: "text-cyan-700", bg: "bg-cyan-500/10", line: "bg-cyan-500" },
}

const tabs = [
  { key: "upcoming", label: "Próximos" },
  { key: "ongoing", label: "Em andamento" },
  { key: "past", label: "Passados" },
] as const

export function EventsCalendar({
  initialEvents = [],
  initialPeriod = "upcoming",
}: {
  initialEvents?: PublicEvent[]
  initialPeriod?: "upcoming" | "ongoing" | "past"
}) {
  const [active, setActive] = useState<"upcoming" | "ongoing" | "past">(initialPeriod)
  const [events, setEvents] = useState<PublicEvent[]>(initialEvents)
  const [isLoading, setIsLoading] = useState(false)

  const loadEvents = async (period: "upcoming" | "ongoing" | "past") => {
    setActive(period)
    setIsLoading(true)

    try {
      const response = await publicApi.events({ period, limit: 6 })
      setEvents(response.data)
    } catch {
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mx-auto mb-10 flex w-fit items-center gap-1 rounded-lg border border-blue-100/80 bg-white/80 p-1 shadow-sm backdrop-blur">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => loadEvents(tab.key)}
            className={`rounded-md px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              active === tab.key ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} active={active} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-primary/25 bg-white/72 p-12 text-center shadow-sm backdrop-blur">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-primary/35" />
          <h3 className="mb-2 text-lg font-semibold">{isLoading ? "A carregar eventos..." : "Nenhum evento encontrado"}</h3>
          {!isLoading && (
            <p className="text-sm text-muted-foreground">
              {active === "upcoming" && "Não há eventos programados no momento."}
              {active === "ongoing" && "Não há eventos em andamento."}
              {active === "past" && "Não há eventos passados registados."}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function EventCard({ event, active }: { event: PublicEvent; active: "upcoming" | "ongoing" | "past" }) {
  const type = event.category || "Evento"
  const accent = typeAccent[type] ?? { color: "text-primary", bg: "bg-primary/10", line: "bg-primary" }
  const fillPct = event.maxRegistrations
    ? Math.round(((event.registrationCount ?? 0) / event.maxRegistrations) * 100)
    : null
  const startDate = new Date(event.startDate)
  const detailsHref = `/events/${event.slug || event.id}`

  return (
    <article className="group overflow-hidden rounded-lg border border-blue-100/80 bg-white/88 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg hover:shadow-blue-950/8">
      <div className={`h-1 w-full ${accent.line}`} />

      <div className="flex h-full flex-col p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-widest ${accent.bg} ${accent.color}`}>
            {type}
          </span>
          {active === "past" && <Badge variant="secondary" className="rounded-md text-xs">Finalizado</Badge>}
          {active === "ongoing" && <Badge className="rounded-md bg-blue-500 text-xs">Em andamento</Badge>}
        </div>

        <h3 className="mb-2 text-lg font-bold leading-snug text-foreground group-hover:text-primary">{event.title}</h3>
        <p className="mb-5 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{event.description}</p>

        <div className="mb-5 grid gap-2 text-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/65" />
              {startDate.toLocaleDateString("pt-PT")}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-primary/65" />
              {startDate.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/65" />
              <span>{event.location}</span>
            </div>
          )}
          {fillPct !== null && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0 text-primary/65" />
              <span>{event.registrationCount ?? 0}/{event.maxRegistrations} inscritos</span>
              <div className="h-1.5 max-w-[90px] flex-1 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full transition-all ${fillPct >= 90 ? "bg-cyan-500" : "bg-primary"}`} style={{ width: `${fillPct}%` }} />
              </div>
              <span className="text-xs">{fillPct}%</span>
            </div>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" className="w-full rounded-md bg-transparent font-semibold" asChild>
            <Link href={detailsHref}>Ver detalhes</Link>
          </Button>
          {active === "upcoming" && (
            <EventRegistrationDialog event={event} className="w-full rounded-md font-semibold" />
          )}
        </div>
      </div>
    </article>
  )
}
