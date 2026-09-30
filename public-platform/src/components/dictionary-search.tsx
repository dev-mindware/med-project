"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getGrammaticalCategoryLabel,
  getGrammaticalStatusLabel,
  getGrammaticalSubcategoryLabel,
  grammaticalCategoryOptions,
} from "@/lib/grammatical-labels"
import { publicApi, type PublicEntry, type PublicMeta } from "@/lib/public-api"
import { BookOpen, FileText, Heart, ImageIcon, Search, Video, Volume2 } from "lucide-react"

type DictionarySearchProps = {
  initialResults?: PublicEntry[]
  initialMeta?: PublicMeta
  initialQuery?: string
  initialCategory?: string
  initialSubcategory?: string
  initialLanguageCode?: string
}

const defaultMeta: PublicMeta = {
  total: 0,
  page: 1,
  limit: 6,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
}

const languageOptions = [
  { label: "Todas as línguas", value: "all" },
  { label: "Português", value: "pt" },
  { label: "Kimbundu", value: "kmb" },
  { label: "Umbundu", value: "umb" },
  { label: "Kikongo", value: "kon" },
  { label: "Cokwe", value: "cjk" },
  { label: "Nganguela", value: "nba" },
  { label: "Kwanyama", value: "kua" },
]

export function DictionarySearch({
  initialResults = [],
  initialMeta = defaultMeta,
  initialQuery = "",
  initialCategory = "",
  initialSubcategory = "",
  initialLanguageCode = "",
}: DictionarySearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [wordClass, setWordClass] = useState(initialCategory || "all")
  const [subcategory, setSubcategory] = useState(initialSubcategory || "all")
  const [languageCode, setLanguageCode] = useState(initialLanguageCode || "all")
  const [searchResults, setSearchResults] = useState<PublicEntry[]>(initialResults)
  const [meta, setMeta] = useState<PublicMeta>(initialMeta)
  const [hasSearched, setHasSearched] = useState(initialResults.length > 0 || Boolean(initialQuery || initialCategory))
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const didMount = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  const selectedCategory = grammaticalCategoryOptions.find((item) => item.value === wordClass)
  const subcategoryOptions = selectedCategory?.subcategories ?? []

  const updateUrl = (filters: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && String(value).trim() !== "") {
        params.set(key, String(value))
      }
    })

    const queryString = params.toString()
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
    })
  }

  const loadResults = useCallback(async (page = 1) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const category = wordClass === "all" ? undefined : wordClass
    const grammaticalSubcategory = subcategory === "all" ? undefined : subcategory
    const language = languageCode === "all" ? undefined : languageCode
    const q = searchTerm.trim() || undefined

    setHasSearched(true)
    setIsLoading(true)
    updateUrl({ q, category, grammaticalSubcategory, languageCode: language, page: page > 1 ? page : undefined })

    try {
      const response = await publicApi.dictionary(
        {
          q,
          category,
          grammaticalSubcategory,
          languageCode: language,
          page,
          limit: 6,
        },
        { signal: controller.signal }
      )
      if (controller.signal.aborted) return
      setSearchResults(response.data)
      setMeta(response.meta)
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return
      setSearchResults([])
      setMeta(defaultMeta)
    } finally {
      if (abortRef.current === controller) {
        setIsLoading(false)
      }
    }
  }, [languageCode, searchTerm, subcategory, wordClass])

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }

    const delay = searchTerm.trim().length >= 3 ? 220 : 320
    const timeout = window.setTimeout(() => {
      void loadResults(1)
    }, delay)

    return () => {
      window.clearTimeout(timeout)
      abortRef.current?.abort()
    }
  }, [loadResults, searchTerm])

  const handleCategoryChange = (value: string) => {
    setWordClass(value)
    setSubcategory("all")
  }

  const toggleFavorite = (word: string) =>
    setFavorites((prev) => (prev.includes(word) ? prev.filter((item) => item !== word) : [...prev, word]))

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-2xl border border-border bg-background p-3 shadow-sm">
        <div className="grid gap-2 lg:grid-cols-[1fr_190px_190px_170px]">
          <div className="flex items-center gap-2 rounded-xl border border-border/70 px-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Pesquisar entrada, definição, etimologia ou exemplo..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-11 px-0 text-base"
            />
          </div>

          <Select value={wordClass} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Classe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as classes</SelectItem>
              {grammaticalCategoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={subcategory} onValueChange={setSubcategory} disabled={wordClass === "all" || subcategoryOptions.length === 0}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Subclasse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as subclasses</SelectItem>
              {subcategoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={languageCode} onValueChange={setLanguageCode}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Língua" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>
        {(isLoading || isPending) && (
          <p className="px-2 pt-3 text-xs font-medium text-muted-foreground">A actualizar resultados...</p>
        )}
      </div>

      {searchResults.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">{meta.total}</span> resultado
              {meta.total === 1 ? "" : "s"} encontrados
            </p>
            <p>
              Página {meta.page} de {Math.max(meta.totalPages, 1)}
            </p>
          </div>

          <div className="grid gap-4">
            {searchResults.map((result) => (
              <WordCard
                key={result.id}
                word={result}
                isFavorite={favorites.includes(result.entry)}
                onToggleFavorite={() => toggleFavorite(result.entry)}
              />
            ))}
          </div>

          {(meta.hasPreviousPage || meta.hasNextPage) && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" disabled={!meta.hasPreviousPage || isPending} onClick={() => loadResults(meta.page - 1)}>
                Anterior
              </Button>
              <Button variant="outline" disabled={!meta.hasNextPage || isPending} onClick={() => loadResults(meta.page + 1)}>
                Seguinte
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {hasSearched && searchResults.length === 0 && !isPending && (
        <div className="rounded-2xl border border-border bg-background p-10 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Nenhum resultado encontrado</h3>
          <p className="text-sm text-muted-foreground">Tente pesquisar com outros filtros ou verifique a ortografia.</p>
        </div>
      )}
    </div>
  )
}

function WordCard({
  word,
  isFavorite,
  onToggleFavorite,
}: {
  word: PublicEntry
  isFavorite: boolean
  onToggleFavorite: () => void
}) {
  const [tab, setTab] = useState<"definition" | "media" | "forms" | "details">("definition")
  const definitions = [word.firstDefinition, word.secondDefinition, word.thirdDefinition].filter(Boolean)
  const mediaCount = [word.audioUrl, word.imageUrl, word.videoUrl].filter(Boolean).length
  const badges = useMemo(
    () => [
      word.isVocabulary ? "VONALP" : null,
      word.isVocabularyEP ? "VONALP-EP" : null,
      word.isForeignism ? "Estrangeirismo" : null,
    ].filter(Boolean),
    [word.isForeignism, word.isVocabulary, word.isVocabularyEP],
  )

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-2xl font-extrabold text-primary">{word.entry}</h3>
                {word.audioUrl && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground" asChild>
                    <a href={word.audioUrl} aria-label={`Ouvir ${word.entry}`} target="_blank" rel="noreferrer">
                      <Volume2 className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {word.pronunciation && <span className="font-mono text-sm text-muted-foreground">{word.pronunciation}</span>}
                {word.syllabicDivision && <Badge variant="outline">{word.syllabicDivision}</Badge>}
                {word.grammaticalCategory && (
                  <Badge>{getGrammaticalCategoryLabel(word.grammaticalCategory)}</Badge>
                )}
                {word.grammaticalSubcategory && (
                  <Badge variant="secondary">
                    {getGrammaticalSubcategoryLabel(word.grammaticalCategory, word.grammaticalSubcategory)}
                  </Badge>
                )}
                {badges.map((badge) => (
                  <Badge key={badge} variant="outline">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className={`h-8 w-8 rounded-md shrink-0 ${isFavorite ? "text-primary" : "text-muted-foreground"}`}
              aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>

          <div className="flex border-t border-border">
            {(["definition", "media", "forms", "details"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`flex-1 text-xs font-semibold py-2.5 transition-colors ${
                  tab === item ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item === "definition" ? "Definição" : item === "media" ? `Mídias (${mediaCount})` : item === "forms" ? "Formas" : "Detalhes"}
              </button>
            ))}
          </div>

          <div className="px-6 py-5">
            {tab === "definition" && (
              <div className="space-y-4">
                {definitions.length > 0 ? (
                  <ol className="space-y-3">
                    {definitions.map((definition, index) => (
                      <li key={index} className="flex gap-3 text-base leading-relaxed text-muted-foreground">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <span>{definition}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-base leading-relaxed text-muted-foreground">Definição não disponível.</p>
                )}
                {word.usageExample && (
                  <blockquote className="rounded-xl border-l-4 border-primary bg-muted/40 p-4 text-sm italic text-muted-foreground">
                    {word.usageExample}
                  </blockquote>
                )}
                {word.etymology && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Etimologia:</span> {word.etymology}
                  </p>
                )}
              </div>
            )}

            {tab === "media" && <MediaPanel word={word} />}

            {tab === "forms" && (
              <dl className="grid gap-3 sm:grid-cols-2">
                <Detail label="Abreviatura" value={word.abbreviation} />
                <Detail label="Acrónimo" value={word.acronym} />
                <Detail label="Significado do acrónimo" value={word.acronymMeaning} />
                <Detail label="Redução" value={word.reduction} />
                <Detail label="Significado da redução" value={word.reductionMeaning} />
                <Detail label="Forma curta" value={word.shortForm} />
                <Detail label="Forma completa" value={word.fullForm} />
              </dl>
            )}

            {tab === "details" && (
              <dl className="grid gap-3 sm:grid-cols-2">
                <Detail label="Língua" value={word.languageCode} />
                {word.approvedAt && <Detail label="Publicado em" value={formatDateTime(word.approvedAt)} />}
              </dl>
            )}
          </div>
        </div>

        <aside className="border-t border-border bg-muted/20 p-5 lg:border-l lg:border-t-0">
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Resumo
            </p>
            <dl className="space-y-3 text-sm">
              <Detail label="Classe" value={getGrammaticalCategoryLabel(word.grammaticalCategory)} />
              <Detail label="Subclasse" value={getGrammaticalSubcategoryLabel(word.grammaticalCategory, word.grammaticalSubcategory)} />
              <Detail label="Divisão silábica" value={word.syllabicDivision} />
              <Detail label="Pronúncia" value={word.pronunciation} />
              <Detail label="Língua" value={word.languageCode} />
            </dl>
          </div>
        </aside>
      </div>
    </article>
  )
}

function MediaPanel({ word }: { word: PublicEntry }) {
  if (!word.audioUrl && !word.imageUrl && !word.videoUrl) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Nenhuma mídia associada a esta entrada.
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {word.audioUrl && (
        <div className="rounded-xl border border-border p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Volume2 className="h-4 w-4" />
            Áudio
          </p>
          <audio controls src={word.audioUrl} className="w-full" />
        </div>
      )}
      {word.imageUrl && (
        <div className="rounded-xl border border-border p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <ImageIcon className="h-4 w-4" />
            Imagem
          </p>
          <img src={word.imageUrl} alt={word.entry} className="max-h-80 w-full rounded-lg object-cover" />
        </div>
      )}
      {word.videoUrl && (
        <div className="rounded-xl border border-border p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Video className="h-4 w-4" />
            Vídeo
          </p>
          {isYoutube(word.videoUrl) ? (
            <iframe src={youtubeEmbed(word.videoUrl)} className="aspect-video w-full rounded-lg" allowFullScreen />
          ) : (
            <video src={word.videoUrl} controls className="aspect-video w-full rounded-lg object-cover" />
          )}
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-foreground">{value || "-"}</dd>
    </div>
  )
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return ""
  }

  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function isYoutube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be")
}

function youtubeEmbed(url: string) {
  return url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
}
