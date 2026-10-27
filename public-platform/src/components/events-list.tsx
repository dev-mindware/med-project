import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PublicEvent } from "@/lib/public-api"
import { ArrowRight, Calendar, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"

export function EventsList({ events = [] }: { events?: PublicEvent[] }) {
  if (events.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Calendário</p>
        <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Próximos Eventos</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Não perca as próximas atividades da nossa comissão
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-blue-100/80 bg-white/84 shadow-sm backdrop-blur">
        <div className="divide-y divide-blue-100/70">
          {events.slice(0, 3).map((event, index) => {
            const startDate = new Date(event.startDate)
            const href = `/events/${event.slug || event.id}`

            return (
              <Link
                key={event.id}
                href={href}
                className="group flex items-start gap-5 px-6 py-5 transition-colors duration-150 hover:bg-primary/5"
              >
                <span className="w-8 shrink-0 pt-0.5 text-2xl font-extrabold leading-none text-primary/18 tabular-nums transition-colors group-hover:text-primary/35">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    {event.category && <Badge variant="secondary" className="rounded-md text-xs">{event.category}</Badge>}
                  </div>
                  <h4 className="mb-2 text-base font-semibold leading-snug transition-colors duration-200 group-hover:text-primary">
                    {event.title}
                  </h4>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-primary/65" />
                      {startDate.toLocaleDateString("pt-PT")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-primary/65" />
                      {startDate.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-primary/65" />
                        {event.location}
                      </span>
                    )}
                    {event.maxRegistrations && (
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-primary/65" />
                        {event.registrationCount ?? 0}/{event.maxRegistrations} inscritos
                      </span>
                    )}
                  </div>
                </div>

                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/30 transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            )
          })}
        </div>
      </div>

      <div className="text-center">
        <Link href="/events">
          <Button variant="outline" size="lg" className="rounded-md px-8 font-semibold bg-transparent">
            Ver todos os eventos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
