"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, FileText, Calendar } from "lucide-react"

interface Document {
  title: string
  category: string
  type: string
  size: string
  date: string
  description: string
  downloadUrl: string
  language?: string
}

export function DocumentsSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [searchResults, setSearchResults] = useState<Document[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const mockDocuments: Document[] = [
    {
      title: "Manual de Ortografia da Língua Portuguesa",
      category: "Manuais Escolares",
      type: "PDF",
      size: "2.5 MB",
      date: "2024-01-15",
      description: "Guia completo das regras ortográficas segundo o Acordo Ortográfico",
      downloadUrl: "#",
      language: "Português",
    },
    {
      title: "Brochura CPLP - Cooperação Linguística",
      category: "CPLP",
      type: "PDF",
      size: "1.8 MB",
      date: "2023-11-20",
      description: "Documento sobre cooperação linguística entre países da CPLP",
      downloadUrl: "#",
      language: "Português",
    },
    {
      title: "Relatório Anual de Atividades 2023",
      category: "Relatórios",
      type: "PDF",
      size: "4.2 MB",
      date: "2024-02-10",
      description: "Relatório das atividades desenvolvidas pela comissão em 2023",
      downloadUrl: "#",
      language: "Português",
    },
    {
      title: "Gramática Prática do Português Angolano",
      category: "Manuais Escolares",
      type: "PDF",
      size: "3.1 MB",
      date: "2023-09-05",
      description: "Manual prático de gramática adaptado ao contexto angolano",
      downloadUrl: "#",
      language: "Português",
    },
  ]

  const categories = ["Todas", "Manuais Escolares", "CPLP", "Relatórios", "Legislação", "Pesquisas"]
  const types = ["Todos", "PDF", "DOC", "PPT", "XLS"]

  const handleSearch = () => {
    setIsSearching(true)
    setTimeout(() => {
      let filtered = mockDocuments
      if (searchTerm.trim())
        filtered = filtered.filter(
          (d) =>
            d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.description.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      if (selectedCategory && selectedCategory !== "Todas")
        filtered = filtered.filter((d) => d.category === selectedCategory)
      if (selectedType && selectedType !== "Todos")
        filtered = filtered.filter((d) => d.type === selectedType)
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
            placeholder="Pesquisar documentos..."
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
          <div className="hidden sm:block h-6 w-px bg-border" />
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[100px] border-0 shadow-none bg-transparent focus:ring-0 h-11 text-sm">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
            <span className="font-semibold text-foreground">{searchResults.length}</span> documento{searchResults.length !== 1 ? "s" : ""} encontrado{searchResults.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {searchResults.map((doc, i) => <DocumentCard key={i} document={doc} />)}
          </div>
        </div>
      )}

      {/* No results */}
      {(searchTerm || selectedCategory || selectedType) && searchResults.length === 0 && !isSearching && (
        <div className="rounded-2xl border border-border bg-background p-10 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Nenhum documento encontrado</h3>
          <p className="text-sm text-muted-foreground">Tente pesquisar com termos diferentes ou explore as categorias abaixo.</p>
        </div>
      )}
    </div>
  )
}

const typeColor: Record<string, string> = {
  PDF: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
  DOC: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  PPT: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  XLS: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
}

function DocumentCard({ document }: { document: Document }) {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 hover:border-border/80 hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3">
      <div>
        <h3 className="font-semibold text-base leading-snug mb-2 group-hover:text-primary transition-colors">
          {document.title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">{document.category}</Badge>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColor[document.type] ?? "bg-muted text-muted-foreground"}`}>
            {document.type}
          </span>
          {document.language && <Badge variant="outline" className="text-xs">{document.language}</Badge>}
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{document.description}</p>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(document.date).toLocaleDateString("pt-PT")}
          </span>
          <span>{document.size}</span>
        </div>
        <Button size="sm" className="rounded-lg h-8 gap-1.5 text-xs px-3" asChild>
          <a href={document.downloadUrl} download>
            <Download className="h-3 w-3" />
            Baixar
          </a>
        </Button>
      </div>
    </div>
  )
}
