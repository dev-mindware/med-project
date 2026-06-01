import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PublicBlogPost } from "@/lib/public-api"
import { ArrowRight, BookOpen, FileText } from "lucide-react"
import Link from "next/link"

type CategorySummary = {
  name: string
  count: number
  recent: string[]
}

export function ArticleCategories({ articles = [] }: { articles?: PublicBlogPost[] }) {
  const categories = buildCategories(articles)

  if (categories.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Categorias de Artigos</h2>
        <p className="text-muted-foreground">Categorias calculadas a partir das publicações retornadas pela API.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.name} className="group hover:-translate-y-0.5 transition-all duration-200">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {category.count} artigo{category.count === 1 ? "" : "s"}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Publicações classificadas como {category.name}.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Publicações recentes:</h4>
                <ul className="space-y-1">
                  {category.recent.map((title) => (
                    <li key={title} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span className="line-clamp-1">{title}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant="outline"
                className="w-full bg-transparent group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                asChild
              >
                <Link href={`/articles?category=${encodeURIComponent(category.name)}`}>
                  Explorar artigos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function buildCategories(articles: PublicBlogPost[]): CategorySummary[] {
  const grouped = new Map<string, PublicBlogPost[]>()

  articles.forEach((article) => {
    const category = article.category?.trim()
    if (!category) return
    grouped.set(category, [...(grouped.get(category) ?? []), article])
  })

  return Array.from(grouped.entries())
    .map(([name, items]) => ({
      name,
      count: items.length,
      recent: items.slice(0, 3).map((item) => item.title),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
