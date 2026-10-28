import Link from "next/link"
import type { PublicMeta } from "@/lib/public-api"

/** Paginação por ligações (renderizada no servidor, indexável). `hrefFor` constrói o URL de cada página. */
export function ListPagination({ meta, hrefFor }: { meta: PublicMeta; hrefFor: (page: number) => string }) {
  if (meta.totalPages <= 1) return null
  const linkClass = "rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-primary/10"
  return (
    <nav aria-label="Paginação" className="mt-10 flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">Página {meta.page} de {meta.totalPages}</p>
      <div className="flex gap-2">
        {meta.hasPreviousPage && <Link href={hrefFor(meta.page - 1)} rel="prev" className={linkClass}>Anterior</Link>}
        {meta.hasNextPage && <Link href={hrefFor(meta.page + 1)} rel="next" className={linkClass}>Seguinte</Link>}
      </div>
    </nav>
  )
}
