"use client"

import { Book, FileText, Globe, Calendar, Camera, BookOpen, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const features = [
  {
    icon: Book,
    title: "Dicionário",
    description: "Consulte a língua portuguesa no contexto angolano — definições, etimologias e exemplos reais.",
    bullets: ["15 000+ entradas lexicais", "Etimologias e variantes", "Exemplos em contexto real"],
    href: "/dictionary",
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    icon: FileText,
    title: "Gramática",
    description: "Regras gramaticais explicadas de forma clara e didática para todos os níveis de ensino.",
    bullets: ["Morfologia e sintaxe", "Ortografia atualizada", "Exercícios e exemplos"],
    href: "/grammar",
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Globe,
    title: "VONA",
    description: "Vocabulário Ortográfico Nacional de Angola com termos e expressões específicos do país.",
    bullets: ["8 900+ termos nacionais", "Terminologia técnica", "Expressões angolanas"],
    href: "/vona",
    accent: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  {
    icon: BookOpen,
    title: "Documentos",
    description: "Manuais, brochuras e materiais educativos elaborados pela Comissão.",
    bullets: ["500+ documentos disponíveis", "Download gratuito", "Materiais pedagógicos"],
    href: "/documents",
    accent: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    icon: Camera,
    title: "Multimídia",
    description: "Galeria de fotos e vídeos que documentam as atividades e eventos da Comissão.",
    bullets: ["Conferências e workshops", "Vídeos e documentários", "Arquivo fotográfico"],
    href: "/media",
    accent: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  {
    icon: Calendar,
    title: "Eventos",
    description: "Acompanhe conferências, seminários e actividades da Comissão ao longo do ano.",
    bullets: ["45+ eventos por ano", "Inscrições online", "Agenda atualizada"],
    href: "/events",
    accent: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
]

export function ServicesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Recursos disponíveis</p>
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">O que encontra aqui</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ferramentas e conteúdos para o estudo, ensino e valorização da língua portuguesa
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="p-6 flex flex-col flex-1">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg ${f.accent} flex items-center justify-center mb-5`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg mb-2 text-foreground">{f.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{f.description}</p>

                  {/* Bullets */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-sm text-foreground/70">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link href={f.href}>
                    <Button variant="outline" className="w-full rounded-lg font-semibold group/btn bg-transparent">
                      Ver {f.title}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
