"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Search, Edit, Trash2, Eye, Calendar, User } from "lucide-react"

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  category: "linguistics" | "education" | "literature" | "lexicography" | "history" | "sociolinguistics"
  status: "draft" | "published" | "archived"
  publishDate: string
  readTime: number
  views: number
}

export function ArticlesManager() {
  const [articles, setArticles] = useState<Article[]>([
    {
      id: "1",
      title: "A Evolução da Língua Portuguesa em Angola",
      content: "Conteúdo completo do artigo sobre a evolução histórica...",
      excerpt: "Uma análise detalhada sobre como a língua portuguesa evoluiu no contexto angolano.",
      author: "Dr. António Silva",
      category: "history",
      status: "published",
      publishDate: "2024-01-15",
      readTime: 8,
      views: 1245,
    },
    {
      id: "2",
      title: "Metodologias de Ensino da Língua Portuguesa",
      content: "Conteúdo sobre metodologias modernas de ensino...",
      excerpt: "Estratégias eficazes para o ensino da língua portuguesa em contexto escolar.",
      author: "Prof. Maria Santos",
      category: "education",
      status: "published",
      publishDate: "2024-01-20",
      readTime: 12,
      views: 892,
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Article>>({})

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || article.category === filterCategory
    const matchesStatus = filterStatus === "all" || article.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleEdit = (article: Article) => {
    setIsEditing(article.id)
    setEditForm(article)
  }

  const handleSave = () => {
    if (isEditing && editForm.id) {
      setArticles(
        articles.map((article) => (article.id === isEditing ? ({ ...article, ...editForm } as Article) : article)),
      )
      setIsEditing(null)
      setEditForm({})
    }
  }

  const handleDelete = (id: string) => {
    setArticles(articles.filter((article) => article.id !== id))
  }

  const handleAddNew = () => {
    const newArticle: Article = {
      id: Date.now().toString(),
      title: "Novo Artigo",
      content: "Conteúdo do artigo...",
      excerpt: "Resumo do artigo",
      author: "Autor",
      category: "linguistics",
      status: "draft",
      publishDate: new Date().toISOString().split("T")[0],
      readTime: 5,
      views: 0,
    }
    setArticles([newArticle, ...articles])
    setIsEditing(newArticle.id)
    setEditForm(newArticle)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "linguistics":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "education":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "literature":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "lexicography":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "history":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "sociolinguistics":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "linguistics":
        return "Linguística"
      case "education":
        return "Educação"
      case "literature":
        return "Literatura"
      case "lexicography":
        return "Lexicografia"
      case "history":
        return "História"
      case "sociolinguistics":
        return "Sociolinguística"
      default:
        return category
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Artigos</h2>
        <p className="text-gray-500">Gerencie artigos e publicações acadêmicas</p>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 h-11">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <Input
            placeholder="Pesquisar artigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm p-0 h-full min-w-0"
          />
          <div className="h-5 w-px bg-slate-200 shrink-0" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="border-0 shadow-none bg-transparent focus:ring-0 text-sm h-auto w-auto min-w-[130px] p-0 pr-6">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="linguistics">Linguística</SelectItem>
              <SelectItem value="education">Educação</SelectItem>
              <SelectItem value="literature">Literatura</SelectItem>
              <SelectItem value="lexicography">Lexicografia</SelectItem>
              <SelectItem value="history">História</SelectItem>
              <SelectItem value="sociolinguistics">Sociolinguística</SelectItem>
            </SelectContent>
          </Select>
          <div className="h-5 w-px bg-slate-200 shrink-0" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="border-0 shadow-none bg-transparent focus:ring-0 text-sm h-auto w-auto min-w-[100px] p-0 pr-6">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          onClick={handleAddNew}
          className="shrink-0 rounded-lg h-11 px-5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Novo Artigo
        </Button>
      </div>

      {/* Articles List */}
      <div className={`grid gap-3 ${isEditing ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredArticles.map((article) => (
          <Card key={article.id} className="bg-white shadow-none border-slate-200 hover:-translate-y-0.5 transition-all duration-150">
            <CardContent className="p-6">
              {isEditing === article.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={editForm.category}
                        onValueChange={(value) => setEditForm({ ...editForm, category: value as Article["category"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linguistics">Linguística</SelectItem>
                          <SelectItem value="education">Educação</SelectItem>
                          <SelectItem value="literature">Literatura</SelectItem>
                          <SelectItem value="lexicography">Lexicografia</SelectItem>
                          <SelectItem value="history">História</SelectItem>
                          <SelectItem value="sociolinguistics">Sociolinguística</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value) => setEditForm({ ...editForm, status: value as Article["status"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="published">Publicado</SelectItem>
                          <SelectItem value="archived">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Resumo</Label>
                    <Textarea
                      value={editForm.excerpt || ""}
                      onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conteúdo</Label>
                    <Textarea
                      value={editForm.content || ""}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      rows={6}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSave}>Salvar</Button>
                    <Button variant="outline" onClick={() => setIsEditing(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2">{article.title}</h3>
                    <div className="flex gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(article)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => handleDelete(article.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge className={getCategoryColor(article.category) + " text-xs"}>{getCategoryLabel(article.category)}</Badge>
                    <Badge className={getStatusColor(article.status) + " text-xs"}>
                      {article.status === "draft" ? "Rascunho" : article.status === "published" ? "Publicado" : "Arquivado"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{article.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{article.author}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum artigo encontrado</h3>
            <p className="text-gray-600 dark:text-gray-400">Tente ajustar os filtros ou adicione um novo artigo.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
