"use client"

import { Button } from "@/components/ui/button"
import { Search, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const stats = [
  { value: "15 000+", label: "Entradas no Dicionário" },
  { value: "8 900+", label: "Termos VONA" },
  { value: "500+", label: "Documentos Oficiais" },
]

const trust = [
  "Dicionário Nacional Actualizado",
  "Gramática Completa",
  "Vocabulário Ortográfico (VONA)",
]

export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-background text-center px-4 py-24">

      {/* Dot-grid background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 10%, oklch(0.85 0.12 264 / 0.18) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-7 max-w-4xl mx-auto w-full px-6 sm:px-8">

        {/* Badge */}
        <div className="flex items-center gap-2 rounded-full border border-border bg-background/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground shadow-sm">
          <span className="h-2 w-2 rounded-sm bg-primary" />
          Comissão Nacional · CN-IILP Angola
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-balance">
          <span className="text-foreground">Português Angolano,</span>
          <br />
          <span className="text-primary">da Palavra à Cultura</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-lg text-muted-foreground leading-relaxed text-balance">
          Portal oficial para preservação, ensino e desenvolvimento da língua portuguesa em Angola.
          Aceda ao dicionário, gramática, VONA e recursos educativos.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <Button
            size="lg"
            className="rounded-full px-8 h-12 font-semibold shadow-lg shadow-primary/25 min-w-[200px]"
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
            className="rounded-full px-8 h-12 font-semibold bg-transparent min-w-[160px]"
            asChild
          >
            <Link href="/about">
              Saiba Mais
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {trust.map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              {t}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-center divide-x divide-border">
          {stats.map((s) => (
            <div key={s.label} className="px-8 first:pl-0 last:pr-0 text-center">
              <p className="text-3xl font-extrabold text-foreground tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
