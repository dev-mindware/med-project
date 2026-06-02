import { ArrowRight, Book, BookOpen, Calendar, Globe, Library, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PublicStats } from "@/lib/public-api"
import Link from "next/link"
import { RevealOnScroll } from "@/components/reveal-on-scroll"

function countLabel(value: number | undefined, singular: string, plural: string) {
  if (typeof value !== "number") return "Dados em atualização"
  return `${value.toLocaleString("pt-PT")} ${value === 1 ? singular : plural}`
}

export function ServicesSection({ stats }: { stats?: PublicStats | null }) {
  const features = [
    {
      icon: Book,
      title: "Dicionário",
      description: "Consulte a língua portuguesa no contexto angolano com definições, etimologias e exemplos publicados.",
      bullets: [
        countLabel(stats?.dictionaryEntries, "entrada lexical", "entradas lexicais"),
        "Etimologias e variantes quando disponíveis",
        "Exemplos em contexto aprovados",
      ],
      href: "/dictionary",
      accent: "bg-primary/10 text-primary",
    },
    {
      icon: Globe,
      title: "Topónimos",
      description: "Consulte nomes de lugares de Angola, províncias, municípios, gentílicos e história toponímica.",
      bullets: [
        countLabel(stats?.toponyms, "topónimo publicado", "topónimos publicados"),
        "Filtro por província",
        "Geografia linguística",
      ],
      href: "/toponimos",
      accent: "bg-cyan-500/10 text-cyan-600",
    },
    {
      icon: Users,
      title: "Antropónimos",
      description: "Explore nomes próprios angolanos, sobrenomes, género, etimologia e figuras históricas identificadas.",
      bullets: [
        countLabel(stats?.anthroponyms, "antropónimo publicado", "antropónimos publicados"),
        "Nomes e identidade",
        "Etimologia e significado",
      ],
      href: "/antroponimos",
      accent: "bg-blue-500/10 text-blue-700",
    },
    {
      icon: Library,
      title: "VONALP & VONALP EP",
      description: "Vocabulário Ortográfico Nacional de Angola para a Língua Portuguesa e versão para o Ensino Primário.",
      bullets: [
        countLabel((stats?.vonalpTerms ?? 0) + (stats?.vonalpEpTerms ?? 0), "termo completo", "termos completos"),
        "Norma nacional unificada",
        "Pesquisa integrada",
      ],
      href: "/vonalp",
      accent: "bg-indigo-500/10 text-indigo-700",
    },
    {
      icon: BookOpen,
      title: "Artigos & Pesquisas",
      description: "Leia artigos de reflexão e publicações produzidas ou aprovadas pela Comissão Nacional.",
      bullets: [
        countLabel(stats?.publishedArticles, "artigo publicado", "artigos publicados"),
        "Conteúdos institucionais",
        "Acesso livre",
      ],
      href: "/articles",
      accent: "bg-sky-500/10 text-sky-700",
    },
    {
      icon: Calendar,
      title: "Eventos",
      description: "Acompanhe conferências, seminários, workshops e atividades oficiais publicadas.",
      bullets: [
        countLabel(stats?.publishedEvents, "evento publicado", "eventos publicados"),
        countLabel(stats?.upcomingEvents, "evento futuro", "eventos futuros"),
        "Inscrições quando disponíveis",
      ],
      href: "/events",
      accent: "bg-violet-500/10 text-violet-700",
    },
  ]

  return (
    <section className="section-soft overflow-hidden py-20">
      <div className="pointer-events-none absolute right-10 top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mx-auto mb-14 max-w-2xl text-center animate-slide-up">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Recursos disponíveis</p>
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight">O que encontra aqui</h2>
          <p className="text-lg text-muted-foreground">
            Ferramentas e conteúdos reais para o estudo, ensino e valorização da língua portuguesa em Angola.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, index) => {
            const Icon = f.icon
            return (
              <RevealOnScroll
                key={f.title}
                delay={index * 80}
                className="group flex flex-col overflow-hidden rounded-lg border border-blue-100/80 bg-white/82 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg hover:shadow-blue-950/8"
              >
                <div className="flex flex-1 flex-col p-6">
                  <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-md ${f.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{f.description}</p>

                  <ul className="mb-6 flex-1 space-y-2">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-sm text-foreground/70">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-primary/45" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <Link href={f.href}>
                    <Button variant="outline" className="w-full rounded-md bg-transparent font-semibold group/btn hover:border-primary/50 hover:bg-primary/5 hover:text-primary">
                      Ver {f.title}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </RevealOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
