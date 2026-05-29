"use client"

import { Calendar, MapPin, Users, ArrowRight, Mic2, BookOpen, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const activities = [
  {
    id: 1,
    type: "Conferência",
    icon: Mic2,
    title: "Conferência Internacional de Língua Portuguesa",
    date: "15 de Março, 2024",
    location: "Centro de Convenções, Luanda",
    participants: "200+ participantes",
    description: "Encontro anual com especialistas internacionais para discutir o futuro da língua portuguesa em África.",
    image: "/conference-hall-gathering.png",
    href: "/events",
  },
  {
    id: 2,
    type: "Workshop",
    icon: BookOpen,
    title: "Workshop de Gramática para Professores",
    date: "22 de Março, 2024",
    location: "Universidade Agostinho Neto",
    participants: "50+ participantes",
    description: "Formação prática sobre as novas diretrizes gramaticais para educadores do ensino básico e secundário.",
    image: "/grammar-workshop-session.png",
    href: "/events",
  },
  {
    id: 3,
    type: "Concurso",
    icon: Trophy,
    title: "Concurso Nacional de Ortografia",
    date: "5 de Abril, 2024",
    location: "Palácio da Cultura, Luanda",
    participants: "300+ participantes",
    description: "Final nacional do concurso de ortografia para estudantes do ensino secundário de todo o país.",
    image: "/lexicography-seminar-books.png",
    href: "/events",
  },
]

const typeColor: Record<string, string> = {
  "Conferência": "bg-blue-500",
  "Workshop": "bg-emerald-500",
  "Concurso": "bg-orange-500",
}

export function FeaturedActivities() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Agenda</p>
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Actividades em Destaque</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Acompanhe conferências, workshops e eventos promovidos pela Comissão
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activities.map((a) => {
            const Icon = a.icon
            const badgeBg = typeColor[a.type] ?? "bg-primary"
            return (
              <div
                key={a.id}
                className="group rounded-xl border border-border bg-card overflow-hidden flex flex-col hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img
                    src={a.image}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const el = e.currentTarget
                      el.style.display = "none"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  {/* Type badge over image */}
                  <span className={`absolute bottom-3 left-3 text-xs font-semibold text-white px-2.5 py-1 rounded-full ${badgeBg}`}>
                    {a.type}
                  </span>
                  {/* Icon */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-base mb-2 text-foreground leading-snug">{a.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{a.description}</p>

                  {/* Meta */}
                  <ul className="space-y-1.5 mb-5">
                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      {a.date}
                    </li>
                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      {a.location}
                    </li>
                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      {a.participants}
                    </li>
                  </ul>

                  <Link href={a.href}>
                    <Button variant="outline" className="w-full rounded-lg font-semibold group/btn bg-transparent">
                      Ver Detalhes
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/events">
            <Button variant="outline" size="lg" className="rounded-full px-8 font-semibold bg-transparent">
              Ver todos os eventos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
