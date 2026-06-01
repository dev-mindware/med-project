"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  publicApi,
  type PublicAnthroponym,
  type PublicForeignism,
  type PublicNeologism,
  type PublicPaginated,
  type PublicToponym,
  type PublicVonalpTerm,
} from "@/lib/public-api"
import { getGrammaticalCategoryLabel } from "@/lib/grammatical-labels"
import { BookOpen, Fingerprint, Globe2, Languages, MapPinned, Search, Sparkles } from "lucide-react"

type CollectionKey = "neologisms" | "foreignisms" | "toponyms" | "anthroponyms" | "vonalp" | "vonalpEp"
type LexicalItem = PublicNeologism | PublicForeignism | PublicToponym | PublicAnthroponym | PublicVonalpTerm

type InitialData = {
  neologisms: PublicPaginated<PublicNeologism>
  foreignisms: PublicPaginated<PublicForeignism>
  toponyms: PublicPaginated<PublicToponym>
  anthroponyms: PublicPaginated<PublicAnthroponym>
  vonalp: PublicPaginated<PublicVonalpTerm>
  vonalpEp: PublicPaginated<PublicVonalpTerm>
}

const EMPTY_META = {
  total: 0,
  page: 1,
  limit: 24,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
}

export const emptyLexicalData: InitialData = {
  neologisms: { data: [], meta: EMPTY_META },
  foreignisms: { data: [], meta: EMPTY_META },
  toponyms: { data: [], meta: EMPTY_META },
  anthroponyms: { data: [], meta: EMPTY_META },
  vonalp: { data: [], meta: EMPTY_META },
  vonalpEp: { data: [], meta: EMPTY_META },
}

const collections = [
  {
    key: "neologisms",
    label: "Neologismos",
    eyebrow: "Novas palavras",
    description: "Entradas novas aprovadas, com definições, categorias gramaticais e exemplos quando disponíveis.",
    icon: Sparkles,
    accent: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  },
  {
    key: "foreignisms",
    label: "Estrangeirismos",
    eyebrow: "Empréstimos linguísticos",
    description: "Termos de origem estrangeira aprovados, com forma original, adaptação e contexto de uso.",
    icon: Languages,
    accent: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700",
  },
  {
    key: "toponyms",
    label: "Topónimos",
    eyebrow: "Geografia linguística",
    description: "Lugares, províncias, municípios, gentílicos, história e proveniência dos nomes.",
    icon: MapPinned,
    accent: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700",
  },
  {
    key: "anthroponyms",
    label: "Antropónimos",
    eyebrow: "Nomes e identidade",
    description: "Nomes próprios, sobrenomes, género, etimologia e figuras históricas.",
    icon: Fingerprint,
    accent: "border-violet-500/30 bg-violet-500/10 text-violet-700",
  },
  {
    key: "vonalp",
    label: "VONALP",
    eyebrow: "Norma nacional",
    description: "Vocabulário Ortográfico Nacional de Angola para a Língua Portuguesa.",
    icon: BookOpen,
    accent: "border-primary/30 bg-primary/10 text-primary",
  },
  {
    key: "vonalpEp",
    label: "VONALP EP",
    eyebrow: "Ensino Primário",
    description: "Vocabulário Ortográfico Nacional de Angola para a Língua Portuguesa — para o Ensino Primário.",
    icon: Globe2,
    accent: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  },
] as const

const categoryOptions = ["Todas", "Substantivo", "Adjetivo", "Verbo", "Advérbio", "Interjeição"]

