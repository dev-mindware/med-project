import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, TrendingUp, Star } from "lucide-react"
import Link from "next/link"

export function FeaturedWords() {
  const categories = [
    {
      title: "Palavras Mais Pesquisadas",
      icon: TrendingUp,
      words: [
        { word: "Ubuntu", class: "substantivo", definition: "Filosofia africana de humanidade e solidariedade" },
        {
          word: "Cacimbo",
          class: "substantivo",
          definition: "Estação seca em Angola, caracterizada por neblina matinal",
        },
        { word: "Kimbo", class: "substantivo", definition: "Aldeia ou povoação tradicional angolana" },
        { word: "Muxima", class: "substantivo", definition: "Coração, centro espiritual na cultura angolana" },
      ],
    },
    {
      title: "Palavras Angolanas",
      icon: Star,
      words: [
        { word: "Bué", class: "advérbio", definition: "Muito, bastante (expressão popular angolana)" },
        { word: "Zungueira", class: "substantivo", definition: "Vendedora ambulante nos mercados de Angola" },
        { word: "Candonga", class: "substantivo", definition: "Mercado informal, comércio paralelo" },
        { word: "Gasosa", class: "substantivo", definition: "Refrigerante, bebida gaseificada" },
      ],
    },
    {
      title: "Termos Gramaticais",
      icon: BookOpen,
      words: [
        {
          word: "Predicado",
          class: "substantivo",
          definition: "Termo essencial da oração que expressa algo sobre o sujeito",
        },
        {
          word: "Complemento",
          class: "substantivo",
          definition: "Termo que completa o sentido de verbos, nomes ou adjetivos",
        },
        {
          word: "Adjunto",
          class: "substantivo",
          definition: "Termo acessório que modifica ou especifica outros termos",
        },
        { word: "Aposto", class: "substantivo", definition: "Termo que explica, especifica ou resume outro termo" },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Palavras em Destaque</h2>
        <p className="text-muted-foreground">
          Explore as palavras mais pesquisadas e termos únicos da língua portuguesa
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {categories.map((category, categoryIndex) => {
          const Icon = category.icon
          return (
            <Card key={categoryIndex} className="h-fit">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.words.map((word, wordIndex) => (
                  <div
                    key={wordIndex}
                    className="space-y-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-primary">{word.word}</h4>
                      <Badge variant="outline" className="text-xs">
                        {word.class}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{word.definition}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                  <Link href="/dictionary">Ver mais palavras</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
