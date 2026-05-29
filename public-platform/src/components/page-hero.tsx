interface PageHeroProps {
  badge?: string
  title: string
  subtitle?: string
  stats?: { value: string; label: string }[]
}

export function PageHero({ badge, title, subtitle, stats }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-background">
      {/* Dot-grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.055]"
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
            "radial-gradient(ellipse 60% 80% at 50% 0%, oklch(0.85 0.12 264 / 0.13) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-16 md:py-20 text-center">
        {badge && (
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">{badge}</p>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            {subtitle}
          </p>
        )}
        {stats && stats.length > 0 && (
          <div className="mt-10 inline-flex items-center justify-center divide-x divide-border">
            {stats.map((s) => (
              <div key={s.label} className="px-8 first:pl-0 last:pr-0 text-center">
                <p className="text-3xl font-extrabold text-foreground tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
