"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, BookOpen } from "lucide-react"

interface VonaEntry {
  word: string
  category: string
  context: string
  definition: string
  variants?: string[]
  region?: string
}

export function VonaSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLetter, setSelectedLetter] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchResults, setSearchResults] = useState<VonaEntry[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
  const categories = ["Todas", "Substantivo", "Adjetivo", "Verbo", "Advérbio", "Interjeição"]

  const mockEntries: VonaEntry[] = [
    {
      word: "Bué",
      category: "Advérbio",
      context: "Linguagem coloquial",
      definition: "Muito, bastante (expressão popular angolana)",
      variants: ["bueda", "bwé"],
      region: "Nacional",
    },
    {
      word: "Cacimbo",
      category: "Substantivo",
      context: "Meteorologia",
      definition: "Estação seca em Angola, caracterizada por neblina matinal",
      region: "Nacional",
    },
    {
      word: "Candonga",
      category: "Substantivo",
      context: "Economia",
      definition: "Mercado informal, comércio paralelo",
      variants: ["kandonga"],
      region: "Luanda",
    },
    {
      word: "Zungueira",
      category: "Substantivo",
      context: "Profissão",
      definition: "Vendedora ambulante nos mercados de Angola",
      region: "Nacional",
    },
  ]

  const handleSearch = () => {
    setIsSearching(true)
    setTimeout(() => {
      let filtered = mockEntries
      if (searchTerm.trim())
        filtered = filtered.filter(
          (e) =>
            e.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.definition.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      if (selectedLetter)
        filtered = filtered.filter((e) => e.word.toUpperCase().startsWith(selectedLetter))
      if (selectedCategory && selectedCategory !== "Todas")
        filtered = filtered.filter((e) => e.category === selectedCategory)
      setSearchResults(filtered)
      setIsSearching(false)
    }, 500)
  }

  const toggleLetter = (letter: string) => setSelectedLetter(letter === selectedLetter ? "" : letter)

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Alphabet navigation */}
      <div className="rounded-2xl border border-border bg-background px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">
          Navegar por letra
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => toggleLetter(letter)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-150 ${
                selectedLetter === letter
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-border bg-background p-2">
        <div className="flex items-center gap-2 flex-1 px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Pesquisar no VONA..."
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
            <span className="font-semibold text-foreground">{searchResults.length}</span> entrada{searchResults.length !== 1 ? "s" : ""}
            {selectedLetter && ` — letra ${selectedLetter}`}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchResults.map((entry, i) => <VonaEntryCard key={i} entry={entry} />)}
          </div>
        </div>
      )}

      {/* No results */}
      {(searchTerm || selectedLetter || selectedCategory) && searchResults.length === 0 && !isSearching && (
        <div className="rounded-2xl border border-border bg-background p-10 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Nenhuma entrada encontrada</h3>
          <p className="text-sm text-muted-foreground">Tente pesquisar com termos diferentes ou explore outras categorias.</p>
        </div>
      )}
    </div>
  )
}

function VonaEntryCard({ entry }: { entry: VonaEntry }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:border-border/80 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-xl font-bold text-primary">{entry.word}</h3>
        <div className="flex flex-wrap gap-1.5 justify-end">
          <Badge variant="secondary" className="text-xs">{entry.category}</Badge>
          <Badge variant="outline" className="text-xs">{entry.context}</Badge>
          {entry.region && <Badge variant="outline" className="text-xs">{entry.region}</Badge>}
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{entry.definition}</p>
      {entry.variants && entry.variants.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Variantes</p>
          <div className="flex flex-wrap gap-1">
            {entry.variants.map((v, i) => (
              <Badge key={i} variant="outline" className="text-xs">{v}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
