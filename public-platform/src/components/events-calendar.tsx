"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, ExternalLink, Clock } from "lucide-react"

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  type: string
  status: "upcoming" | "ongoing" | "past"
  description: string
  capacity?: number
  registered?: number
  registrationUrl?: string
}

const events: Event[] = [
  {
    id: "1",
    title: "Conferência Internacional de Língua Portuguesa",
    date: "2024-04-15",
    time: "09:00",
    location: "Centro de Convenções de Luanda",
    type: "Conferência",
    status: "upcoming",
    description: "Encontro anual com especialistas internacionais para discutir o futuro da língua portuguesa.",
    capacity: 500,
    registered: 342,
    registrationUrl: "#",
  },
  {
    id: "2",
    title: "Workshop de Gramática para Professores",
    date: "2024-03-28",
    time: "14:00",
    location: "Universidade Agostinho Neto",
    type: "Workshop",
    status: "upcoming",
    description: "Formação prática sobre as novas diretrizes gramaticais para educadores.",
    capacity: 100,
    registered: 87,
    registrationUrl: "#",
  },
  {
    id: "3",
    title: "Seminário CPLP sobre Cooperação Linguística",
    date: "2024-02-20",
    time: "10:00",
    location: "Hotel Presidente, Luanda",
    type: "Seminário",
    status: "past",
    description: "Discussão sobre estratégias de cooperação entre países lusófonos.",
    capacity: 200,
    registered: 200,
  },
  {
    id: "4",
    title: "Concurso Nacional de Ortografia",
    date: "2024-05-10",
    time: "15:00",
    location: "Palácio da Cultura",
    type: "Concurso",
    status: "upcoming",
    description: "Final nacional do concurso de ortografia para estudantes do ensino secundário.",
    capacity: 300,
    registered: 156,
    registrationUrl: "#",
  },
]

const typeAccent: Record<string, { color: string; bg: string }> = {
  Conferência: { color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  Workshop: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  Seminário: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  Concurso: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  Colóquio: { color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10" },
}

const tabs = [
  { key: "upcoming", label: "Próximos" },
  { key: "ongoing", label: "Em Andamento" },
  { key: "past", label: "Passados" },
] as const

export function EventsCalendar() {
  const [active, setActive] = useState<"upcoming" | "ongoing" | "past">("upcoming")

  const filtered = events.filter((e) => e.status === active)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Pill tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/50 w-fit mx-auto mb-10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              active === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((event) => {
            const accent = typeAccent[event.type] ?? { color: "text-primary", bg: "bg-primary/10" }
            const fillPct = event.capacity
              ? Math.round(((event.registered ?? 0) / event.capacity) * 100)
              : null

            return (
              <div
                key={event.id}
                className="group rounded-xl border border-border bg-card hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Colored top stripe */}
                <div className={`h-1 w-full ${accent.bg} ${accent.color}`} style={{ opacity: 0.6 }} />

                <div className="p-6 flex flex-col flex-1">
                  {/* Type + status */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${accent.bg} ${accent.color}`}>
                      {event.type}
                    </span>
                    {event.status === "past" && (
                      <Badge variant="secondary" className="text-xs">Finalizado</Badge>
                    )}
                    {event.status === "ongoing" && (
                      <Badge className="text-xs bg-blue-500">Em Andamento</Badge>
                    )}
                  </div>

                  <h3 className="font-bold text-lg leading-snug mb-2 text-foreground">{event.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{event.description}</p>

                  {/* Meta */}
                  <div className="space-y-1.5 text-sm mb-5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{new Date(event.date).toLocaleDateString("pt-PT")}</span>
                      <Clock className="h-3.5 w-3.5 shrink-0 ml-1" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    {fillPct !== null && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        <span>{event.registered}/{event.capacity} inscritos</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[80px]">
                          <div
                            className={`h-full rounded-full transition-all ${fillPct >= 90 ? "bg-orange-500" : "bg-primary"}`}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                        <span className="text-xs">{fillPct}%</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  {event.registrationUrl && event.status === "upcoming" && (
                    <Button className="w-full rounded-lg font-semibold" asChild>
                      <a href={event.registrationUrl}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Inscrever-se no evento
                      </a>
                    </Button>
                  )}
                  {event.status === "past" && (
                    <Button variant="outline" className="w-full rounded-lg font-semibold bg-transparent">
                      Ver resumo do evento
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
          <p className="text-muted-foreground text-sm">
            {active === "upcoming" && "Não há eventos programados no momento."}
            {active === "ongoing" && "Não há eventos em andamento."}
            {active === "past" && "Não há eventos passados registados."}
          </p>
        </div>
      )}
    </div>
  )
}
