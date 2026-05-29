"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Calendar, MapPin, Eye } from "lucide-react"

interface MediaItem {
  id: string
  title: string
  type: "photo" | "video"
  thumbnail: string
  date: string
  location: string
  category: string
  description: string
  views?: number
}

export function MediaGallery() {
  const [selectedCategory, setSelectedCategory] = useState("Todas")

  const mediaItems: MediaItem[] = [
    {
      id: "1",
      title: "Conferência Nacional de Língua Portuguesa 2024",
      type: "photo",
      thumbnail: "/conference-hall-gathering.png",
      date: "2024-03-15",
      location: "Luanda",
      category: "Conferências",
      description: "Abertura da conferência anual com participação de especialistas internacionais",
      views: 1250,
    },
    {
      id: "2",
      title: "Workshop de Gramática para Professores",
      type: "video",
      thumbnail: "/classroom-workshop-teachers.jpg",
      date: "2024-02-20",
      location: "Benguela",
      category: "Workshops",
      description: "Formação de professores sobre as novas diretrizes gramaticais",
      views: 890,
    },
    {
      id: "3",
      title: "Lançamento do Dicionário Angolano",
      type: "photo",
      thumbnail: "/book-launch-ceremony-angola.jpg",
      date: "2024-01-10",
      location: "Huambo",
      category: "Lançamentos",
      description: "Cerimónia de lançamento do novo dicionário de termos angolanos",
      views: 2100,
    },
    {
      id: "4",
      title: "Seminário CPLP sobre Cooperação Linguística",
      type: "video",
      thumbnail: "/international-seminar-cplp-flags.jpg",
      date: "2023-12-05",
      location: "Lobito",
      category: "Seminários",
      description: "Encontro internacional sobre cooperação entre países lusófonos",
      views: 1560,
    },
    {
      id: "5",
      title: "Concurso de Ortografia Escolar",
      type: "photo",
      thumbnail: "/school-spelling-competition-students.jpg",
      date: "2023-11-18",
      location: "Namibe",
      category: "Concursos",
      description: "Final nacional do concurso de ortografia para estudantes do ensino médio",
      views: 980,
    },
    {
      id: "6",
      title: "Mesa Redonda sobre Variações Linguísticas",
      type: "video",
      thumbnail: "/round-table-discussion-linguistics.jpg",
      date: "2023-10-22",
      location: "Cabinda",
      category: "Debates",
      description: "Discussão sobre as variações regionais da língua portuguesa em Angola",
      views: 720,
    },
  ]

  const categories = ["Todas", "Conferências", "Workshops", "Seminários", "Lançamentos", "Concursos", "Debates"]

  const filteredItems =
    selectedCategory === "Todas" ? mediaItems : mediaItems.filter((item) => item.category === selectedCategory)

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Galeria de Atividades</h2>
        <p className="text-muted-foreground">Acompanhe os momentos mais importantes das nossas atividades e eventos</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum item encontrado nesta categoria.</p>
        </div>
      )}
    </div>
  )
}

function MediaCard({ item }: { item: MediaItem }) {
  return (
    <Card className="group overflow-hidden hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      <div className="relative shrink-0">
        <img
          src={item.thumbnail || "/placeholder.svg"}
          alt={item.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {item.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="bg-white/90 rounded-full p-3">
              <Play className="h-6 w-6 text-primary" />
            </div>
          </div>
        )}
        <Badge className="absolute top-2 right-2" variant="secondary">
          {item.type === "video" ? "Vídeo" : "Foto"}
        </Badge>
      </div>
      <CardContent className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg leading-tight mb-2">{item.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{item.category}</Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(item.date).toLocaleDateString("pt-PT")}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{item.location}</span>
          </div>
        </div>

        {item.views && (
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{item.views.toLocaleString()} visualizações</span>
          </div>
        )}

        <Button variant="outline" className="w-full bg-transparent mt-auto">
          {item.type === "video" ? "Assistir vídeo" : "Ver galeria"}
        </Button>
      </CardContent>
    </Card>
  )
}
