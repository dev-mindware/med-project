"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Clock, ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"

const articles = [
  {
    id: 1,
    title: "O Futuro da Língua Portuguesa em Angola",
    author: "Prof. Dr. Carlos Mendes",
    date: "2024-03-01",
    category: "Linguística",
    readTime: "10 min",
    excerpt:
      "Uma análise prospectiva sobre a evolução da língua portuguesa em Angola, considerando fatores demográficos, educacionais e tecnológicos.",
    color: "from-blue-600 to-blue-900",
  },
  {
    id: 2,
    title: "Metodologias Inovadoras no Ensino do Português",
    author: "Dra. Isabel Rodrigues",
    date: "2024-02-28",
    category: "Educação",
    readTime: "7 min",
    excerpt:
      "Exploração de novas abordagens pedagógicas para o ensino da língua portuguesa, incluindo o uso de tecnologias digitais.",
    color: "from-emerald-600 to-emerald-900",
  },
  {
    id: 3,
    title: "Preservação do Património Linguístico Angolano",
    author: "Prof. Manuel Santos",
    date: "2024-02-25",
    category: "Cultura",
    readTime: "12 min",
    excerpt:
      "Estratégias para a preservação e valorização das expressões linguísticas tradicionais angolanas no contexto contemporâneo.",
    color: "from-orange-600 to-orange-900",
  },
]

const categoryAccent: Record<string, { gradient: string; badge: string; dot: string }> = {
  Ortografia:   { gradient: "from-blue-500/15 to-blue-500/5",   badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",   dot: "bg-blue-500" },
  Literatura:   { gradient: "from-violet-500/15 to-violet-500/5", badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400", dot: "bg-violet-500" },
  Terminologia: { gradient: "from-emerald-500/15 to-emerald-500/5", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  Linguística:  { gradient: "from-cyan-500/15 to-cyan-500/5",   badge: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",   dot: "bg-cyan-500" },
  Educação:     { gradient: "from-indigo-500/15 to-indigo-500/5", badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", dot: "bg-indigo-500" },
  Cultura:      { gradient: "from-rose-500/15 to-rose-500/5",   badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400",   dot: "bg-rose-500" },
}

const recentArticles = [
  {
    id: 4,
    title: "Análise Comparativa dos Sistemas Ortográficos Lusófonos",
    author: "Dra. Fernanda Lima",
    date: "2024-02-20",
    category: "Ortografia",
    readTime: "9 min",
    excerpt: "Um estudo aprofundado das diferenças e semelhanças entre os sistemas ortográficos dos países lusófonos, com foco nas especificidades angolanas.",
  },
  {
    id: 5,
    title: "O Papel da Literatura na Formação Linguística",
    author: "Prof. António Neves",
    date: "2024-02-18",
    category: "Literatura",
    readTime: "11 min",
    excerpt: "Como a literatura angolana contemporânea contribui para a evolução e enriquecimento da língua portuguesa no país.",
  },
  {
    id: 6,
    title: "Terminologia Técnica em Português Angolano",
    author: "Dr. Paulo Ferreira",
    date: "2024-02-15",
    category: "Terminologia",
    readTime: "8 min",
    excerpt: "Análise dos neologismos e termos técnicos que emergem do contexto socioeconómico angolano e a sua integração na língua.",
  },
]

export function FeaturedArticles() {
  const [hero, ...rest] = articles

  return (
    <section className="py-20 bg-muted/20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 space-y-16">

        {/* Section header */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Publicações</p>
          <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Artigos em Destaque</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            As mais recentes pesquisas e reflexões sobre a língua portuguesa
          </p>
        </div>

        {/* Featured grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Hero card */}
          <Link href={`/artigos/${hero.id}`} className="lg:col-span-3 group block">
            <div className={`relative h-80 lg:h-full min-h-[340px] rounded-2xl overflow-hidden bg-gradient-to-br ${hero.color}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 p-7 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">Em Destaque</Badge>
                  <Badge variant="outline" className="border-white/30 text-white text-xs backdrop-blur-sm">
                    {hero.category}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white leading-tight group-hover:text-white/80 transition-colors">
                    {hero.title}
                  </h3>
                  <p className="text-white/75 text-sm leading-relaxed line-clamp-2">{hero.excerpt}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{hero.author}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(hero.date).toLocaleDateString("pt-PT")}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{hero.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white text-sm font-medium">
                    Ler artigo
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Side cards */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {rest.map((article) => (
              <Link href={`/artigos/${article.id}`} key={article.id} className="group block flex-1">
                <div className={`relative h-full min-h-[156px] rounded-2xl overflow-hidden bg-gradient-to-br ${article.color}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute inset-0 p-5 flex flex-col justify-between">
                    <Badge variant="outline" className="border-white/30 text-white text-xs backdrop-blur-sm w-fit">
                      {article.category}
                    </Badge>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold text-white leading-snug group-hover:text-white/80 transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs text-white/60">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/90 text-xs font-medium">
                        Ler artigo
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <h3 className="text-xl font-bold">Publicações Recentes</h3>
            </div>
            <Link href="/artigos" className="flex items-center gap-1 text-sm text-primary font-medium hover:underline underline-offset-4">
              Ver todas
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentArticles.map((article) => {
              const accent = categoryAccent[article.category] ?? {
                gradient: "from-primary/10 to-primary/5",
                badge: "bg-primary/10 text-primary",
                dot: "bg-primary",
              }
              return (
                <Link
                  key={article.id}
                  href={`/artigos/${article.id}`}
                  className="group rounded-xl border border-border bg-card hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className={`h-24 bg-gradient-to-br ${accent.gradient} flex items-end px-5 pb-4`}>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${accent.badge}`}>
                      {article.category}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h4 className="font-bold text-base leading-snug mb-2 text-foreground group-hover:text-primary transition-colors duration-200">
                      {article.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        {article.author}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
