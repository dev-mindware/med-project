"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getGrammaticalCategoryLabel, getGrammaticalSubcategoryLabel } from "@/lib/grammatical-labels"
import {
  publicApi,
  type PublicAnthroponym,
  type PublicEntry,
  type PublicFilters,
  type PublicForeignism,
  type PublicNeologism,
  type PublicPaginated,
  type PublicToponym,
  type PublicVonalpTerm,
  type PublicVolnaTerm,
} from "@/lib/public-api"

type FlipbookCollection = "dictionary" | "neologisms" | "foreignisms" | "toponyms" | "anthroponyms" | "vonalp" | "vonalpEp" | "volna"
type FlipbookItem = PublicEntry | PublicNeologism | PublicForeignism | PublicToponym | PublicAnthroponym | PublicVonalpTerm | PublicVolnaTerm
type DragState = {
  side: "next" | "previous"
  startX: number
  currentX: number
}

const PAGE_SIZE = 2

const collectionLabels: Record<FlipbookCollection, string> = {
  dictionary: "Dicionário",
  neologisms: "Neologismos",
  foreignisms: "Estrangeirismos",
  toponyms: "Topónimos",
  anthroponyms: "Antropónimos",
  vonalp: "VONALP",
  vonalpEp: "VONALP-EP",
  volna: "VOLNA",
}

