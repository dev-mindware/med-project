"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Video, Users, Award, Calendar, MessageSquare, BookOpen, Mic, ArrowRight } from "lucide-react"

const photoCategories = [
  {
    name: "Conferências",
    icon: Users,
    count: 45,
    description: "Registos fotográficos de conferências e encontros académicos internacionais",
    recent: "Conferência Nacional 2024",
    color: "from-blue-500/15 to-blue-600/5",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
  {
    name: "Workshops",
    icon: Award,
    count: 32,
    description: "Momentos de formação e capacitação de professores e investigadores",
    recent: "Workshop de Gramática",
    color: "from-emerald-500/15 to-emerald-600/5",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
  {
    name: "Lançamentos",
    icon: Calendar,
    count: 18,
    description: "Cerimónias de lançamento de livros e materiais educativos",
    recent: "Lançamento do Dicionário",
    color: "from-orange-500/15 to-orange-600/5",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
  },
]

const videoCategories = [
  {
    name: "Seminários",
    icon: MessageSquare,
    count: 28,
    description: "Gravações completas de seminários, mesas redondas e debates académicos",
    recent: "Seminário CPLP 2024",
    color: "from-purple-500/15 to-purple-600/5",
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
  },
  {
    name: "Entrevistas",
    icon: Mic,
    count: 15,
    description: "Entrevistas com especialistas e membros da comissão nacional",
    recent: "Entrevista com o Presidente",
    color: "from-rose-500/15 to-rose-600/5",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-500/10",
  },
  {
    name: "Documentários",
    icon: BookOpen,
    count: 8,
    description: "Documentários sobre a história e evolução da língua portuguesa em Angola",
    recent: "História da Língua em Angola",
    color: "from-cyan-500/15 to-cyan-600/5",
    iconColor: "text-cyan-500",
    iconBg: "bg-cyan-500/10",
  },
]

interface Category {
  name: string
  icon: React.ElementType
  count: number
  description: string
  recent: string
  color: string
  iconColor: string
  iconBg: string
}

function CategoryCard({ cat, label }: { cat: Category; label: string }) {
  const Icon = cat.icon
  return (
    <div className={`group relative rounded-2xl bg-gradient-to-br ${cat.color} border border-border/50 p-5 hover:border-border transition-all duration-200 hover:shadow-md flex flex-col`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${cat.iconBg}`}>
          <Icon className={`h-5 w-5 ${cat.iconColor}`} />
        </div>
        <span className="text-xs font-semibold text-muted-foreground bg-background/60 px-2 py-1 rounded-full">
          {cat.count} {label}
        </span>
      </div>

      <h3 className="font-bold text-base mb-1.5">{cat.name}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{cat.description}</p>

      <div className="mt-4 pt-4 border-t border-border/40">
        <p className="text-xs text-muted-foreground mb-3">
          <span className="font-medium">Mais recente:</span> {cat.recent}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-between h-8 px-3 rounded-lg text-xs font-medium ${cat.iconColor} hover:bg-white/60 dark:hover:bg-white/10 group/btn`}
        >
          Ver {label.toLowerCase()}
          <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  )
}

export function MediaCategories() {
  const [tab, setTab] = useState<"photos" | "videos">("photos")

  return (
    <div className="max-w-4xl mx-auto">
      {/* Custom tab toggle */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex gap-1 bg-muted/60 rounded-xl p-1">
          <button
            onClick={() => setTab("photos")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === "photos"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Camera className="h-4 w-4" />
            Fotografias
          </button>
          <button
            onClick={() => setTab("videos")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === "videos"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Video className="h-4 w-4" />
            Vídeos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(tab === "photos" ? photoCategories : videoCategories).map((cat) => (
          <CategoryCard key={cat.name} cat={cat} label={tab === "photos" ? "fotos" : "vídeos"} />
        ))}
      </div>
    </div>
  )
}
