import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PublicBlogPost } from "@/lib/public-api"
import { getPostTypeLabel } from "@/lib/display-labels"
import { ArrowRight, Calendar, Clock, User } from "lucide-react"
import Link from "next/link"

const categoryAccent: Record<string, { gradient: string; badge: string }> = {
  Ortografia: { gradient: "from-blue-500/15 to-blue-500/5", badge: "bg-blue-500/10 text-blue-700" },
  Literatura: { gradient: "from-indigo-500/15 to-indigo-500/5", badge: "bg-indigo-500/10 text-indigo-700" },
  Terminologia: { gradient: "from-cyan-500/15 to-cyan-500/5", badge: "bg-cyan-500/10 text-cyan-700" },
  Linguística: { gradient: "from-blue-500/15 to-cyan-500/5", badge: "bg-primary/10 text-primary" },
  Educação: { gradient: "from-violet-500/15 to-blue-500/5", badge: "bg-violet-500/10 text-violet-700" },
  Cultura: { gradient: "from-sky-500/15 to-blue-500/5", badge: "bg-blue-500/10 text-blue-700" },
}

export function FeaturedArticles({ articles = [] }: { articles?: PublicBlogPost[] }) {
  if (articles.length === 0) {
    return null
  }

  const [hero, ...rest] = articles
  const sideArticles = rest.slice(0, 2)
  const recentArticles = rest.slice(2, 5)

  return (
    <section className="section-ice py-20">
      <div className="mx-auto max-w-7xl space-y-16 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Publicações</p>
          <h2 className="mb-3 text-4xl font-extrabold tracking-tight">Artigos em Destaque</h2>
          <p className="text-lg text-muted-foreground">
            As mais recentes pesquisas e reflexões sobre a língua portuguesa.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Link href={articleHref(hero)} className="group block lg:col-span-3">
            <div className="relative h-80 min-h-[340px] overflow-hidden rounded-lg bg-gradient-to-br from-primary to-slate-950 lg:h-full">
              {hero.coverImageUrl && (
                <img src={hero.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/25 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-between p-7">
                <div className="flex items-center gap-2">
                  <Badge className="border-white/30 bg-white/20 text-xs text-white backdrop-blur-sm">Em Destaque</Badge>
                  {hero.category && (
                    <Badge variant="outline" className="border-white/30 text-xs text-white backdrop-blur-sm">
                      {hero.category}
                    </Badge>
                  )}
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold leading-tight text-white transition-colors group-hover:text-white/82">
                    {hero.title}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-white/75">{hero.excerpt}</p>
                  <ArticleMeta article={hero} tone="light" />
                  <div className="flex items-center gap-1 text-sm font-semibold text-white">
                    Ler artigo
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <div className="flex flex-col gap-5 lg:col-span-2">
            {sideArticles.map((article) => (
              <Link href={articleHref(article)} key={article.id} className="group block flex-1">
                <div className="relative h-full min-h-[156px] overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 to-slate-950">
                  {article.coverImageUrl && (
                    <img src={article.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-between p-5">
                    {article.category && (
                      <Badge variant="outline" className="w-fit border-white/30 text-xs text-white backdrop-blur-sm">
                        {article.category}
                      </Badge>
                    )}
                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold leading-snug text-white transition-colors group-hover:text-white/82">
                        {article.title}
                      </h3>
                      <ArticleMeta article={article} tone="light" compact />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {recentArticles.length > 0 && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">Publicações Recentes</h3>
              <Link href="/articles" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-4">
                Ver todas
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {recentArticles.map((article) => {
                const accent = categoryAccent[article.category ?? ""] ?? {
                  gradient: "from-primary/10 to-primary/5",
                  badge: "bg-primary/10 text-primary",
                }

                return (
                  <Link
                    key={article.id}
                    href={articleHref(article)}
                    className="group flex flex-col overflow-hidden rounded-lg border border-blue-100/80 bg-white/86 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg"
                  >
                    <div className={`flex h-24 items-end bg-gradient-to-br ${accent.gradient} px-5 pb-4`}>
                      {article.category && (
                        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${accent.badge}`}>
                          {article.category}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h4 className="mb-2 text-base font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
                        {article.title}
                      </h4>
                      <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {article.excerpt}
                      </p>
                      <ArticleMeta article={article} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <div className="text-center">
          <Button variant="outline" className="rounded-md bg-transparent" asChild>
            <Link href="/articles">
              Ver publicações
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function articleHref(article: PublicBlogPost) {
  return `/articles/${article.slug || article.id}`
}

function ArticleMeta({
  article,
  tone = "default",
  compact = false,
}: {
  article: PublicBlogPost
  tone?: "default" | "light"
  compact?: boolean
}) {
  const textClass = tone === "light" ? "text-white/60" : "text-muted-foreground"
  const date = article.publishedAt || article.createdAt

  return (
    <div className={`flex flex-wrap gap-3 text-xs ${textClass}`}>
      {article.author?.name && (
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {article.author.name}
        </span>
      )}
      {!compact && date && (
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(date).toLocaleDateString("pt-PT")}
        </span>
      )}
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {getPostTypeLabel(article.type) || "Publicação"}
      </span>
    </div>
  )
}