export function LexicalExplorer({
  initialData,
  initialActive = "neologisms",
}: {
  initialData: InitialData
  initialActive?: CollectionKey
}) {
  const [active, setActive] = useState<CollectionKey>(initialActive)
  const [itemsByCollection, setItemsByCollection] = useState(initialData)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Todas")
  const [province, setProvince] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const activeConfig = collections.find((collection) => collection.key === active) ?? collections[0]
  const activeItems = itemsByCollection[active].data
  const activeMeta = itemsByCollection[active].meta

  const provinces = useMemo(() => {
    const values = initialData.toponyms.data
      .map((item) => item.province)
      .filter((value): value is string => Boolean(value))
    return Array.from(new Set(values)).sort()
  }, [initialData.toponyms.data])

  const search = async (collection = active) => {
    setIsLoading(true)

    try {
      const filters = {
        q: query,
        category: category === "Todas" ? undefined : category,
        province: collection === "toponyms" ? province : undefined,
        limit: 24,
      }

      const response = await fetchCollection(collection, filters)
      setItemsByCollection((current) => ({ ...current, [collection]: response }))
    } catch {
      setItemsByCollection((current) => ({
        ...current,
        [collection]: { data: [], meta: { ...EMPTY_META } },
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const switchCollection = async (collection: CollectionKey) => {
    setActive(collection)
    if (itemsByCollection[collection].data.length === 0) {
      await search(collection)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {collections.map((collection) => {
          const Icon = collection.icon
          const isActive = active === collection.key
          const total = itemsByCollection[collection.key].meta.total

          return (
            <button
              key={collection.key}
              onClick={() => switchCollection(collection.key)}
              className={`rounded-lg border p-4 text-left transition-all duration-200 ${
                isActive ? "border-primary bg-primary/5 shadow-sm" : "border-blue-100/80 bg-white/84 hover:-translate-y-0.5 hover:border-primary/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-md border ${collection.accent}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <Badge variant={isActive ? "default" : "outline"} className="rounded-md">{total}</Badge>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{collection.eyebrow}</p>
              <h3 className="mt-1 text-lg font-bold">{collection.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{collection.description}</p>
            </button>
          )
        })}
      </div>

      <div className="rounded-lg border border-blue-100/80 bg-white/88 p-4 shadow-sm backdrop-blur md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-blue-100/80 bg-background px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && search()}
              placeholder={`Pesquisar em ${activeConfig.label}...`}
              className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>

          {(active === "vonalp" || active === "vonalpEp" || active === "neologisms") && (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11 rounded-md lg:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {active === "toponyms" && (
            <Select value={province || "Todas"} onValueChange={(value) => setProvince(value === "Todas" ? "" : value)}>
              <SelectTrigger className="h-11 rounded-md lg:w-[190px]">
                <SelectValue placeholder="Província" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                {provinces.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button onClick={() => search()} disabled={isLoading} className="h-11 rounded-md px-7 font-semibold">
            {isLoading ? "A pesquisar..." : "Pesquisar"}
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-blue-100/80 pt-4">
          <div>
            <p className="text-sm font-semibold">{activeConfig.label}</p>
            <p className="text-xs text-muted-foreground">
              {activeMeta.total} registo{activeMeta.total === 1 ? "" : "s"} encontrado{activeMeta.total === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>

      {activeItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeItems.map((item) => (
            <LexicalCard key={item.id} item={item} collection={active} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-primary/25 bg-white/72 p-12 text-center shadow-sm backdrop-blur">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-primary/35" />
          <h3 className="text-lg font-semibold">Nenhum registo encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">Ajuste a pesquisa ou confirme se a API já possui conteúdo aprovado.</p>
        </div>
      )}
    </div>
  )
}

function LexicalCard({ item, collection }: { item: LexicalItem; collection: CollectionKey }) {
  if (collection === "neologisms") {
    const neologism = item as PublicNeologism
    return (
      <article className="rounded-lg border border-blue-100/80 bg-white/86 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Neologismo</p>
            <h3 className="mt-1 text-2xl font-extrabold text-primary">{neologism.entry}</h3>
          </div>
          {neologism.grammaticalCategory && (
            <Badge variant="secondary" className="rounded-md">
              {getGrammaticalCategoryLabel(neologism.grammaticalCategory) || neologism.grammaticalCategory}
            </Badge>
          )}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {neologism.firstDefinition ?? neologism.secondDefinition ?? neologism.thirdDefinition ?? "Definição não disponível."}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {neologism.languageCode && <Badge variant="outline" className="rounded-md">{neologism.languageCode}</Badge>}
          {neologism.usageExample && <Badge variant="outline" className="rounded-md">Com exemplo</Badge>}
        </div>
      </article>
    )
  }

  if (collection === "foreignisms") {
    const foreignism = item as PublicForeignism
    return (
      <article className="rounded-lg border border-blue-100/80 bg-white/86 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Estrangeirismo</p>
            <h3 className="mt-1 text-2xl font-extrabold text-primary">{foreignism.term}</h3>
          </div>
          {foreignism.grammaticalCategory && (
            <Badge variant="secondary" className="rounded-md">
              {getGrammaticalCategoryLabel(foreignism.grammaticalCategory) || foreignism.grammaticalCategory}
            </Badge>
          )}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {foreignism.definition ?? foreignism.meaning ?? "Definição não disponível."}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {foreignism.originalLanguage && <Badge variant="outline" className="rounded-md">Origem: {foreignism.originalLanguage}</Badge>}
          {foreignism.adaptedForm && <Badge variant="outline" className="rounded-md">Forma adaptada: {foreignism.adaptedForm}</Badge>}
          {foreignism.field && <Badge variant="outline" className="rounded-md">{foreignism.field}</Badge>}
        </div>
      </article>
    )
  }

  if (collection === "toponyms") {
    const toponym = item as PublicToponym
    return (
      <article className="rounded-lg border border-blue-100/80 bg-white/86 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Topónimo</p>
            <h3 className="mt-1 text-2xl font-extrabold text-primary">{toponym.toponym}</h3>
          </div>
          {toponym.province && <Badge variant="secondary" className="rounded-md">{toponym.province}</Badge>}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{toponym.meaning ?? "Significado não disponível."}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {toponym.municipality && <Badge variant="outline" className="rounded-md">{toponym.municipality}</Badge>}
          {toponym.gentilic && <Badge variant="outline" className="rounded-md">Gentílico: {toponym.gentilic}</Badge>}
          {toponym.languageCode && <Badge variant="outline" className="rounded-md">{toponym.languageCode}</Badge>}
        </div>
      </article>
    )
  }

  if (collection === "anthroponyms") {
    const anthroponym = item as PublicAnthroponym
    return (
      <article className="rounded-lg border border-blue-100/80 bg-white/86 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Antropónimo</p>
            <h3 className="mt-1 text-2xl font-extrabold text-primary">{anthroponym.name}</h3>
          </div>
          {anthroponym.gender && <Badge variant="secondary" className="rounded-md">{anthroponym.gender}</Badge>}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{anthroponym.meaning ?? "Significado não disponível."}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {anthroponym.surname && <Badge variant="outline" className="rounded-md">Sobrenome: {anthroponym.surname}</Badge>}
          {anthroponym.historicalFigure && <Badge variant="outline" className="rounded-md">{anthroponym.historicalFigure}</Badge>}
        </div>
      </article>
    )
  }

  const term = item as PublicVonalpTerm
  return (
    <article className="rounded-lg border border-blue-100/80 bg-white/86 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Termo</p>
          <h3 className="mt-1 text-2xl font-extrabold text-primary">{term.term}</h3>
        </div>
        {term.grammaticalCategory && (
          <Badge variant="secondary" className="rounded-md">
            {getGrammaticalCategoryLabel(term.grammaticalCategory) || term.grammaticalCategory}
          </Badge>
        )}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {term.firstDefinition ?? term.secondDefinition ?? term.thirdDefinition ?? "Definição não disponível."}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {term.pronunciation && <Badge variant="outline" className="rounded-md">{term.pronunciation}</Badge>}
        {term.syllabicDivision && <Badge variant="outline" className="rounded-md">{term.syllabicDivision}</Badge>}
        {term.origin && <Badge variant="outline" className="rounded-md">{term.origin}</Badge>}
      </div>
    </article>
  )
}

function fetchCollection(collection: CollectionKey, filters: Parameters<typeof publicApi.vonalp>[0]) {
  if (collection === "neologisms") return publicApi.neologisms(filters)
  if (collection === "foreignisms") return publicApi.foreignisms(filters)
  if (collection === "toponyms") return publicApi.toponyms(filters)
  if (collection === "anthroponyms") return publicApi.anthroponyms(filters)
  if (collection === "vonalpEp") return publicApi.vonalpEp(filters)
  return publicApi.vonalp(filters)
}
