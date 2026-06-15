"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { publicApi, type PublicBlogPost } from "@/lib/public-api"
import { getPostTypeLabel } from "@/lib/display-labels"
import { BookOpen, Calendar, Clock, Search, User } from "lucide-react"
import Link from "next/link"

export function ArticlesSearch({
  initialResults = [],
  initialQuery = "",
  initialCategory = "",
}: {
  initialResults?: PublicBlogPost[]
  initialQuery?: string
  initialCategory?: string
}) {
  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [searchResults, setSearchResults] = useState<PublicBlogPost[]>(initialResults)
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(initialResults.length > 0)
  const didMount = useRef(false)

  const categories = ["Todas", ...Array.from(new Set(initialResults.map((article) => article.category).filter(Boolean) as string[]))]

  const handleSearch = useCallback(async () => {
    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await publicApi.blogPosts({
        q: searchTerm,
        category: selectedCategory === "Todas" ? undefined : selectedCategory,
        limit: 6,
      })
      setSearchResults(response.data)
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [searchTerm, selectedCategory])

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }

    const timeout = window.setTimeout(() => {
      void handleSearch()
    }, 320)

    return () => window.clearTimeout(timeout)
  }, [handleSearch])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-border bg-background p-2">
        <div className="flex items-center gap-2 flex-1 px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Pesquisar artigos, autores ou temas..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-11 px-0 text-base"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block h-6 w-px bg-border" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px] border-0 shadow-none bg-transparent focus:ring-0 h-11 text-sm">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {isSearching && <p className="px-2 text-xs font-medium text-muted-foreground">A actualizar artigos...</p>}

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{searchResults.length}</span> artigo
            {searchResults.length !== 1 ? "s" : ""}
          </p>
          {searchResults.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {hasSearched && searchResults.length === 0 && !isSearching && (
        <div className="rounded-2xl border border-border bg-background p-10 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Nenhum artigo encontrado</h3>
          <p className="text-sm text-muted-foreground">Tente pesquisar com vocábulos diferentes ou explore as categorias em destaque.</p>
        </div>
      )}
    </div>
  )
}

function ArticleCard({ article }: { article: PublicBlogPost }) {
  const href = `/articles/${article.slug || article.id}`
  const publishedDate = article.publishedAt || article.createdAt

  return (
    <div className="group rounded-xl border border-border bg-card p-5 hover:border-border/80 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        {article.category && (
          <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full shrink-0 self-start">
            {article.category}
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{article.excerpt ?? "Sem resumo disponível."}</p>

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {article.tags.map((tag) => (
            <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {article.author?.name && <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author.name}</span>}
          {publishedDate && (
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(publishedDate).toLocaleDateString("pt-PT")}</span>
          )}
          {article.type && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{getPostTypeLabel(article.type)}</span>}
          {article.isFeatured && <Badge variant="secondary" className="h-5 text-[10px]">Destaque</Badge>}
        </div>
        <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs px-3" asChild>
          <Link href={href}>Ler artigo</Link>
        </Button>
      </div>
    </div>
  )
}
