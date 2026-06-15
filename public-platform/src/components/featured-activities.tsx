import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PublicEvent } from "@/lib/public-api"
import { ArrowRight, Calendar, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { RevealOnScroll } from "@/components/reveal-on-scroll"

const typeColor: Record<string, string> = {
  Conferência: "bg-blue-500",
  Workshop: "bg-cyan-500",
  Concurso: "bg-indigo-500",
  Seminário: "bg-violet-500",
}

export function FeaturedActivities({ events = [] }: { events?: PublicEvent[] }) {
  return (
    <section className="section-paper py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Agenda</p>
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight">Actividades em Destaque</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Acompanhe conferências, workshops e eventos promovidos pela Comissão.
          </p>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {events.slice(0, 3).map((event) => {
              const category = event.category || "Evento"
              const badgeBg = typeColor[category] ?? "bg-primary"
              const href = `/events/${event.slug || event.id}`
              const startDate = new Date(event.startDate)

              return (
                <RevealOnScroll
                  key={event.id}
                  className="group flex flex-col overflow-hidden rounded-lg border border-blue-100/80 bg-white/86 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg hover:shadow-blue-950/8"
                >
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {event.coverImageUrl ? (
                      <img
                        src={event.coverImageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-[linear-gradient(135deg,rgba(0,94,234,0.18),rgba(235,244,255,0.92))]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <span className={`absolute bottom-3 left-3 rounded-md px-2.5 py-1 text-xs font-semibold text-white ${badgeBg}`}>
                      {category}
                    </span>
                    {event.maxRegistrations && (
                      <Badge className="absolute right-3 top-3 rounded-md border-white/25 bg-white/20 text-white backdrop-blur-sm">
                        {event.registrationCount ?? 0}/{event.maxRegistrations}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 text-base font-bold leading-snug text-foreground">{event.title}</h3>
                    <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {event.description ?? "Descrição não disponível."}
                    </p>

                    <ul className="mb-5 space-y-1.5">
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
                      <Button variant="outline" className="group/btn w-full rounded-md bg-transparent font-semibold">
                        Ver detalhes
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </RevealOnScroll>
              )
            })}
          </div>
        ) : (
          <EmptyFeaturedState
            title="Sem eventos em destaque neste momento"
            description="Assim que houver eventos futuros aprovados, eles aparecerão aqui automaticamente."
          />
        )}

        <div className="mt-10 text-center">
          <Link href="/events">
            <Button variant="outline" size="lg" className="rounded-md bg-transparent px-8 font-semibold">
              Ver todos os eventos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function EmptyFeaturedState({ title, description }: { title: string; description: string }) {
  return (
    <RevealOnScroll className="rounded-lg border border-dashed border-primary/25 bg-white/72 p-10 text-center shadow-sm backdrop-blur">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </RevealOnScroll>
  )
}
