import Link from "next/link"
import { CalendarPlus, MapPin, Users } from "lucide-react"
import { formatDate, formatTime } from "@/lib/format-date"
import type { PublicEvent } from "@/lib/public-api"

export function EventCard({ event }: { event: PublicEvent }) {
  const href = `/events/${event.slug || event.id}`
  const start = new Date(event.startDate)
  const full = Boolean(event.maxRegistrations && (event.registrationCount ?? 0) >= event.maxRegistrations)

  return (
    <article className="flex gap-4 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md sm:gap-5 sm:p-5">
      <time dateTime={event.startDate} className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-md bg-primary/10 text-primary sm:h-20 sm:w-20">
        <span className="text-2xl font-extrabold leading-none sm:text-3xl">{formatDate(start, { day: "numeric" })}</span>
        <span className="mt-1 text-xs font-semibold uppercase">{formatDate(start, { month: "short" }).replace(".", "")}</span>
      </time>
      <div className="min-w-0 flex-1">
        {event.category && <p className="text-xs font-semibold uppercase tracking-wide text-primary">{event.category}</p>}
        <h2 className="mt-0.5 text-lg font-bold leading-snug">
          <Link href={href} className="hover:text-primary">{event.title}</Link>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate(start, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {formatTime(start)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>}
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {full ? "Inscrições esgotadas" : event.maxRegistrations ? `${event.maxRegistrations - (event.registrationCount ?? 0)} vagas` : "Inscrição aberta"}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={href} className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-primary/10">Ver detalhes</Link>
          <a href={`${href}/calendar.ics`} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10">
            <CalendarPlus className="h-4 w-4" /> Adicionar ao calendário
          </a>
        </div>
      </div>
    </article>
  )
}
