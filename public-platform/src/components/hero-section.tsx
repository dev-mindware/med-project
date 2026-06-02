import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Search } from "lucide-react"
import Link from "next/link"

type HeroStat = {
  value: string
  label: string
}

const trust = [
  "Conteúdos aprovados pela Comissão",
  "Topónimos e Antropónimos",
  "Vocabulários ortográficos nacionais",
]

const heroImages = [
  "/angolan-cultural-festival.jpg",
  "/angolan-culture-traditional-dance.jpg",
  "/damian-patkowski-T-LfvX-7IVg-unsplash.jpg",
  "/ninno-jackjr-CG6Gd__QIOY-unsplash.jpg",
]

export function HeroSection({ stats = [] }: { stats?: HeroStat[] }) {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-slate-950 text-center px-4 py-24">
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-0"
            style={{
              animation: "heroImageFade 28s ease-in-out infinite",
              animationDelay: `${index * 7}s`,
            }}
          />
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.72) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,25,63,0.9),rgba(0,94,234,0.48),rgba(4,18,43,0.78))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_20%,rgba(255,255,255,0.22),transparent_70%)]" />

      <div className="relative z-10 flex flex-col items-center gap-7 max-w-4xl mx-auto w-full px-6 sm:px-8">
        <div className="flex items-center gap-2 rounded-lg border border-white/25 bg-white/12 backdrop-blur-md px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 shadow-sm">
          <span className="h-2 w-2 rounded-sm bg-white" />
          Comissão Nacional - CN-IILP Angola
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-balance">
          <span className="text-white">Português Angolano,</span>
          <br />
          <span className="text-blue-100">da Palavra à Cultura</span>
        </h1>

        <p className="max-w-xl text-lg text-white/78 leading-relaxed text-balance">
          Portal oficial para preservação, ensino e desenvolvimento da língua portuguesa em Angola.
          Consulte conteúdos institucionais aprovados para acesso público.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <Button
            size="lg"
            className="rounded-md px-8 h-12 font-semibold bg-white text-primary shadow-lg shadow-black/20 min-w-[200px] hover:bg-blue-50"
            asChild
          >
            <Link href="/dictionary">
              <Search className="mr-2 h-4 w-4" />
              Consultar Dicionário
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-md px-8 h-12 font-semibold border-white/35 bg-white/10 text-white min-w-[160px] backdrop-blur-sm hover:bg-white hover:text-primary"
            asChild
          >
            <Link href="/neologismos">
              Explorar Neologismos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80">
          {trust.map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-100 shrink-0" />
              {t}
            </span>
          ))}
        </div>

        {stats.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-y-4 divide-x divide-white/20">
            {stats.map((s) => (
              <div key={s.label} className="px-8 first:pl-0 last:pr-0 text-center">
                <p className="text-3xl font-extrabold text-white tabular-nums">{s.value}</p>
                <p className="text-xs text-white/65 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
