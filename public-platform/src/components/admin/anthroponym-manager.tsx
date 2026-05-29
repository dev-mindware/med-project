"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Save, X, User } from "lucide-react"

interface Anthroponym {
  id: string
  name: string
  type: string
  origin: string
  meaning: string
  usage: string
  gender?: string
}

export function AnthroponymManager() {
  const [anthroponyms, setAnthroponyms] = useState<Anthroponym[]>([
    {
      id: "1",
      name: "Nzinga",
      type: "nome próprio",
      origin: "kimbundu",
      meaning: "Aquela que torce ou enrola",
      usage: "Nome feminino tradicional angolano, popularizado pela Rainha Nzinga",
      gender: "feminino",
    },
    {
      id: "2",
      name: "Kiluanje",
      type: "nome próprio",
      origin: "kimbundu",
      meaning: "Aquele que vem da guerra",
      usage: "Nome masculino tradicional, usado em cerimónias importantes",
      gender: "masculino",
    },
  ])

  const [editingAnthroponym, setEditingAnthroponym] = useState<Anthroponym | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [newAnthroponym, setNewAnthroponym] = useState<Partial<Anthroponym>>({
    name: "",
    type: "",
    origin: "",
    meaning: "",
    usage: "",
    gender: "",
  })

  const filteredAnthroponyms = anthroponyms.filter(
    (anthroponym) =>
      anthroponym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anthroponym.meaning.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreate = () => {
    if (newAnthroponym.name && newAnthroponym.meaning) {
      const anthroponym: Anthroponym = {
        id: Date.now().toString(),
        name: newAnthroponym.name,
        type: newAnthroponym.type || "",
        origin: newAnthroponym.origin || "",
        meaning: newAnthroponym.meaning,
        usage: newAnthroponym.usage || "",
        gender: newAnthroponym.gender,
      }
      setAnthroponyms([...anthroponyms, anthroponym])
      setNewAnthroponym({})
      setIsCreating(false)
      console.log("[v0] Created new anthroponym:", anthroponym)
    }
  }

  const handleUpdate = () => {
    if (editingAnthroponym) {
      setAnthroponyms(
        anthroponyms.map((anthroponym) =>
          anthroponym.id === editingAnthroponym.id ? editingAnthroponym : anthroponym,
        ),
      )
      setEditingAnthroponym(null)
      console.log("[v0] Updated anthroponym:", editingAnthroponym)
    }
  }

  const handleDelete = (id: string) => {
    setAnthroponyms(anthroponyms.filter((anthroponym) => anthroponym.id !== id))
    console.log("[v0] Deleted anthroponym:", id)
  }

  return (
    <div className="space-y-6">
      {/* Search and Create */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 h-11">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <Input
            placeholder="Pesquisar antropónimos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm p-0 h-full"
          />
        </div>
        <Button
          size="sm"
          onClick={() => setIsCreating(true)}
          className="shrink-0 rounded-lg h-11 px-5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Novo Antropónimo
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="bg-white shadow-none border-slate-200 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Criar Novo Antropónimo
              <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={newAnthroponym.name || ""}
                  onChange={(e) => setNewAnthroponym({ ...newAnthroponym, name: e.target.value })}
                  placeholder="Nome da pessoa"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select onValueChange={(value) => setNewAnthroponym({ ...newAnthroponym, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nome próprio">Nome Próprio</SelectItem>
                    <SelectItem value="apelido">Apelido</SelectItem>
                    <SelectItem value="alcunha">Alcunha</SelectItem>
                    <SelectItem value="título">Título</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Origem</Label>
                <Select onValueChange={(value) => setNewAnthroponym({ ...newAnthroponym, origin: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kimbundu">Kimbundu</SelectItem>
                    <SelectItem value="umbundu">Umbundu</SelectItem>
                    <SelectItem value="kikongo">Kikongo</SelectItem>
                    <SelectItem value="português">Português</SelectItem>
                    <SelectItem value="outras">Outras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Género</Label>
                <Select onValueChange={(value) => setNewAnthroponym({ ...newAnthroponym, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="neutro">Neutro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Significado *</Label>
              <Textarea
                value={newAnthroponym.meaning || ""}
                onChange={(e) => setNewAnthroponym({ ...newAnthroponym, meaning: e.target.value })}
                placeholder="Significado do nome"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Uso e Contexto</Label>
              <Textarea
                value={newAnthroponym.usage || ""}
                onChange={(e) => setNewAnthroponym({ ...newAnthroponym, usage: e.target.value })}
                placeholder="Como e quando é usado o nome"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate}>
                <Save className="h-4 w-4 mr-2" />
                Criar
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anthroponyms List */}
      <div className={`grid gap-3 ${editingAnthroponym ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredAnthroponyms.map((anthroponym) => (
          <Card key={anthroponym.id} className="bg-white shadow-none border-slate-200 hover:-translate-y-0.5 transition-all duration-150">
            <CardContent className="p-4">
              {editingAnthroponym?.id === anthroponym.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={editingAnthroponym.name}
                        onChange={(e) => setEditingAnthroponym({ ...editingAnthroponym, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={editingAnthroponym.type}
                        onValueChange={(value) => setEditingAnthroponym({ ...editingAnthroponym, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nome próprio">Nome Próprio</SelectItem>
                          <SelectItem value="apelido">Apelido</SelectItem>
                          <SelectItem value="alcunha">Alcunha</SelectItem>
                          <SelectItem value="título">Título</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Origem</Label>
                      <Select
                        value={editingAnthroponym.origin}
                        onValueChange={(value) => setEditingAnthroponym({ ...editingAnthroponym, origin: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kimbundu">Kimbundu</SelectItem>
                          <SelectItem value="umbundu">Umbundu</SelectItem>
                          <SelectItem value="kikongo">Kikongo</SelectItem>
                          <SelectItem value="português">Português</SelectItem>
                          <SelectItem value="outras">Outras</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Género</Label>
                      <Select
                        value={editingAnthroponym.gender}
                        onValueChange={(value) => setEditingAnthroponym({ ...editingAnthroponym, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="neutro">Neutro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Significado</Label>
                    <Textarea
                      value={editingAnthroponym.meaning}
                      onChange={(e) => setEditingAnthroponym({ ...editingAnthroponym, meaning: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingAnthroponym(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-primary flex items-center gap-1.5 leading-snug">
                      <User className="h-4 w-4 shrink-0" />
                      {anthroponym.name}
                    </h3>
                    <div className="flex gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingAnthroponym(anthroponym)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => handleDelete(anthroponym.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary" className="text-xs">{anthroponym.type}</Badge>
                    <Badge variant="outline" className="text-xs">{anthroponym.origin}</Badge>
                    {anthroponym.gender && <Badge variant="outline" className="text-xs">{anthroponym.gender}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{anthroponym.meaning}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnthroponyms.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Nenhum antropónimo encontrado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
