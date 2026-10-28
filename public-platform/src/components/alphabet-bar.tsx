"use client"

const LETTERS = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index))

/** Índice A-Z: contagens por letra (quando conhecidas) e filtro por letra inicial. */
export function AlphabetBar({
  counts,
  value,
  onChange,
}: {
  counts?: Record<string, number>
  value?: string
  onChange: (letter: string | undefined) => void
}) {
  return (
    <nav aria-label="Índice alfabético" className="-mx-1 overflow-x-auto px-1 pb-1">
      <ul className="flex min-w-max gap-1 lg:min-w-0 lg:flex-wrap">
        <li>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-pressed={!value}
            className={`h-9 rounded-md border px-3 text-sm font-medium ${!value ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-primary/10"}`}
          >
            Todas
          </button>
        </li>
        {LETTERS.map((letter) => {
          const count = counts?.[letter]
          const empty = counts !== undefined && !count
          const active = value?.toUpperCase() === letter
          return (
            <li key={letter}>
              <button
                type="button"
                disabled={empty}
                onClick={() => onChange(letter)}
                aria-pressed={active}
                aria-label={count !== undefined ? `${letter}, ${count} registos` : letter}
                title={count !== undefined ? `${count} registos` : undefined}
                className={`h-9 w-9 rounded-md border text-sm font-semibold ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : empty
                      ? "cursor-not-allowed border-transparent text-muted-foreground/40"
                      : "border-border hover:bg-primary/10"
                }`}
              >
                {letter}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
