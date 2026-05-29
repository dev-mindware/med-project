"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Heart, Volume2, BookOpen, ChevronDown } from "lucide-react"

interface WordResult {
  word: string
  pronunciation: string
  class: string
  definition: string
  examples: string[]
  etymology?: string
  synonyms?: string[]
  antonyms?: string[]
}

export function DictionarySearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [wordClass, setWordClass] = useState("")
  const [searchResults, setSearchResults] = useState<WordResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  const mockResults: WordResult[] = [
    {
      word: "Saudade",
      pronunciation: "/saw-DA-deh/",
      class: "substantivo feminino",
      definition: "Sentimento melancólico de ausência de alguém ou algo que se ama; nostalgia profunda.",
      examples: [
        "Sinto saudade dos tempos de criança em Luanda.",
        "A saudade da terra natal acompanha muitos emigrantes.",
      ],
      etymology: "Do latim 'solitas, -atis' (solidão)",
      synonyms: ["nostalgia", "melancolia", "tristeza"],
      antonyms: ["alegria", "contentamento"],
    },
    {
      word: "Mulemba",
      pronunciation: "/mu-LEM-ba/",
      class: "substantivo feminino",
      definition: "Árvore sagrada angolana (Ficus sycamorus), símbolo de sabedoria e ancestralidade.",
      examples: [
        "Os anciãos reuniam-se sob a mulemba para tomar decisões importantes.",
        "A mulemba é considerada a árvore da vida na cultura angolana.",
      ],
      etymology: "Do quimbundo 'mulemba'",
      synonyms: ["figueira", "árvore sagrada"],
    },
  ]

  const handleSearch = () => {
    if (!searchTerm.trim()) return
    setIsSearching(true)
    setTimeout(() => {
      const filtered = mockResults.filter(
        (r) =>
          r.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.definition.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setSearchResults(filtered)
      setIsSearching(false)
    }, 500)
  }

  const toggleFavorite = (word: string) =>
    setFavorites((prev) => (prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]))

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-border bg-background p-2">
        <div className="flex items-center gap-2 flex-1 px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Digite uma palavra para pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-11 px-0 text-base"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block h-6 w-px bg-border" />
          <Select value={wordClass} onValueChange={setWordClass}>
            <SelectTrigger className="w-[150px] border-0 shadow-none bg-transparent focus:ring-0 h-11 text-sm">
              <SelectValue placeholder="Classe gramatical" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as classes</SelectItem>
              <SelectItem value="substantivo">Substantivos</SelectItem>
              <SelectItem value="verbo">Verbos</SelectItem>
              <SelectItem value="adjetivo">Adjetivos</SelectItem>
              <SelectItem value="adverbio">Advérbios</SelectItem>
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
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{searchResults.length}</span> resultado{searchResults.length !== 1 ? "s" : ""} encontrado{searchResults.length !== 1 ? "s" : ""}
          </p>
          {searchResults.map((result, i) => (
            <WordCard
              key={i}
              word={result}
              isFavorite={favorites.includes(result.word)}
              onToggleFavorite={() => toggleFavorite(result.word)}
            />
          ))}
        </div>
      )}

      {/* No results */}
      {searchTerm && searchResults.length === 0 && !isSearching && (
        <div className="rounded-2xl border border-border bg-background p-10 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Nenhum resultado encontrado</h3>
          <p className="text-sm text-muted-foreground">Tente pesquisar com termos diferentes ou verifique a ortografia.</p>
        </div>
      )}
    </div>
  )
}

function WordCard({ word, isFavorite, onToggleFavorite }: { word: WordResult; isFavorite: boolean; onToggleFavorite: () => void }) {
  const [tab, setTab] = useState<"definition" | "examples" | "etymology" | "related">("definition")

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-extrabold text-primary">{word.word}</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground">
              <Volume2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{word.pronunciation}</span>
            <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">{word.class}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFavorite}
          className={`h-8 w-8 rounded-full shrink-0 ${isFavorite ? "text-rose-500" : "text-muted-foreground"}`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
      </div>

      {/* Tab strip */}
      <div className="flex border-t border-border">
        {(["definition", "examples", "etymology", "related"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-xs font-semibold py-2.5 transition-colors ${
              tab === t
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "definition" ? "Definição" : t === "examples" ? "Exemplos" : t === "etymology" ? "Etimologia" : "Relacionadas"}
          </button>
        ))}
      </div>

      <div className="px-6 py-5">
        {tab === "definition" && (
          <p className="text-base leading-relaxed text-muted-foreground">{word.definition}</p>
        )}
        {tab === "examples" && (
          <ul className="space-y-2.5">
            {word.examples.map((ex, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-2 h-1 w-1 rounded-full bg-primary/50 shrink-0" />
                <span className="italic">{ex}</span>
              </li>
            ))}
          </ul>
        )}
        {tab === "etymology" && (
          <p className="text-sm text-muted-foreground">{word.etymology ?? "Etimologia não disponível"}</p>
        )}
        {tab === "related" && (
          <div className="space-y-4">
            {word.synonyms && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Sinónimos</p>
                <div className="flex flex-wrap gap-1.5">
                  {word.synonyms.map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}
                </div>
              </div>
            )}
            {word.antonyms && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Antónimos</p>
                <div className="flex flex-wrap gap-1.5">
                  {word.antonyms.map((a, i) => <Badge key={i} variant="outline" className="text-xs">{a}</Badge>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
