import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PublicEntry } from "@/lib/public-api"
import { getGrammaticalCategoryLabel } from "@/lib/grammatical-labels"
import { BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

export function FeaturedWords({ entries = [] }: { entries?: PublicEntry[] }) {
  const words = entries
    .filter((entry) => entry.entry && (entry.firstDefinition || entry.secondDefinition || entry.thirdDefinition))
    .slice(0, 6)

  if (words.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-primary/25 bg-white/70 p-8 text-center">
        <BookOpen className="mx-auto mb-3 h-8 w-8 text-primary/55" />
        <h2 className="text-2xl font-extrabold">Sem palavras em destaque</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Esta área só mostra entradas reais aprovadas para consulta pública.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 text-center md:flex-row md:items-end md:justify-between md:text-left">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Dicionário</p>
          <h2 className="text-3xl font-extrabold">Entradas publicadas</h2>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Uma seleção direta das entradas aprovadas disponíveis nesta página.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {words.map((word, index) => (
          <article
            key={word.id}
            className="group rounded-lg border border-blue-100/80 bg-white/82 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg hover:shadow-blue-950/8"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Entrada</p>
                <h3 className="mt-1 text-2xl font-extrabold text-primary">{word.entry}</h3>
              </div>
              {word.grammaticalCategory && (
                <Badge variant="outline" className="rounded-md">
                  {getGrammaticalCategoryLabel(word.grammaticalCategory)}
                </Badge>
              )}
            </div>
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {word.firstDefinition || word.secondDefinition || word.thirdDefinition}
            </p>
          </article>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" className="rounded-md bg-transparent font-semibold" asChild>
          <Link href="/dictionary">
            Ver dicionário completo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
