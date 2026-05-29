import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

const upcomingEvents = [
  {
    title: "Mesa Redonda: Variações Linguísticas",
    date: "2024-04-05",
    time: "16:00",
    location: "Instituto Superior de Ciências da Educação",
    type: "Mesa Redonda",
    speakers: ["Prof. Dr. João Silva", "Dra. Maria Santos", "Prof. Ana Costa"],
  },
  {
    title: "Lançamento do Manual de Redação Oficial",
    date: "2024-04-12",
    time: "18:00",
    location: "Biblioteca Nacional de Angola",
    type: "Lançamento",
    speakers: ["Comissão Editorial", "Ministro da Educação"],
  },
  {
    title: "Curso de Formação em Lexicografia",
    date: "2024-04-20",
    time: "09:00",
    location: "Centro de Formação Pedagógica",
    type: "Curso",
    speakers: ["Prof. Dr. Carlos Mendes", "Equipa de Lexicógrafos"],
  },
]

export function EventsList() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Calendário</p>
        <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Próximos Eventos</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Não perca as próximas actividades da nossa comissão
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="divide-y divide-border/50">
          {upcomingEvents.map((event, index) => (
            <div
              key={index}
              className="group flex items-start gap-5 px-6 py-5 hover:bg-muted/30 transition-colors duration-150"
            >
              {/* Number */}
              <span className="shrink-0 text-2xl font-extrabold text-muted-foreground/20 leading-none w-8 pt-0.5 group-hover:text-primary/30 transition-colors tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="secondary" className="text-xs rounded-md">{event.type}</Badge>
                </div>
                <h4 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors duration-200 mb-2">
                  {event.title}
                </h4>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(event.date).toLocaleDateString("pt-PT")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    {event.speakers.join(", ")}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="/events">
          <Button variant="outline" size="lg" className="rounded-full px-8 font-semibold bg-transparent">
            Ver todos os eventos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
