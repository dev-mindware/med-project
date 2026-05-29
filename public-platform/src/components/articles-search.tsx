"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, BookOpen, Calendar, User, ExternalLink, Clock } from "lucide-react"

interface Article {
  title: string
  author: string
  date: string
  category: string
  abstract: string
  tags: string[]
  readTime: string
  downloadUrl?: string
}

export function ArticlesSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchResults, setSearchResults] = useState<Article[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const mockArticles: Article[] = [
    {
      title: "Variações Linguísticas do Português Angolano: Um Estudo Sociolinguístico",
      author: "Prof. Dr. João Silva",
      date: "2024-02-15",
      category: "Linguística",
      abstract:
        "Este estudo analisa as principais variações linguísticas do português falado em Angola, considerando fatores sociais, geográficos e culturais que influenciam a evolução da língua.",
      tags: ["sociolinguística", "variações", "português angolano"],
      readTime: "12 min",
      downloadUrl: "#",
    },
    {
      title: "O Ensino da Gramática no Contexto Angolano: Desafios e Oportunidades",
      author: "Dra. Maria Santos",
      date: "2024-01-20",
      category: "Educação",
      abstract:
        "Análise dos métodos de ensino da gramática portuguesa nas escolas angolanas, identificando desafios e propondo estratégias pedagógicas adaptadas ao contexto local.",
      tags: ["educação", "gramática", "pedagogia"],
      readTime: "8 min",
      downloadUrl: "#",
    },
    {
      title: "Lexicografia Angolana: Construindo um Dicionário Nacional",
      author: "Prof. Ana Costa",
      date: "2023-12-10",
      category: "Lexicografia",
      abstract:
        "Reflexões sobre o processo de construção de um dicionário que reflita as especificidades lexicais do português angolano, incluindo metodologias e desafios enfrentados.",
      tags: ["lexicografia", "dicionário", "terminologia"],
      readTime: "15 min",
      downloadUrl: "#",
    },
  ]

  const categories = ["Todas", "Linguística", "Educação", "Lexicografia", "Literatura", "História", "Cultura"]

  const handleSearch = () => {
    setIsSearching(true)
    setTimeout(() => {
      let filtered = mockArticles
      if (searchTerm.trim())
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.author.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      if (selectedCategory && selectedCategory !== "Todas")
        filtered = filtered.filter((a) => a.category === selectedCategory)
      setSearchResults(filtered)
      setIsSearching(false)
    }, 500)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-border bg-background p-2">
        <div className="flex items-center gap-2 flex-1 px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Pesquisar artigos, autores ou temas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="rounded-xl h-11 px-6 font-semibold shrink-0"
          >
            {isSearching ? "A pesquisar..." : "Pesquisar"}
          </Button>
        </div>
      </div>

      {/* Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{searchResults.length}</span> artigo{searchResults.length !== 1 ? "s" : ""} encontrado{searchResults.length !== 1 ? "s" : ""}
          </p>
          {searchResults.map((article, i) => <ArticleCard key={i} article={article} />)}
        </div>
      )}

      {/* No results */}
      {(searchTerm || selectedCategory) && searchResults.length === 0 && !isSearching && (
        <div className="rounded-2xl border border-border bg-background p-10 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Nenhum artigo encontrado</h3>
          <p className="text-sm text-muted-foreground">Tente pesquisar com termos diferentes ou explore as categorias em destaque.</p>
        </div>
      )}
    </div>
  )
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 hover:border-border/80 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full shrink-0 self-start">
          {article.category}
        </span>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{article.abstract}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {article.tags.map((tag, i) => (
          <span key={i} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">#{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(article.date).toLocaleDateString("pt-PT")}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs px-3">Ler artigo</Button>
          {article.downloadUrl && (
            <Button variant="ghost" size="sm" className="rounded-lg h-8 text-xs px-3 text-muted-foreground" asChild>
              <a href={article.downloadUrl}><ExternalLink className="h-3 w-3" /></a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
