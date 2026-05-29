"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Save, X } from "lucide-react"

interface VonaEntry {
  id: string
  term: string
  category: string
  definition: string
  usage: string
  region?: string
}

export function VonaManager() {
  const [entries, setEntries] = useState<VonaEntry[]>([
    {
      id: "1",
      term: "zungueira",
      category: "profissões",
      definition: "Vendedora ambulante que comercializa produtos diversos nas ruas",
      usage: "A zungueira vende frutas na esquina",
      region: "Luanda",
    },
    {
      id: "2",
      term: "gasosa",
      category: "gastronomia",
      definition: "Refrigerante; bebida gaseificada",
      usage: "Vou comprar uma gasosa bem gelada",
      region: "Nacional",
    },
  ])

  const [editingEntry, setEditingEntry] = useState<VonaEntry | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [newEntry, setNewEntry] = useState<Partial<VonaEntry>>({
    term: "",
    category: "",
    definition: "",
    usage: "",
    region: "",
  })

  const filteredEntries = entries.filter(
    (entry) =>
      entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.definition.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreate = () => {
    if (newEntry.term && newEntry.definition) {
      const entry: VonaEntry = {
        id: Date.now().toString(),
        term: newEntry.term,
        category: newEntry.category || "",
        definition: newEntry.definition,
        usage: newEntry.usage || "",
        region: newEntry.region,
      }
      setEntries([...entries, entry])
      setNewEntry({})
      setIsCreating(false)
      console.log("[v0] Created new VONA entry:", entry)
    }
  }

  const handleUpdate = () => {
    if (editingEntry) {
      setEntries(entries.map((entry) => (entry.id === editingEntry.id ? editingEntry : entry)))
      setEditingEntry(null)
      console.log("[v0] Updated VONA entry:", editingEntry)
    }
  }

  const handleDelete = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id))
    console.log("[v0] Deleted VONA entry:", id)
  }

  return (
    <div className="space-y-6">
      {/* Search and Create */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 h-11">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <Input
            placeholder="Pesquisar termos VONA..."
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
          Novo Termo
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="bg-white shadow-none border-slate-200 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Criar Novo Termo VONA
              <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Termo *</Label>
                <Input
                  value={newEntry.term || ""}
                  onChange={(e) => setNewEntry({ ...newEntry, term: e.target.value })}
                  placeholder="Digite o termo"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select onValueChange={(value) => setNewEntry({ ...newEntry, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gastronomia">Gastronomia</SelectItem>
                    <SelectItem value="profissões">Profissões</SelectItem>
                    <SelectItem value="cultura">Cultura</SelectItem>
                    <SelectItem value="cotidiano">Cotidiano</SelectItem>
                    <SelectItem value="natureza">Natureza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Região</Label>
                <Select onValueChange={(value) => setNewEntry({ ...newEntry, region: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nacional">Nacional</SelectItem>
                    <SelectItem value="Luanda">Luanda</SelectItem>
                    <SelectItem value="Benguela">Benguela</SelectItem>
                    <SelectItem value="Huambo">Huambo</SelectItem>
                    <SelectItem value="Lobito">Lobito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Definição *</Label>
              <Textarea
                value={newEntry.definition || ""}
                onChange={(e) => setNewEntry({ ...newEntry, definition: e.target.value })}
                placeholder="Definição do termo"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Exemplo de Uso</Label>
              <Input
                value={newEntry.usage || ""}
                onChange={(e) => setNewEntry({ ...newEntry, usage: e.target.value })}
                placeholder="Exemplo de como usar o termo"
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

      {/* Entries List */}
      <div className={`grid gap-3 ${editingEntry ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="bg-white shadow-none border-slate-200 hover:-translate-y-0.5 transition-all duration-150">
            <CardContent className="p-4">
              {editingEntry?.id === entry.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Termo</Label>
                      <Input
                        value={editingEntry.term}
                        onChange={(e) => setEditingEntry({ ...editingEntry, term: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={editingEntry.category}
                        onValueChange={(value) => setEditingEntry({ ...editingEntry, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gastronomia">Gastronomia</SelectItem>
                          <SelectItem value="profissões">Profissões</SelectItem>
                          <SelectItem value="cultura">Cultura</SelectItem>
                          <SelectItem value="cotidiano">Cotidiano</SelectItem>
                          <SelectItem value="natureza">Natureza</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Região</Label>
                      <Select
                        value={editingEntry.region}
                        onValueChange={(value) => setEditingEntry({ ...editingEntry, region: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nacional">Nacional</SelectItem>
                          <SelectItem value="Luanda">Luanda</SelectItem>
                          <SelectItem value="Benguela">Benguela</SelectItem>
                          <SelectItem value="Huambo">Huambo</SelectItem>
                          <SelectItem value="Lobito">Lobito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Definição</Label>
                    <Textarea
                      value={editingEntry.definition}
                      onChange={(e) => setEditingEntry({ ...editingEntry, definition: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingEntry(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-primary leading-snug">{entry.term}</h3>
                    <div className="flex gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingEntry(entry)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary" className="text-xs">{entry.category}</Badge>
                    {entry.region && <Badge variant="outline" className="text-xs">{entry.region}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{entry.definition}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Nenhum termo encontrado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
