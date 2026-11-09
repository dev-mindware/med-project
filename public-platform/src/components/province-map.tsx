"use client"

import { useState } from "react"
import { foldName, provinceTiles } from "@/lib/province-layout"

/**
 * Esquema em blocos (não à escala) das províncias de Angola, sombreado pelo número de
 * topónimos. Províncias que a API devolva e que não tenham bloco aparecem como chips.
 */
export function ProvinceMap({
  counts,
  value,
  onChange,
}: {
  counts: Record<string, number>
  value?: string
  onChange: (province: string | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const byKey = new Map(Object.entries(counts).map(([name, count]) => [foldName(name), { name, count }]))
  const max = Math.max(1, ...Object.values(counts))
  const placed = new Set<string>()

  const tiles = provinceTiles.map((tile) => {
    const entry = [tile.key, ...(tile.aliases ?? [])].map((key) => byKey.get(key)).find(Boolean)
    if (entry) placed.add(foldName(entry.name))
    return { ...tile, name: entry?.name ?? tile.label, count: entry?.count ?? 0 }
  })
  const others = [...byKey.entries()].filter(([key]) => !placed.has(key)).map(([, entry]) => entry)

  const select = (name: string, count: number) => {
    if (count === 0) return
    onChange(value === name ? undefined : name)
  }

  return (
    <section aria-label="Topónimos por província" className="rounded-md border border-blue-100/80 bg-white/86 p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-3 lg:mb-3">
        <h2 className="text-sm font-bold">Por província</h2>
        <p className="hidden text-xs text-muted-foreground lg:block">Esquema em blocos, não à escala</p>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="text-sm font-medium text-primary lg:hidden"
        >
          {open ? "Esconder mapa" : value ? `Mapa (${value})` : "Ver mapa"}
        </button>
      </div>
      <div className={`${open ? "mt-3 grid" : "hidden"} grid-cols-7 gap-1.5 lg:grid`} role="group" aria-label="Províncias">
        {tiles.map((tile) => {
          const active = value === tile.name
          const intensity = tile.count / max
          return (
            <button
              key={tile.key}
              type="button"
              disabled={tile.count === 0}
              aria-pressed={active}
              onClick={() => select(tile.name, tile.count)}
              style={{ gridRow: tile.row + 1, gridColumn: tile.col + 1, backgroundColor: active ? undefined : `rgba(0, 94, 234, ${0.06 + intensity * 0.5})` }}
              className={`flex min-h-12 flex-col items-center justify-center rounded-md border px-1 py-1 text-center text-[10px] leading-tight sm:min-h-14 sm:text-xs ${
                active ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground"
              } ${tile.count === 0 ? "cursor-not-allowed opacity-50" : "hover:border-primary"}`}
            >
              <span className="font-semibold">{tile.label}</span>
              <span className={active ? "" : "text-muted-foreground"}>{tile.count}</span>
            </button>
          )
        })}
      </div>
      {others.length > 0 && (
        <div className={`${open ? "flex" : "hidden"} mt-3 flex-wrap gap-1.5 lg:flex`}>
          {others.map(({ name, count }) => (
            <button
              key={name}
              type="button"
              aria-pressed={value === name}
              onClick={() => select(name, count)}
              className={`rounded-md border px-2 py-1 text-xs ${value === name ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-primary/10"}`}
            >
              {name} ({count})
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