export function LexicalFlipbook({
  collection,
  initialData,
}: {
  collection: FlipbookCollection
  initialData: PublicPaginated<FlipbookItem>
}) {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(initialData.meta.page || 1)
  const [data, setData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [direction, setDirection] = useState<"next" | "previous">("next")
  const [drag, setDrag] = useState<DragState | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Cache and transition states
  const [pageCache, setPageCache] = useState<Record<number, PublicPaginated<FlipbookItem>>>({
    [initialData.meta.page || 1]: initialData
  })
  const [transitionState, setTransitionState] = useState<{
    direction: "next" | "previous"
    outgoingData: PublicPaginated<FlipbookItem>
    incomingData: PublicPaginated<FlipbookItem>
    isDragging: boolean
    progress: number
  } | null>(null)

  const didMount = useRef(false)

  // Clear cache and load page 1 on query change
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }

    const timeout = window.setTimeout(() => {
      void loadPage(1, "next", query)
    }, 320)

    return () => window.clearTimeout(timeout)
  }, [query])

  // Cache prefetching of adjacent pages
  useEffect(() => {
    // Store current page in cache just in case
    setPageCache((prev) => ({ ...prev, [page]: data }))

    const prefetchPages = async () => {
      const totalPages = data.meta.totalPages
      if (!totalPages) return

      const fetchPage = async (p: number) => {
        if (p < 1 || p > totalPages || pageCache[p]) return
        try {
          const response = await fetchCollection(collection, {
            q: query.trim() || undefined,
            page: p,
            limit: PAGE_SIZE,
          })
          setPageCache((prev) => ({ ...prev, [p]: response }))
        } catch {
          // Ignore prefetch failures
        }
      }

      if (page + 1 <= totalPages) {
        void fetchPage(page + 1)
      }
      if (page - 1 >= 1) {
        void fetchPage(page - 1)
      }
    }

    void prefetchPages()
  }, [page, query, data.meta.totalPages])

  async function loadPage(nextPage: number, nextDirection: "next" | "previous", nextQuery = query) {
    setIsLoading(true)
    setDirection(nextDirection)

    try {
      const response = await fetchCollection(collection, {
        q: nextQuery.trim() || undefined,
        page: nextPage,
        limit: PAGE_SIZE,
      })
      setData(response)
      setPage(response.meta.page)
      
      // If query changed, reset cache. Otherwise keep it.
      if (nextQuery !== query) {
        setPageCache({ [response.meta.page]: response })
      } else {
        setPageCache((prev) => ({ ...prev, [response.meta.page]: response }))
      }
      
      setDrag(null)
      setTransitionState(null)
    } catch {
      setData({ data: [], meta: { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0, hasNextPage: false, hasPreviousPage: false } })
      setPage(1)
      setPageCache({})
      setDrag(null)
      setTransitionState(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePageChange(targetPage: number, nextDirection: "next" | "previous") {
    if (isLoading || transitionState) return
    if (targetPage < 1 || targetPage > (data.meta.totalPages || 1)) return

    if (pageCache[targetPage]) {
      const cached = pageCache[targetPage]
      
      setTransitionState({
        direction: nextDirection,
        outgoingData: data,
        incomingData: cached,
        isDragging: false,
        progress: 0,
      })

      // Start transition animation in the next tick
      setTimeout(() => {
        setTransitionState((prev) => (prev ? { ...prev, progress: 1 } : null))
      }, 25)

      // Finalize page change
      setTimeout(() => {
        setData(cached)
        setPage(targetPage)
        setTransitionState(null)
      }, 520)
    } else {
      setIsLoading(true)
      try {
        const response = await fetchCollection(collection, {
          q: query.trim() || undefined,
          page: targetPage,
          limit: PAGE_SIZE,
        })
        setPageCache((prev) => ({ ...prev, [targetPage]: response }))

        setTransitionState({
          direction: nextDirection,
          outgoingData: data,
          incomingData: response,
          isDragging: false,
          progress: 0,
        })

        setTimeout(() => {
          setTransitionState((prev) => (prev ? { ...prev, progress: 1 } : null))
        }, 25)

        setTimeout(() => {
          setData(response)
          setPage(targetPage)
          setTransitionState(null)
        }, 520)
      } catch {
        // Ignore error
      } finally {
        setIsLoading(false)
      }
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (isLoading || transitionState) return

    // Do not initiate drag if user clicked an interactive element (input, button, links, etc.)
    if ((event.target as HTMLElement).closest("button, input, a, [role='button']")) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const halfWidth = rect.width / 2
    const side = x > halfWidth ? "next" : "previous"

    if (side === "next" && !data.meta.hasNextPage) return
    if (side === "previous" && !data.meta.hasPreviousPage) return

    const targetPage = side === "next" ? page + 1 : page - 1
    const incoming = pageCache[targetPage]
    if (!incoming) return // wait for preload

    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({ side, startX: event.clientX, currentX: event.clientX })
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag) return

    const deltaX = event.clientX - drag.startX
    const absDelta = Math.abs(deltaX)

    // Trigger transition state once moved past a 10px threshold
    if (!transitionState && absDelta > 10) {
      const targetPage = drag.side === "next" ? page + 1 : page - 1
      const incoming = pageCache[targetPage]
      if (incoming) {
        setTransitionState({
          direction: drag.side,
          outgoingData: data,
          incomingData: incoming,
          isDragging: true,
          progress: 0,
        })
      }
    }

    if (transitionState) {
      let progress = 0
      if (drag.side === "next") {
        progress = Math.min(Math.max(-deltaX / 280, 0), 1)
      } else {
        progress = Math.min(Math.max(deltaX / 280, 0), 1)
      }
      setTransitionState((prev) => (prev ? { ...prev, progress } : null))
      setDrag((current) => (current ? { ...current, currentX: event.clientX } : current))
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!drag) return

    event.currentTarget.releasePointerCapture(event.pointerId)

    if (!transitionState) {
      setDrag(null)
      return
    }

    const progress = transitionState.progress
    const shouldTurn = progress > 0.22
    const targetPage = transitionState.direction === "next" ? page + 1 : page - 1

    setDrag(null)

    if (shouldTurn) {
      setTransitionState((prev) => (prev ? { ...prev, isDragging: false, progress: 1 } : null))
      setTimeout(() => {
        setData(transitionState.incomingData)
        setPage(targetPage)
        setTransitionState(null)
      }, 500)
    } else {
      setTransitionState((prev) => (prev ? { ...prev, isDragging: false, progress: 0 } : null))
      setTimeout(() => {
        setTransitionState(null)
      }, 500)
    }
  }

  function renderBookPage(
    item: FlipbookItem | null,
    pageNo: number,
    side: "left" | "right",
    extraClasses = "",
    style?: React.CSSProperties
  ) {
    return (
      <article
        className={`flipbook-page flipbook-page-${side} ${extraClasses}`}
        style={style}
      >
        <div className="flipbook-page-texture" />
        <div className="flipbook-page-curl" />
        <div className="flipbook-page-content">
          {item ? (
            <>
              <div className="mb-8 flex items-start justify-between gap-4 border-b border-blue-100/80 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">{collectionLabels[collection]}</p>
                  <h2 className="mt-2 text-4xl font-extrabold leading-tight text-foreground">{itemTitle(item, collection)}</h2>
                </div>
                <span className="rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {pageNo}
                </span>
              </div>

              <div className="space-y-5">
                <p className="text-base leading-8 text-muted-foreground">{itemDefinition(item, collection)}</p>
                {itemExample(item, collection) && (
                  <blockquote className="border-l-2 border-primary/35 pl-4 text-sm italic leading-7 text-foreground/75">
                    "{itemExample(item, collection)}"
                  </blockquote>
                )}
                <div className="flex flex-wrap gap-2 pt-2">{itemBadges(item, collection)}</div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-center text-sm italic text-muted-foreground/70">
              Fim desta página do acervo.
            </div>
          )}
        </div>
      </article>
    )
  }

  const visiblePages: Array<FlipbookItem | null> = data.data.length === 1 ? [data.data[0], null] : data.data
  const targetPageNum = transitionState ? (transitionState.direction === "next" ? page + 1 : page - 1) : page

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-lg border border-blue-100/80 bg-white/86 p-4 shadow-sm backdrop-blur">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-center gap-2 rounded-md border border-blue-100/80 bg-background/88 px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Pesquisar em ${collectionLabels[collection]}...`}
              className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{data.meta.total.toLocaleString("pt-PT")}</span> registos
          </p>
        </div>
        {isLoading && <p className="mt-3 text-xs font-medium text-muted-foreground">A actualizar páginas...</p>}
      </div>

      <div className="flipbook-stage">
        {data.data.length > 0 ? (
          <div
            ref={containerRef}
            className="flipbook-cover"
            style={{ touchAction: drag ? "none" : "auto" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div className="flipbook-spine" />
            {transitionState ? (
              <div className="flipbook-spread is-animating">
                {/* Static Left Page */}
                {renderBookPage(
                  transitionState.direction === "next"
                    ? transitionState.outgoingData.data[0]
                    : (transitionState.incomingData.data[0] || null),
                  transitionState.direction === "next"
                    ? (page - 1) * PAGE_SIZE + 1
                    : (targetPageNum - 1) * PAGE_SIZE + 1,
                  "left"
                )}

                {/* Static Right Page */}
                {renderBookPage(
                  transitionState.direction === "next"
                    ? (transitionState.incomingData.data[1] || null)
                    : (transitionState.outgoingData.data[1] || null),
                  transitionState.direction === "next"
                    ? (targetPageNum - 1) * PAGE_SIZE + 2
                    : (page - 1) * PAGE_SIZE + 2,
                  "right"
                )}

                {/* Dynamic shadows */}
                <div
                  className="flipbook-shadow-overlay flipbook-shadow-left"
                  style={{
                    opacity: transitionState.direction === "next"
                      ? transitionState.progress * 0.5
                      : (1 - transitionState.progress) * 0.5,
                  }}
                />
                <div
                  className="flipbook-shadow-overlay flipbook-shadow-right"
                  style={{
                    opacity: transitionState.direction === "next"
                      ? (1 - transitionState.progress) * 0.5
                      : transitionState.progress * 0.5,
                  }}
                />

                {/* Flipping page */}
                <div
                  className={`flipbook-flipping-page flipbook-flipping-page-${transitionState.direction === "next" ? "right" : "left"}`}
                  style={{
                    transform: `rotateY(${
                      transitionState.direction === "next"
                        ? -transitionState.progress * 180
                        : transitionState.progress * 180
                    }deg)`,
                    transition: transitionState.isDragging ? "none" : "transform 0.5s cubic-bezier(0.2, 1, 0.3, 1)",
                  }}
                >
                  {/* Front Face */}
                  <div className="flipbook-page-front">
                    {renderBookPage(
                      transitionState.direction === "next"
                        ? (transitionState.outgoingData.data[1] || null)
                        : (transitionState.outgoingData.data[0] || null),
                      transitionState.direction === "next"
                        ? (page - 1) * PAGE_SIZE + 2
                        : (page - 1) * PAGE_SIZE + 1,
                      transitionState.direction === "next" ? "right" : "left"
                    )}
                  </div>

                  {/* Back Face */}
                  <div className="flipbook-page-back">
                    {renderBookPage(
                      transitionState.direction === "next"
                        ? (transitionState.incomingData.data[0] || null)
                        : (transitionState.incomingData.data[1] || null),
                      transitionState.direction === "next"
                        ? (targetPageNum - 1) * PAGE_SIZE + 1
                        : (targetPageNum - 1) * PAGE_SIZE + 2,
                      transitionState.direction === "next" ? "left" : "right"
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flipbook-spread">
                {/* Left Page (idle) */}
                {renderBookPage(
                  visiblePages[0],
                  (page - 1) * PAGE_SIZE + 1,
                  "left",
                  drag?.side === "previous" ? "is-dragging" : ""
                )}

                {/* Right Page (idle) */}
                {renderBookPage(
                  visiblePages[1],
                  (page - 1) * PAGE_SIZE + 2,
                  "right",
                  drag?.side === "next" ? "is-dragging" : ""
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="md:col-span-2 rounded-lg border border-dashed border-primary/25 bg-white/72 p-12 text-center">
            <h3 className="text-lg font-bold">Nenhum registo encontrado</h3>
            <p className="mt-2 text-sm text-muted-foreground">Ajuste a pesquisa para continuar a navegar pelo acervo.</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          className="rounded-md bg-transparent"
          disabled={!data.meta.hasPreviousPage || isLoading}
          onClick={() => handlePageChange(Math.max(page - 1, 1), "previous")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <span className="rounded-md border border-blue-100/80 bg-white/80 px-4 py-2 text-sm text-muted-foreground">
          Página {data.meta.page} de {Math.max(data.meta.totalPages, 1)}
        </span>
        <Button
          variant="outline"
          className="rounded-md bg-transparent"
          disabled={!data.meta.hasNextPage || isLoading}
          onClick={() => handlePageChange(page + 1, "next")}
        >
          Seguinte
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function fetchCollection(collection: FlipbookCollection, filters: PublicFilters) {
  if (collection === "dictionary") return publicApi.dictionary(filters) as Promise<PublicPaginated<FlipbookItem>>
  if (collection === "neologisms") return publicApi.neologisms(filters) as Promise<PublicPaginated<FlipbookItem>>
  if (collection === "foreignisms") return publicApi.foreignisms(filters) as Promise<PublicPaginated<FlipbookItem>>
  if (collection === "toponyms") return publicApi.toponyms(filters) as Promise<PublicPaginated<FlipbookItem>>
  if (collection === "anthroponyms") return publicApi.anthroponyms(filters) as Promise<PublicPaginated<FlipbookItem>>
  if (collection === "volna") return publicApi.volna(filters) as Promise<PublicPaginated<FlipbookItem>>
  if (collection === "vonalpEp") return publicApi.vonalpEp(filters) as Promise<PublicPaginated<FlipbookItem>>
  return publicApi.vonalp(filters) as Promise<PublicPaginated<FlipbookItem>>
}

function itemTitle(item: FlipbookItem, collection: FlipbookCollection) {
  if (collection === "foreignisms") return (item as PublicForeignism).term
  if (collection === "toponyms") return (item as PublicToponym).toponym
  if (collection === "anthroponyms") return (item as PublicAnthroponym).name
  if (collection === "volna") return (item as PublicVolnaTerm).term
  if (collection === "vonalp" || collection === "vonalpEp") return (item as PublicVonalpTerm).term
  return (item as PublicEntry).entry
}

function itemDefinition(item: FlipbookItem, collection: FlipbookCollection) {
  if (collection === "foreignisms") {
    const foreignism = item as PublicForeignism
    return foreignism.definition || foreignism.meaning || "Definição não disponível."
  }
  if (collection === "toponyms") return (item as PublicToponym).meaning || "Significado não disponível."
  if (collection === "anthroponyms") return (item as PublicAnthroponym).meaning || "Significado não disponível."
  if (collection === "volna") return (item as PublicVolnaTerm).definition || "Definição não disponível."
  const entry = item as PublicEntry | PublicVonalpTerm
  return entry.firstDefinition || entry.secondDefinition || entry.thirdDefinition || "Definição não disponível."
}

function itemExample(item: FlipbookItem, collection: FlipbookCollection) {
  if (collection === "foreignisms") return (item as PublicForeignism).usageExample
  if (collection === "volna") return (item as PublicVolnaTerm).usageExample
  if (collection === "dictionary" || collection === "neologisms") return (item as PublicEntry).usageExample
  return null
}

function itemBadges(item: FlipbookItem, collection: FlipbookCollection) {
  const badges: Array<string | null | undefined> = []

  if (collection === "foreignisms") {
    const foreignism = item as PublicForeignism
    badges.push(foreignism.originalLanguage && `Origem: ${foreignism.originalLanguage}`, foreignism.originCountry, foreignism.field)
  } else if (collection === "toponyms") {
    const toponym = item as PublicToponym
    badges.push(toponym.province, toponym.municipality, toponym.gentilic && `Gentílico: ${toponym.gentilic}`)
  } else if (collection === "anthroponyms") {
    const anthroponym = item as PublicAnthroponym
    badges.push(anthroponym.gender, anthroponym.surname && `Sobrenome: ${anthroponym.surname}`)
  } else if (collection === "volna") {
    const term = item as PublicVolnaTerm
    badges.push(
      `Língua: ${term.language}`,
      getGrammaticalCategoryLabel(term.grammaticalCategory),
      getGrammaticalSubcategoryLabel(term.grammaticalCategory, term.grammaticalSubcategory),
    )
  } else {
    const entry = item as PublicEntry | PublicVonalpTerm
    badges.push(
      getGrammaticalCategoryLabel(entry.grammaticalCategory),
      getGrammaticalSubcategoryLabel(entry.grammaticalCategory, entry.grammaticalSubcategory),
      "syllabicDivision" in entry ? entry.syllabicDivision : null,
    )
    if (collection === "vonalp" || collection === "vonalpEp") {
      badges.push(`Origem: ${vonalpOrigin(entry as PublicVonalpTerm)}`)
    }
  }

  return badges
    .filter((badge): badge is string => Boolean(badge))
    .map((badge) => (
      <Badge key={badge} variant="outline" className="rounded-md bg-white/70">
        {badge}
      </Badge>
    ))
}

function vonalpOrigin(term: PublicVonalpTerm) {
  if (term.sourceLabel) return term.sourceLabel
  if (term.sourceType === "ENTRY") return "Dicionário"
  if (term.sourceType === "TOPONYM") return "Topónimo"
  if (term.sourceType === "ANTHROPONYM") return "Antropónimo"
  if (term.sourceType === "FOREIGNISM") return "Estrangeirismo"
  return term.origin || "Acervo lexical"
}
