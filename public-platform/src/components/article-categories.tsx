import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap, Globe, Pen, History, Users } from "lucide-react"

export function ArticleCategories() {
  const categories = [
    {
      name: "Linguística",
      icon: Globe,
      description: "Estudos sobre a estrutura, evolução e variações da língua portuguesa",
      count: 45,
      recent: ["Variações Regionais", "Fonética Angolana", "Sintaxe Comparada"],
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    },
    {
      name: "Educação",
      icon: GraduationCap,
      description: "Metodologias de ensino e recursos pedagógicos para o português",
      count: 38,
      recent: ["Pedagogia Digital", "Avaliação Linguística", "Formação de Professores"],
      color: "bg-green-500/10 text-green-700 dark:text-green-300",
    },
    {
      name: "Literatura",
      icon: BookOpen,
      description: "Análises literárias e estudos sobre autores de língua portuguesa",
      count: 32,
      recent: ["Literatura Angolana", "Poesia Contemporânea", "Narrativas Orais"],
      color: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    },
    {
      name: "Lexicografia",
      icon: Pen,
      description: "Construção de dicionários e estudos terminológicos",
      count: 28,
      recent: ["Dicionário Técnico", "Terminologia Jurídica", "Neologismos"],
      color: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
    },
    {
      name: "História da Língua",
      icon: History,
      description: "Evolução histórica do português em Angola",
      count: 22,
      recent: ["Período Colonial", "Independência Linguística", "Influências Locais"],
      color: "bg-red-500/10 text-red-700 dark:text-red-300",
    },
    {
      name: "Sociolinguística",
      icon: Users,
      description: "Relação entre língua e sociedade no contexto angolano",
      count: 35,
      recent: ["Multilinguismo", "Identidade Cultural", "Políticas Linguísticas"],
      color: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Categorias de Artigos</h2>
        <p className="text-muted-foreground">Explore nossa biblioteca de conhecimento organizada por áreas temáticas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const Icon = category.icon
          return (
            <Card key={index} className="group hover:-translate-y-0.5 transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {category.count} artigos
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Temas recentes:</h4>
                  <ul className="space-y-1">
                    {category.recent.map((topic, topicIndex) => (
                      <li key={topicIndex} className="text-sm text-muted-foreground">
                        • {topic}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Explorar artigos
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
