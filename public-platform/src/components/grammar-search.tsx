"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, ExternalLink } from "lucide-react"
import Link from "next/link"

interface GrammarRule {
  title: string
  category: string
  description: string
  rules: string[]
  examples: { correct: string; incorrect?: string; explanation: string }[]
  relatedWords?: string[]
}

export function GrammarSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<GrammarRule[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const mockRules: GrammarRule[] = [
    {
      title: "Concordância Nominal",
      category: "Sintaxe",
      description: "Regras de concordância entre substantivos, adjetivos, artigos e numerais.",
      rules: [
        "O adjetivo concorda em gênero e número com o substantivo",
        "O artigo concorda em gênero e número com o substantivo",
        "Os numerais cardinais concordam com o substantivo",
      ],
      examples: [
        {
          correct: "As casas antigas de Luanda",
          incorrect: "As casa antiga de Luanda",
          explanation: "Adjetivo 'antigas' concorda com 'casas' (feminino plural)",
        },
        {
          correct: "Dois livros interessantes",
          explanation: "Numeral e adjetivo concordam com o substantivo masculino plural",
        },
      ],
      relatedWords: ["substantivo", "adjetivo", "artigo"],
    },
    {
      title: "Uso da Crase",
      category: "Ortografia",
      description: "Regras para o uso correto da crase na língua portuguesa.",
      rules: [
        "Usa-se crase na contração da preposição 'a' com o artigo 'a'",
        "Usa-se crase antes de palavras femininas que admitem artigo",
        "Não se usa crase antes de palavras masculinas",
      ],
      examples: [
        {
          correct: "Vou à escola",
          incorrect: "Vou a escola",
          explanation: "Contração de 'a' (preposição) + 'a' (artigo) = à",
        },
        {
          correct: "Refiro-me a Angola",
          explanation: "Não usa crase antes de nomes próprios que não admitem artigo",
        },
      ],
      relatedWords: ["preposição", "artigo", "acento"],
    },
  ]

  const handleSearch = () => {
    if (!searchTerm.trim()) return
    setIsSearching(true)
    setTimeout(() => {
      const filtered = mockRules.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setSearchResults(filtered)
      setIsSearching(false)
    }, 500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-border bg-background p-2">
        <div className="flex items-center gap-2 flex-1 px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Pesquisar regras gramaticais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-11 px-0 text-base"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="rounded-xl h-11 px-6 font-semibold shrink-0"
        >
          {isSearching ? "A pesquisar..." : "Pesquisar"}
        </Button>
      </div>

      {/* Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{searchResults.length}</span> resultado{searchResults.length !== 1 ? "s" : ""} encontrado{searchResults.length !== 1 ? "s" : ""}
          </p>
          {searchResults.map((rule, i) => <GrammarRuleCard key={i} rule={rule} />)}
        </div>
      )}

      {/* No results */}
      {searchTerm && searchResults.length === 0 && !isSearching && (
        <div className="rounded-2xl border border-border bg-background p-10 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Nenhuma regra encontrada</h3>
          <p className="text-sm text-muted-foreground">Tente pesquisar com termos diferentes ou explore os tópicos abaixo.</p>
        </div>
      )}
    </div>
  )
}

function GrammarRuleCard({ rule }: { rule: GrammarRule }) {
  const [tab, setTab] = useState<"rules" | "examples" | "related">("rules")

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start gap-3 mb-1">
          <h3 className="text-xl font-bold text-primary">{rule.title}</h3>
          <span className="text-xs font-semibold bg-muted text-muted-foreground px-2.5 py-1 rounded-full shrink-0 mt-0.5">
            {rule.category}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{rule.description}</p>
      </div>

      {/* Tab strip */}
      <div className="flex border-t border-border">
        {(["rules", "examples", "related"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-xs font-semibold py-2.5 transition-colors ${
              tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "rules" ? "Regras" : t === "examples" ? "Exemplos" : "Relacionadas"}
          </button>
        ))}
      </div>

      <div className="px-6 py-5">
        {tab === "rules" && (
          <ul className="space-y-2.5">
            {rule.rules.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        )}
        {tab === "examples" && (
          <div className="space-y-3">
            {rule.examples.map((ex, i) => (
              <div key={i} className="rounded-xl bg-muted/40 px-4 py-3 space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-600 font-semibold">✓</span>
                  <span className="font-medium">{ex.correct}</span>
                </div>
                {ex.incorrect && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-rose-600 font-semibold">✗</span>
                    <span className="line-through text-muted-foreground">{ex.incorrect}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground italic">{ex.explanation}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "related" && rule.relatedWords && rule.relatedWords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rule.relatedWords.map((w, i) => (
              <Button key={i} variant="outline" size="sm" className="rounded-lg text-xs" asChild>
                <Link href={`/dictionary?q=${w}`}>
                  {w}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
