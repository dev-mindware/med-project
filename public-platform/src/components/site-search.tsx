"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { publicApi, type PublicSuggestion } from "@/lib/public-api"

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))
}

function groupByType(items: PublicSuggestion[]) {
  const groups = new Map<string, PublicSuggestion[]>()
  items.forEach((item) => groups.set(item.type, [...(groups.get(item.type) ?? []), item]))
  return [...groups.entries()]
}

/** Uma só instância por página: regista os atalhos «/» e Ctrl+K. */
export function SiteSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<PublicSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const requestId = useRef(0)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const ctrlK = event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey)
      const slash = event.key === "/" && !isTyping(event.target)
      if (ctrlK || slash) {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }
    const id = ++requestId.current
    const controller = new AbortController()
    setLoading(true)
    const timer = setTimeout(() => {
      publicApi
        .suggest(q, { signal: controller.signal })
        .then((items) => id === requestId.current && setSuggestions(items))
        .catch(() => id === requestId.current && setSuggestions([]))
        .finally(() => id === requestId.current && setLoading(false))
    }, 200)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const go = (href: string) => {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  const q = query.trim()

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Pesquisar no portal"
        className="hidden h-11 w-56 justify-start gap-2 rounded-md px-3 text-sm font-normal text-muted-foreground shadow-none lg:flex xl:w-72"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Pesquisar vocábulos…</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium xl:inline">/</kbd>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Pesquisar no portal" className="h-10 w-10 rounded-md lg:hidden">
        <Search className="h-5 w-5" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Pesquisar no portal"
        description="Escreva um vocábulo, topónimo ou antropónimo."
        shouldFilter={false}
      >
        <CommandInput value={query} onValueChange={setQuery} placeholder="Pesquisar vocábulos, topónimos, nomes…" />
        <CommandList>
          {q.length >= 2 && (
            <CommandGroup>
              <CommandItem value={`todos-${q}`} onSelect={() => go(`/pesquisar?q=${encodeURIComponent(q)}`)}>
                <Search className="h-4 w-4" />
                Ver todos os resultados para «{q}»
              </CommandItem>
            </CommandGroup>
          )}
          {q.length >= 2 && !loading && suggestions.length === 0 && <CommandEmpty>Sem sugestões para «{q}».</CommandEmpty>}
          {q.length < 2 && <CommandEmpty>Escreva pelo menos 2 letras.</CommandEmpty>}
          {groupByType(suggestions).map(([type, items]) => (
            <CommandGroup key={type} heading={type}>
              {items.map((item) => (
                <CommandItem key={`${type}-${item.id}`} value={`${type}-${item.id}`} onSelect={() => go(item.url)}>
                  <span className="font-medium">{item.label}</span>
                  {item.meta && <span className="ml-2 text-xs text-muted-foreground">{item.meta}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
