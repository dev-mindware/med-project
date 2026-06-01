import { ArrowRight, BookOpen, Globe2, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const highlights = [
  {
    icon: BookOpen,
    title: "Pesquisa e consulta",
    text: "Aceda a entradas lexicais, exemplos, etimologias e materiais de apoio ao ensino.",
  },
  {
    icon: Globe2,
    title: "Identidade angolana",
    text: "Explore topónimos, antropónimos e vocabulários que documentam o uso vivo da língua.",
  },
  {
    icon: Sparkles,
    title: "Publicações vivas",
    text: "Acompanhe artigos, eventos e novidades institucionais a partir da API pública.",
  },
]

export function HomeVisualSection() {
  return (
    <section className="section-ice overflow-hidden py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
        <div className="animate-slide-in-left">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Língua em movimento</p>
          <h2 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Um portal com memória, consulta e cultura no mesmo lugar.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A plataforma combina dados linguísticos, recursos educativos e conteúdos institucionais para tornar a consulta mais rica e mais visual.
          </p>

          <div className="mt-8 grid gap-4">
            {highlights.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex gap-4 rounded-lg border border-blue-100/80 bg-white/72 p-4 shadow-sm backdrop-blur">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <Button className="mt-8 rounded-md px-7 font-semibold" asChild>
            <Link href="/lexico">
              Explorar base lexical
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="relative min-h-[480px] animate-slide-in-right">
          <div className="absolute left-8 top-6 h-64 w-[58%] overflow-hidden rounded-lg shadow-2xl shadow-blue-950/18 animate-float-soft">
            <img src="/angolan-cultural-festival.jpg" alt="" className="h-full w-full object-cover" />
          </div>
          <div className="absolute right-0 top-28 h-72 w-[54%] overflow-hidden rounded-lg border-4 border-white shadow-2xl shadow-blue-950/16 animate-drift">
            <img src="/angolan-culture-traditional-dance.jpg" alt="" className="h-full w-full object-cover" />
          </div>
          <div className="absolute bottom-4 left-0 h-56 w-[48%] overflow-hidden rounded-lg border-4 border-white shadow-xl shadow-blue-950/14">
            <img src="/angolan-traditional-music.jpg" alt="" className="h-full w-full object-cover" />
          </div>

          <div className="absolute bottom-12 right-8 max-w-[250px] rounded-lg border border-white/70 bg-white/82 p-5 shadow-xl backdrop-blur-md">
            <p className="text-3xl font-extrabold text-primary">+26k</p>
            <p className="mt-1 text-sm font-semibold text-foreground">registos e conteúdos consultáveis</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Dados em atualização contínua para consulta pública.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
