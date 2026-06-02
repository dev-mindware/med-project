"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  publicApi,
  type PublicAnthroponym,
  type PublicFilters,
  type PublicForeignism,
  type PublicNeologism,
  type PublicPaginated,
  type PublicToponym,
  type PublicVonalpTerm,
} from "@/lib/public-api"
import {
  getGrammaticalCategoryLabel,
  getGrammaticalSubcategoryLabel,
  grammaticalCategoryOptions,
} from "@/lib/grammatical-labels"
import { BookOpen, Fingerprint, Globe2, Languages, MapPinned, Search, Sparkles, Volume2, ImageIcon, Video } from "lucide-react"

export type CollectionKey = "neologisms" | "foreignisms" | "toponyms" | "anthroponyms" | "vonalp" | "vonalpEp"
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
    description: "Entradas novas aprovadas, com definições, categorias gramaticais, exemplos e mídias quando disponíveis.",
    icon: Sparkles,
    accent: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  },
  {
    key: "foreignisms",
    label: "Estrangeirismos",
    eyebrow: "Empréstimos linguísticos",
    description: "Termos de origem estrangeira aprovados, com língua de origem, forma adaptada, campo e contexto de uso.",
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
    description: "Vocabulário Ortográfico Nacional de Angola para a Língua Portuguesa para o Ensino Primário.",
    icon: Globe2,
    accent: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  },
] as const

const allValue = "__all__"

