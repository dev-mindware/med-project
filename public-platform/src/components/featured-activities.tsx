import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PublicEvent } from "@/lib/public-api"
import { ArrowRight, Calendar, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"

const typeColor: Record<string, string> = {
  Conferência: "bg-blue-500",
  Workshop: "bg-cyan-500",
  Concurso: "bg-indigo-500",
  Seminário: "bg-violet-500",
}

export function FeaturedActivities({ events = [] }: { events?: PublicEvent[] }) {
  if (events.length === 0) {
    return null
  }

  return (
    <section className="section-paper py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Agenda</p>
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Atividades em Destaque</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Acompanhe conferências, workshops e eventos promovidos pela Comissão
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {events.slice(0, 3).map((event) => {
            const category = event.category || "Evento"
            const badgeBg = typeColor[category] ?? "bg-primary"
            const href = `/events/${event.slug || event.id}`
            const startDate = new Date(event.startDate)

            return (
              <article
                key={event.id}
                className="group rounded-lg border border-blue-100/80 bg-white/86 overflow-hidden flex flex-col shadow-sm backdrop-blur hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg hover:shadow-blue-950/8 transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden bg-muted">
                  {event.coverImageUrl ? (
                    <img
                      src={event.coverImageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full bg-[linear-gradient(135deg,rgba(0,94,234,0.18),rgba(235,244,255,0.92))]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span className={`absolute bottom-3 left-3 text-xs font-semibold text-white px-2.5 py-1 rounded-md ${badgeBg}`}>
                    {category}
                  </span>
                  {event.maxRegistrations && (
                    <Badge className="absolute top-3 right-3 bg-white/20 text-white border-white/25 backdrop-blur-sm rounded-md">
                      {event.registrationCount ?? 0}/{event.maxRegistrations}
                    </Badge>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-base mb-2 text-foreground leading-snug">{event.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">
                    {event.description ?? "Descrição não disponível."}
                  </p>

                  <ul className="space-y-1.5 mb-5">
                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      {startDate.toLocaleDateString("pt-PT")}
                    </li>
                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      {startDate.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                    </li>
                    {event.location && (
                      <li className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        {event.location}
                      </li>
                    )}
                    {event.maxRegistrations && (
                      <li className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        {event.registrationCount ?? 0}/{event.maxRegistrations} inscritos
                      </li>
                    )}
                  </ul>

                  <Link href={href}>
                    <Button variant="outline" className="w-full rounded-md font-semibold group/btn bg-transparent">
                      Ver detalhes
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/events">
            <Button variant="outline" size="lg" className="rounded-md px-8 font-semibold bg-transparent">
              Ver todos os eventos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
