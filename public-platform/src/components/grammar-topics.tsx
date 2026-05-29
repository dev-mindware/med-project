import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, Zap, Users, ArrowRight } from "lucide-react"

const topics = [
  {
    category: "Morfologia",
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    ghostColor: "text-blue-100 dark:text-blue-900/40",
    items: [
      { name: "Classes de Palavras", difficulty: "Básico", lessons: 8 },
      { name: "Formação de Palavras", difficulty: "Intermediário", lessons: 6 },
      { name: "Flexão Nominal", difficulty: "Intermediário", lessons: 5 },
      { name: "Flexão Verbal", difficulty: "Avançado", lessons: 12 },
    ],
  },
  {
    category: "Sintaxe",
    icon: FileText,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    ghostColor: "text-emerald-100 dark:text-emerald-900/40",
    items: [
      { name: "Análise Sintática", difficulty: "Básico", lessons: 10 },
      { name: "Concordância", difficulty: "Intermediário", lessons: 8 },
      { name: "Regência", difficulty: "Intermediário", lessons: 7 },
      { name: "Colocação Pronominal", difficulty: "Avançado", lessons: 6 },
    ],
  },
  {
    category: "Ortografia",
    icon: Zap,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    ghostColor: "text-orange-100 dark:text-orange-900/40",
    items: [
      { name: "Acentuação", difficulty: "Básico", lessons: 5 },
      { name: "Uso da Crase", difficulty: "Intermediário", lessons: 4 },
      { name: "Hífen", difficulty: "Intermediário", lessons: 3 },
      { name: "Pontuação", difficulty: "Básico", lessons: 6 },
    ],
  },
  {
    category: "Semântica",
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    ghostColor: "text-purple-100 dark:text-purple-900/40",
    items: [
      { name: "Significado das Palavras", difficulty: "Básico", lessons: 4 },
      { name: "Figuras de Linguagem", difficulty: "Intermediário", lessons: 8 },
      { name: "Vícios de Linguagem", difficulty: "Intermediário", lessons: 5 },
      { name: "Variações Linguísticas", difficulty: "Avançado", lessons: 6 },
    ],
  },
]

const difficultyStyle: Record<string, string> = {
  Básico: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Intermediário: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Avançado: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
}

export function GrammarTopics() {
  return (
    <div className="space-y-10">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Conteúdo</p>
        <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Tópicos Gramaticais</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Explore os diferentes aspectos da gramática portuguesa
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topics.map((cat) => {
          const Icon = cat.icon
          return (
            <div
              key={cat.category}
              className={`relative rounded-xl border bg-card overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 hover:border-current ${cat.color}`}
            >
              {/* Ghost watermark */}
              <Icon className={`absolute -bottom-3 -right-3 h-28 w-28 ${cat.ghostColor} transition-transform duration-500 group-hover:scale-105 group-hover:rotate-6 pointer-events-none`} />

              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-lg ${cat.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${cat.color}`} />
                  </div>
                  <h3 className="font-extrabold text-xl text-foreground">{cat.category}</h3>
                </div>

                {/* Topic rows */}
                <div className="space-y-2 mb-5">
                  {cat.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-lg bg-muted/40 hover:bg-muted/60 px-4 py-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-1.5 w-1.5 rounded-none rotate-45 ${cat.bg} ring-1 ring-current ${cat.color} shrink-0`} />
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${difficultyStyle[item.difficulty]}`}>
                          {item.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.lessons} lições</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full rounded-lg font-semibold group/btn">
                  Estudar {cat.category}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
