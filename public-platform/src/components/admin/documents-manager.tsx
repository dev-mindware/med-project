"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Search, Edit, Trash2, Download, Upload, Calendar } from "lucide-react"

interface Document {
  id: string
  title: string
  description: string
  category: "manual" | "brochure" | "legislation" | "report" | "research" | "presentation"
  fileType: "pdf" | "doc" | "ppt" | "txt"
  fileSize: string
  uploadDate: string
  downloads: number
  author: string
  url: string
}

export function DocumentsManager() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      title: "Manual de Ortografia da Língua Portuguesa",
      description: "Guia completo sobre as regras ortográficas vigentes em Angola.",
      category: "manual",
      fileType: "pdf",
      fileSize: "2.5 MB",
      uploadDate: "2024-01-10",
      downloads: 1543,
      author: "Comissão Nacional",
      url: "/documents/manual-ortografia.pdf",
    },
    {
      id: "2",
      title: "Brochura CPLP - Cooperação Linguística",
      description: "Documento sobre a cooperação entre países de língua portuguesa.",
      category: "brochure",
      fileType: "pdf",
      fileSize: "1.8 MB",
      uploadDate: "2024-01-15",
      downloads: 892,
      author: "CPLP",
      url: "/documents/brochura-cplp.pdf",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Document>>({})

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory
    const matchesType = filterType === "all" || doc.fileType === filterType
    return matchesSearch && matchesCategory && matchesType
  })

  const handleEdit = (document: Document) => {
    setIsEditing(document.id)
    setEditForm(document)
  }

  const handleSave = () => {
    if (isEditing && editForm.id) {
      setDocuments(documents.map((doc) => (doc.id === isEditing ? ({ ...doc, ...editForm } as Document) : doc)))
      setIsEditing(null)
      setEditForm({})
    }
  }

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
  }

  const handleAddNew = () => {
    const newDocument: Document = {
      id: Date.now().toString(),
      title: "Novo Documento",
      description: "Descrição do documento",
      category: "manual",
      fileType: "pdf",
      fileSize: "0 MB",
      uploadDate: new Date().toISOString().split("T")[0],
      downloads: 0,
      author: "Autor",
      url: "/documents/novo-documento.pdf",
    }
    setDocuments([newDocument, ...documents])
    setIsEditing(newDocument.id)
    setEditForm(newDocument)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "manual":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "brochure":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "legislation":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "report":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "research":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "presentation":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "pdf":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "doc":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "ppt":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "txt":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "manual":
        return "Manual"
      case "brochure":
        return "Brochura"
      case "legislation":
        return "Legislação"
      case "report":
        return "Relatório"
      case "research":
        return "Pesquisa"
      case "presentation":
        return "Apresentação"
      default:
        return category
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Documentos</h2>
        <p className="text-gray-500">Gerencie documentos, manuais e publicações</p>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 h-11">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <Input
            placeholder="Pesquisar documentos..."
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
              <SelectItem value="manual">Manuais</SelectItem>
              <SelectItem value="brochure">Brochuras</SelectItem>
              <SelectItem value="legislation">Legislação</SelectItem>
              <SelectItem value="report">Relatórios</SelectItem>
              <SelectItem value="research">Pesquisas</SelectItem>
              <SelectItem value="presentation">Apresentações</SelectItem>
            </SelectContent>
          </Select>
          <div className="h-5 w-px bg-slate-200 shrink-0" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="border-0 shadow-none bg-transparent focus:ring-0 text-sm h-auto w-auto min-w-[90px] p-0 pr-6">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="doc">DOC</SelectItem>
              <SelectItem value="ppt">PPT</SelectItem>
              <SelectItem value="txt">TXT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          onClick={handleAddNew}
          className="shrink-0 rounded-lg h-11 px-5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Novo Documento
        </Button>
      </div>

      {/* Documents List */}
      <div className={`grid gap-3 ${isEditing ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="bg-white shadow-none border-slate-200 hover:-translate-y-0.5 transition-all duration-150">
            <CardContent className="p-6">
              {isEditing === document.id ? (
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
                        onValueChange={(value) => setEditForm({ ...editForm, category: value as Document["category"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="brochure">Brochura</SelectItem>
                          <SelectItem value="legislation">Legislação</SelectItem>
                          <SelectItem value="report">Relatório</SelectItem>
                          <SelectItem value="research">Pesquisa</SelectItem>
                          <SelectItem value="presentation">Apresentação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Arquivo</Label>
                      <Select
                        value={editForm.fileType}
                        onValueChange={(value) => setEditForm({ ...editForm, fileType: value as Document["fileType"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="doc">DOC</SelectItem>
                          <SelectItem value="ppt">PPT</SelectItem>
                          <SelectItem value="txt">TXT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>URL do Arquivo</Label>
                      <Input
                        value={editForm.url || ""}
                        onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                        placeholder="/documents/arquivo.pdf"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tamanho do Arquivo</Label>
                      <Input
                        value={editForm.fileSize || ""}
                        onChange={(e) => setEditForm({ ...editForm, fileSize: e.target.value })}
                        placeholder="2.5 MB"
                      />
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
                    <Button onClick={handleSave}>Salvar</Button>
                    <Button variant="outline" onClick={() => setIsEditing(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2">{document.title}</h3>
                    <div className="flex gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(document.url, "_blank")}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(document)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => handleDelete(document.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge className={getCategoryColor(document.category) + " text-xs"}>{getCategoryLabel(document.category)}</Badge>
                    <Badge className={getTypeColor(document.fileType) + " text-xs"}>{document.fileType.toUpperCase()}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{document.description}</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <span>{document.fileSize}</span>
                    <span>{document.downloads} downloads</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum documento encontrado</h3>
            <p className="text-gray-600 dark:text-gray-400">Tente ajustar os filtros ou adicione um novo documento.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