export function LexicalExplorer({
  initialData,
  initialActive = "neologisms",
  visibleCollections,
}: {
  initialData: InitialData
  initialActive?: CollectionKey
  visibleCollections?: CollectionKey[]
}) {
  const allowedCollections = visibleCollections?.length ? visibleCollections : collections.map((collection) => collection.key)
  const [active, setActive] = useState<CollectionKey>(
    allowedCollections.includes(initialActive) ? initialActive : allowedCollections[0],
  )
  const [itemsByCollection, setItemsByCollection] = useState(initialData)
  const [query, setQuery] = useState("")
  const [grammaticalCategory, setGrammaticalCategory] = useState(allValue)
  const [grammaticalSubcategory, setGrammaticalSubcategory] = useState(allValue)
  const [languageCode, setLanguageCode] = useState(allValue)
  const [province, setProvince] = useState(allValue)
  const [municipality, setMunicipality] = useState(allValue)
  const [gender, setGender] = useState(allValue)
  const [originalLanguage, setOriginalLanguage] = useState(allValue)
  const [originCountry, setOriginCountry] = useState(allValue)
  const [field, setField] = useState(allValue)
  const [isLoading, setIsLoading] = useState(false)

  const activeConfig = collections.find((collection) => collection.key === active) ?? collections[0]
  const activeItems = itemsByCollection[active].data
  const activeMeta = itemsByCollection[active].meta
  const visibleCollectionConfigs = collections.filter((collection) => allowedCollections.includes(collection.key))
  const selectedCategory = grammaticalCategoryOptions.find((option) => option.value === grammaticalCategory)

  const optionSets = useMemo(() => {
    const languageCodes = unique([
      ...initialData.neologisms.data.map((item) => item.languageCode),
      ...initialData.toponyms.data.map((item) => item.languageCode),
    ])
    return {
      languageCodes,
      provinces: unique(initialData.toponyms.data.map((item) => item.province)),
      municipalities: unique(initialData.toponyms.data.map((item) => item.municipality)),
      genders: unique(initialData.anthroponyms.data.map((item) => item.gender)),
      originalLanguages: unique(initialData.foreignisms.data.map((item) => item.originalLanguage)),
      originCountries: unique(initialData.foreignisms.data.map((item) => item.originCountry)),
      fields: unique(initialData.foreignisms.data.map((item) => item.field)),
    }
  }, [initialData])

  const search = async (collection = active) => {
    setIsLoading(true)

    try {
      const filters: PublicFilters = {
        q: query,
        grammaticalCategory: usesGrammar(collection) ? valueOrUndefined(grammaticalCategory) : undefined,
        grammaticalSubcategory: usesGrammar(collection) ? valueOrUndefined(grammaticalSubcategory) : undefined,
        languageCode: usesLanguage(collection) ? valueOrUndefined(languageCode) : undefined,
        province: collection === "toponyms" ? valueOrUndefined(province) : undefined,
        municipality: collection === "toponyms" ? valueOrUndefined(municipality) : undefined,
        gender: collection === "anthroponyms" ? valueOrUndefined(gender) : undefined,
        originalLanguage: collection === "foreignisms" ? valueOrUndefined(originalLanguage) : undefined,
        originCountry: collection === "foreignisms" ? valueOrUndefined(originCountry) : undefined,
        field: collection === "foreignisms" ? valueOrUndefined(field) : undefined,
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
    resetFilters()
    if (itemsByCollection[collection].data.length === 0) {
      await search(collection)
    }
  }

  return (
    <div className="space-y-8">
      {visibleCollectionConfigs.length > 1 && (
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {visibleCollectionConfigs.map((collection) => {
            const Icon = collection.icon
            const isActive = active === collection.key
            const total = itemsByCollection[collection.key].meta.total

            return (
              <button
                key={collection.key}
                onClick={() => switchCollection(collection.key)}
                className={`rounded-md border p-4 text-left transition-all duration-200 ${
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
      )}

      <div className="rounded-md border border-blue-100/80 bg-white/88 p-4 shadow-sm backdrop-blur md:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_auto] lg:items-start">
          <div className="flex items-center gap-2 rounded-md border border-blue-100/80 bg-background/88 px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && search()}
              placeholder={`Pesquisar em ${activeConfig.label}...`}
              className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-end">
            {usesGrammar(active) && (
              <>
                <Select value={grammaticalCategory} onValueChange={(value) => {
                  setGrammaticalCategory(value)
                  setGrammaticalSubcategory(allValue)
                }}>
                  <SelectTrigger className="h-11 rounded-md lg:w-[190px]">
                    <SelectValue placeholder="Classe gramatical" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={allValue}>Todas as classes</SelectItem>
                    {grammaticalCategoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={grammaticalSubcategory} onValueChange={setGrammaticalSubcategory}>
                  <SelectTrigger className="h-11 rounded-md lg:w-[205px]">
                    <SelectValue placeholder="Subclasse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={allValue}>Todas as subclasses</SelectItem>
                    {(selectedCategory?.subcategories ?? []).map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {usesLanguage(active) && (
              <Select value={languageCode} onValueChange={setLanguageCode}>
                <SelectTrigger className="h-11 rounded-md lg:w-[160px]">
                  <SelectValue placeholder="Língua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={allValue}>Todas as línguas</SelectItem>
                  {optionSets.languageCodes.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {active === "toponyms" && (
              <>
                <SimpleSelect label="Província" value={province} onChange={setProvince} options={optionSets.provinces} allLabel="Todas as províncias" />
                <SimpleSelect label="Município" value={municipality} onChange={setMunicipality} options={optionSets.municipalities} allLabel="Todos os municípios" />
              </>
            )}

            {active === "anthroponyms" && (
              <SimpleSelect label="Género" value={gender} onChange={setGender} options={optionSets.genders} allLabel="Todos os géneros" />
            )}

            {active === "foreignisms" && (
              <>
                <SimpleSelect label="Língua original" value={originalLanguage} onChange={setOriginalLanguage} options={optionSets.originalLanguages} allLabel="Todas as línguas" />
                <SimpleSelect label="País de origem" value={originCountry} onChange={setOriginCountry} options={optionSets.originCountries} allLabel="Todos os países" />
                <SimpleSelect label="Campo" value={field} onChange={setField} options={optionSets.fields} allLabel="Todos os campos" />
              </>
            )}

            <Button onClick={() => search()} disabled={isLoading} className="h-11 rounded-md px-7 font-semibold">
              {isLoading ? "A pesquisar..." : "Pesquisar"}
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-blue-100/80 pt-4">
          <div>
            <p className="text-sm font-semibold">{activeConfig.label}</p>
            <p className="text-xs text-muted-foreground">
              {activeMeta.total} registo{activeMeta.total === 1 ? "" : "s"} encontrado{activeMeta.total === 1 ? "" : "s"}
            </p>
          </div>
          <Button variant="outline" onClick={resetFilters} className="h-9 rounded-md px-4 text-xs font-semibold">
            Limpar filtros
          </Button>
        </div>
      </div>

      {activeItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeItems.map((item) => (
            <LexicalCard key={item.id} item={item} collection={active} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-primary/25 bg-white/72 p-12 text-center shadow-sm backdrop-blur">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-primary/35" />
          <h3 className="text-lg font-semibold">Nenhum registo encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">Ajuste a pesquisa ou consulte novamente quando houver mais conteúdo aprovado.</p>
        </div>
      )}
    </div>
  )

  function resetFilters() {
    setQuery("")
    setGrammaticalCategory(allValue)
    setGrammaticalSubcategory(allValue)
    setLanguageCode(allValue)
    setProvince(allValue)
    setMunicipality(allValue)
    setGender(allValue)
    setOriginalLanguage(allValue)
    setOriginCountry(allValue)
    setField(allValue)
  }
}

function SimpleSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  allLabel: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11 rounded-md lg:w-[180px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={allValue}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>{option}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function LexicalCard({ item, collection }: { item: LexicalItem; collection: CollectionKey }) {
  if (collection === "neologisms") {
    const neologism = item as PublicNeologism
    return (
      <article className="rounded-md border border-blue-100/80 bg-white/86 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30">
        <CardHeader eyebrow="Neologismo" title={neologism.entry} badge={categoryBadge(neologism.grammaticalCategory, neologism.grammaticalSubcategory)} />
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {neologism.firstDefinition ?? neologism.secondDefinition ?? neologism.thirdDefinition ?? "Definição não disponível."}
        </p>
        {neologism.usageExample && (
          <p className="mt-4 border-l-2 border-primary/30 pl-3 text-sm italic text-foreground/75">"{neologism.usageExample}"</p>
        )}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {neologism.languageCode && <Badge variant="outline" className="rounded-md">{neologism.languageCode}</Badge>}
          {neologism.audioUrl && <MediaBadge icon="audio" label="Áudio" />}
          {neologism.imageUrl && <MediaBadge icon="image" label="Imagem" />}
          {neologism.videoUrl && <MediaBadge icon="video" label="Vídeo" />}
        </div>
      </article>
    )
  }

  if (collection === "foreignisms") {
    const foreignism = item as PublicForeignism
    return (
      <article className="rounded-md border border-blue-100/80 bg-white/86 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30">
        <CardHeader eyebrow="Estrangeirismo" title={foreignism.term} badge={categoryBadge(foreignism.grammaticalCategory)} />
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {foreignism.definition ?? foreignism.meaning ?? "Definição não disponível."}
        </p>
        {foreignism.usageExample && (
          <p className="mt-4 border-l-2 border-cyan-500/30 pl-3 text-sm italic text-foreground/75">"{foreignism.usageExample}"</p>
        )}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {foreignism.originalLanguage && <Badge variant="outline" className="rounded-md">Origem: {foreignism.originalLanguage}</Badge>}
          {foreignism.originCountry && <Badge variant="outline" className="rounded-md">{foreignism.originCountry}</Badge>}
          {foreignism.adaptedForm && <Badge variant="outline" className="rounded-md">Forma adaptada: {foreignism.adaptedForm}</Badge>}
          {foreignism.field && <Badge variant="outline" className="rounded-md">{foreignism.field}</Badge>}
        </div>
      </article>
    )
  }

  if (collection === "toponyms") {
    const toponym = item as PublicToponym
    return (
      <article className="rounded-md border border-blue-100/80 bg-white/86 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30">
        <CardHeader eyebrow="Topónimo" title={toponym.toponym} badge={toponym.province} />
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{toponym.meaning ?? "Significado não disponível."}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {toponym.municipality && <Badge variant="outline" className="rounded-md">{toponym.municipality}</Badge>}
          {toponym.gentilic && <Badge variant="outline" className="rounded-md">Gentílico: {toponym.gentilic}</Badge>}
          {toponym.languageCode && <Badge variant="outline" className="rounded-md">{toponym.languageCode}</Badge>}
          {toponym.locationImage && <MediaBadge icon="image" label="Imagem" />}
        </div>
      </article>
    )
  }

  if (collection === "anthroponyms") {
    const anthroponym = item as PublicAnthroponym
    return (
      <article className="rounded-md border border-blue-100/80 bg-white/86 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30">
        <CardHeader eyebrow="Antropónimo" title={anthroponym.name} badge={anthroponym.gender} />
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
    <article className="rounded-md border border-blue-100/80 bg-white/86 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30">
      <CardHeader eyebrow="Termo" title={term.term} badge={categoryBadge(term.grammaticalCategory, term.grammaticalSubcategory)} />
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

function CardHeader({ eyebrow, title, badge }: { eyebrow: string; title: string; badge?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
        <h3 className="mt-1 text-2xl font-extrabold text-primary">{title}</h3>
      </div>
      {badge && <Badge variant="secondary" className="rounded-md">{badge}</Badge>}
    </div>
  )
}

function MediaBadge({ icon, label }: { icon: "audio" | "image" | "video"; label: string }) {
  const Icon = icon === "audio" ? Volume2 : icon === "image" ? ImageIcon : Video
  return (
    <Badge variant="outline" className="rounded-md">
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  )
}

function categoryBadge(category?: string | null, subcategory?: string | null) {
  const categoryLabel = getGrammaticalCategoryLabel(category)
  const subcategoryLabel = getGrammaticalSubcategoryLabel(category, subcategory)
  return [categoryLabel, subcategoryLabel && subcategoryLabel !== categoryLabel ? subcategoryLabel : ""]
    .filter(Boolean)
    .join(" / ")
}

function fetchCollection(collection: CollectionKey, filters: PublicFilters) {
  if (collection === "neologisms") return publicApi.neologisms(filters)
  if (collection === "foreignisms") return publicApi.foreignisms(filters)
  if (collection === "toponyms") return publicApi.toponyms(filters)
  if (collection === "anthroponyms") return publicApi.anthroponyms(filters)
  if (collection === "vonalpEp") return publicApi.vonalpEp(filters)
  return publicApi.vonalp(filters)
}

function usesGrammar(collection: CollectionKey) {
  return ["neologisms", "foreignisms", "vonalp", "vonalpEp"].includes(collection)
}

function usesLanguage(collection: CollectionKey) {
  return ["neologisms", "toponyms"].includes(collection)
}

function valueOrUndefined(value: string) {
  return value === allValue ? undefined : value
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim())))).sort((a, b) =>
    a.localeCompare(b, "pt"),
  )
}
