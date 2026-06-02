interface PageHeroProps {
  badge?: string
  title: string
  subtitle?: string
  stats?: { value: string; label: string }[]
  tone?: "soft" | "ice" | "paper"
}

const toneClass = {
  soft: "section-soft",
  ice: "section-ice",
  paper: "section-paper",
}

export function PageHero({ badge, title, subtitle, stats = [], tone = "ice" }: PageHeroProps) {
  return (
    <section className={`relative overflow-hidden border-b border-border/50 ${toneClass[tone]}`}>
      <div className="texture-hero-corner pointer-events-none absolute -left-20 -top-20 h-72 w-80" />
      <div className="texture-hero-corner pointer-events-none absolute -bottom-24 -right-20 h-80 w-88 rotate-180" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(115deg,transparent,rgba(0,94,234,0.08))]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: "linear-gradient(90deg, currentColor 1px, transparent 1px), linear-gradient(0deg, currentColor 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:px-8 md:py-18 lg:grid-cols-[1fr_0.72fr] lg:px-12 lg:text-left">
        <div className="max-w-3xl text-center lg:text-left">
          {badge && (
            <p className="mb-4 inline-flex rounded-md border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              {badge}
            </p>
          )}
          <h1 className="text-4xl font-extrabold tracking-tight text-balance md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground text-balance lg:mx-0 mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          {stats.length > 0 ? (
            <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {stats.map((s, index) => (
                <div
                  key={s.label}
                  className="animate-slide-up rounded-md border border-blue-100/80 bg-white/78 p-4 text-left shadow-sm backdrop-blur"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <p className="text-2xl font-extrabold text-primary tabular-nums">{s.value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="hidden h-36 w-full max-w-md rounded-md border border-dashed border-primary/20 bg-white/45 backdrop-blur lg:block" />
          )}
        </div>
      </div>
    </section>
  )
}
