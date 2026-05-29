"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, VideoIcon, Plus, Search, Edit, Trash2, Eye, Calendar, Upload } from "lucide-react"

interface MediaItem {
  id: string
  title: string
  description: string
  type: "image" | "video"
  category: "events" | "activities" | "conferences" | "workshops" | "meetings" | "cultural"
  url: string
  thumbnail: string
  uploadDate: string
  views: number
  fileSize: string
  author: string
}

export function MediaManager() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: "1",
      title: "Seminário de Linguística 2024",
      description: "Registro fotográfico do seminário anual de linguística aplicada.",
      type: "image",
      category: "events",
      url: "/media/seminario-2024.jpg",
      thumbnail: "/media/thumbnails/seminario-2024-thumb.jpg",
      uploadDate: "2024-01-15",
      views: 234,
      fileSize: "2.1 MB",
      author: "Equipe CNLP",
    },
    {
      id: "2",
      title: "Workshop de Lexicografia - Apresentação",
      description: "Vídeo da apresentação principal do workshop de lexicografia.",
      type: "video",
      category: "workshops",
      url: "/media/workshop-lexicografia.mp4",
      thumbnail: "/media/thumbnails/workshop-thumb.jpg",
      uploadDate: "2024-01-20",
      views: 156,
      fileSize: "45.2 MB",
      author: "Dr. António Silva",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<MediaItem>>({})

  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || item.type === filterType
    const matchesCategory = filterCategory === "all" || item.category === filterCategory
    return matchesSearch && matchesType && matchesCategory
  })

  const handleEdit = (item: MediaItem) => {
    setIsEditing(item.id)
    setEditForm(item)
  }

  const handleSave = () => {
    if (isEditing && editForm.id) {
      setMediaItems(mediaItems.map((item) => (item.id === isEditing ? ({ ...item, ...editForm } as MediaItem) : item)))
      setIsEditing(null)
      setEditForm({})
    }
  }

  const handleDelete = (id: string) => {
    setMediaItems(mediaItems.filter((item) => item.id !== id))
  }

  const handleAddNew = () => {
    const newItem: MediaItem = {
      id: Date.now().toString(),
      title: "Nova Mídia",
      description: "Descrição da mídia",
      type: "image",
      category: "events",
      url: "/media/nova-midia.jpg",
      thumbnail: "/media/thumbnails/nova-midia-thumb.jpg",
      uploadDate: new Date().toISOString().split("T")[0],
      views: 0,
      fileSize: "0 MB",
      author: "Autor",
    }
    setMediaItems([newItem, ...mediaItems])
    setIsEditing(newItem.id)
    setEditForm(newItem)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "video":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "events":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "activities":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "conferences":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "workshops":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
      case "meetings":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
      case "cultural":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "events":
        return "Eventos"
      case "activities":
        return "Atividades"
      case "conferences":
        return "Conferências"
      case "workshops":
        return "Workshops"
      case "meetings":
        return "Reuniões"
      case "cultural":
        return "Cultural"
      default:
        return category
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Multimídia</h2>
        <p className="text-gray-500">Gerencie fotos e vídeos das atividades</p>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 h-11">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <Input
            placeholder="Pesquisar mídia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm p-0 h-full min-w-0"
          />
          <div className="h-5 w-px bg-slate-200 shrink-0" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="border-0 shadow-none bg-transparent focus:ring-0 text-sm h-auto w-auto min-w-[100px] p-0 pr-6">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="image">Imagens</SelectItem>
              <SelectItem value="video">Vídeos</SelectItem>
            </SelectContent>
          </Select>
          <div className="h-5 w-px bg-slate-200 shrink-0" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="border-0 shadow-none bg-transparent focus:ring-0 text-sm h-auto w-auto min-w-[130px] p-0 pr-6">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="events">Eventos</SelectItem>
              <SelectItem value="activities">Atividades</SelectItem>
              <SelectItem value="conferences">Conferências</SelectItem>
              <SelectItem value="workshops">Workshops</SelectItem>
              <SelectItem value="meetings">Reuniões</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          onClick={handleAddNew}
          className="shrink-0 rounded-lg h-11 px-5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Nova Mídia
        </Button>
      </div>

      {/* Media Grid */}
      <div className={`grid gap-3 ${isEditing ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredMedia.map((item) => (
          <Card key={item.id} className="bg-white shadow-none border-slate-200 hover:-translate-y-0.5 transition-all duration-150">
            <CardContent className="p-0">
              {isEditing === item.id ? (
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={editForm.title || ""}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Autor</Label>
                    <Input
                      value={editForm.author || ""}
                      onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={editForm.type}
                        onValueChange={(value) => setEditForm({ ...editForm, type: value as MediaItem["type"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Imagem</SelectItem>
                          <SelectItem value="video">Vídeo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={editForm.category}
                        onValueChange={(value) =>
                          setEditForm({ ...editForm, category: value as MediaItem["category"] })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="events">Eventos</SelectItem>
                          <SelectItem value="activities">Atividades</SelectItem>
                          <SelectItem value="conferences">Conferências</SelectItem>
                          <SelectItem value="workshops">Workshops</SelectItem>
                          <SelectItem value="meetings">Reuniões</SelectItem>
                          <SelectItem value="cultural">Cultural</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} size="sm">
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(null)} size="sm">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                    {item.type === "image" ? (
                      <ImageIcon className="w-full h-full object-cover text-gray-400" />
                    ) : (
                      <VideoIcon className="w-full h-full object-cover text-gray-400" />
                    )}
                    <div className="absolute top-2 left-2 flex space-x-2">
                      <Badge className={getTypeColor(item.type)}>{item.type === "image" ? "Imagem" : "Vídeo"}</Badge>
                      <Badge className={getCategoryColor(item.category)}>{getCategoryLabel(item.category)}</Badge>
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.uploadDate).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{item.views}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{item.author}</span>
                      <span>{item.fileSize}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma mídia encontrada</h3>
            <p className="text-gray-600 dark:text-gray-400">Tente ajustar os filtros ou adicione uma nova mídia.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
