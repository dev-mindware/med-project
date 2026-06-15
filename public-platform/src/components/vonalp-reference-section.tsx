import { BookMarked, GraduationCap } from "lucide-react"

export function VonalpReferenceSection() {
  return (
    <section className="section-ice border-y border-blue-100/70 py-10">
      <div className="mx-auto grid max-w-7xl gap-4 px-6 sm:px-8 lg:grid-cols-2 lg:px-12">
        <article className="rounded-lg border border-blue-100/80 bg-white/82 p-5 shadow-sm backdrop-blur">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BookMarked className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">VONALP</p>
          <h2 className="mt-2 text-xl font-bold">Vocabulário Ortográfico Nacional de Angola da Língua Portuguesa</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Apresenta vocábulos completos e publicados para consulta normativa.
          </p>
        </article>

        <article className="rounded-lg border border-blue-100/80 bg-white/82 p-5 shadow-sm backdrop-blur">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-700">
            <GraduationCap className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-700">VONALP-EP</p>
          <h2 className="mt-2 text-xl font-bold">Vocabulário Ortográfico Nacional de Angola da Língua Portuguesa - Ensino Primário</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Apresenta vocábulos validados para uso pedagógico no contexto do Ensino Primário.
          </p>
        </article>
      </div>
    </section>
  )
}
