import Link from "next/link"

/** Cabeçalho compacto das colecções: título, uma linha de contexto e o total real. */
export function CollectionHeader({
  title,
  subtitle,
  total,
  unit,
}: {
  title: string
  subtitle?: string
  total: string
  unit: string
}) {
  return (
    <section className="border-b border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8 md:py-8 lg:px-12">
        <nav aria-label="Localização" className="mb-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary">Início</Link> / <span>{title}</span>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
          <p className="text-sm text-muted-foreground">
            <span className="text-lg font-bold text-foreground">{total}</span> {unit}
          </p>
        </div>
        {subtitle && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">{subtitle}</p>}
      </div>
    </section>
  )
}
