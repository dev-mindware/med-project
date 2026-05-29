import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Briefcase, Utensils, Music, Home } from "lucide-react"

export function VonaCategories() {
  const categories = [
    {
      name: "Topónimos",
      icon: MapPin,
      description: "Nomes de lugares, cidades, províncias e regiões de Angola",
      count: 1250,
      examples: ["Luanda", "Benguela", "Huambo", "Lobito"],
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    },
    {
      name: "Antropónimos",
      icon: Users,
      description: "Nomes próprios de pessoas, sobrenomes e apelidos angolanos",
      count: 890,
      examples: ["Nzinga", "Mandume", "Kalandula", "Muxima"],
      color: "bg-green-500/10 text-green-700 dark:text-green-300",
    },
    {
      name: "Profissões",
      icon: Briefcase,
      description: "Termos relacionados a profissões e atividades laborais",
      count: 320,
      examples: ["Zungueira", "Quitandeira", "Lavrador", "Pescador"],
      color: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
    },
    {
      name: "Gastronomia",
      icon: Utensils,
      description: "Pratos típicos, ingredientes e termos culinários angolanos",
      count: 180,
      examples: ["Muamba", "Calulu", "Funge", "Kissaca"],
      color: "bg-red-500/10 text-red-700 dark:text-red-300",
    },
    {
      name: "Cultura",
      icon: Music,
      description: "Termos culturais, tradições, música e festividades",
      count: 450,
      examples: ["Semba", "Kuduro", "Rebita", "Kazukuta"],
      color: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    },
    {
      name: "Vida Quotidiana",
      icon: Home,
      description: "Expressões do dia a dia, objetos e situações comuns",
      count: 680,
      examples: ["Bué", "Gasosa", "Candonga", "Kimbo"],
      color: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Categorias do VONA</h2>
        <p className="text-muted-foreground">
          Explore o vocabulário angolano organizado por contextos e áreas temáticas
        </p>
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
                      {category.count} entradas
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Exemplos:</h4>
                  <div className="flex flex-wrap gap-1">
                    {category.examples.map((example, exampleIndex) => (
                      <Badge key={exampleIndex} variant="secondary" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Explorar categoria
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
