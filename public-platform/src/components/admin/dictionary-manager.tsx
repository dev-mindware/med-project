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

interface DictionaryEntry {
  id: string
  word: string
  definition: string
  etymology: string
  examples: string[]
  category: string
  difficulty: string
}

export function DictionaryManager() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([
    {
      id: "1",
      word: "muxima",
      definition: "Coração; centro emocional; sentimento profundo",
      etymology: "Do kimbundu mu'xima",
      examples: ["O muxima dele está partido", "Falou do muxima"],
      category: "substantivo",
      difficulty: "básico",
    },
    {
      id: "2",
      word: "kandengue",
      definition: "Criança pequena; menino ou menina",
      etymology: "Do kimbundu ka'ndenge",
      examples: ["Os kandengues brincam no quintal", "Aquele kandengue é esperto"],
      category: "substantivo",
      difficulty: "básico",
    },
  ])

  const [editingEntry, setEditingEntry] = useState<DictionaryEntry | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [newEntry, setNewEntry] = useState<Partial<DictionaryEntry>>({
    word: "",
    definition: "",
    etymology: "",
    examples: [],
    category: "",
    difficulty: "",
  })

  const filteredEntries = entries.filter(
    (entry) =>
      entry.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.definition.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreate = () => {
    if (newEntry.word && newEntry.definition) {
      const entry: DictionaryEntry = {
        id: Date.now().toString(),
        word: newEntry.word,
        definition: newEntry.definition,
        etymology: newEntry.etymology || "",
        examples: newEntry.examples || [],
        category: newEntry.category || "",
        difficulty: newEntry.difficulty || "básico",
      }
      setEntries([...entries, entry])
      setNewEntry({})
      setIsCreating(false)
      console.log("[v0] Created new dictionary entry:", entry)
    }
  }

  const handleUpdate = () => {
    if (editingEntry) {
      setEntries(entries.map((entry) => (entry.id === editingEntry.id ? editingEntry : entry)))
      setEditingEntry(null)
      console.log("[v0] Updated dictionary entry:", editingEntry)
    }
  }

  const handleDelete = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id))
    console.log("[v0] Deleted dictionary entry:", id)
  }

  return (
    <div className="space-y-6">
      {/* Search and Create */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 h-11">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <Input
            placeholder="Pesquisar entradas..."
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
          Nova Entrada
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="bg-white shadow-none border-slate-200 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Criar Nova Entrada
              <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Palavra *</Label>
                <Input
                  value={newEntry.word || ""}
                  onChange={(e) => setNewEntry({ ...newEntry, word: e.target.value })}
                  placeholder="Digite a palavra"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select onValueChange={(value) => setNewEntry({ ...newEntry, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="substantivo">Substantivo</SelectItem>
                    <SelectItem value="verbo">Verbo</SelectItem>
                    <SelectItem value="adjetivo">Adjetivo</SelectItem>
                    <SelectItem value="advérbio">Advérbio</SelectItem>
                    <SelectItem value="expressão">Expressão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Definição *</Label>
              <Textarea
                value={newEntry.definition || ""}
                onChange={(e) => setNewEntry({ ...newEntry, definition: e.target.value })}
                placeholder="Digite a definição"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Etimologia</Label>
              <Input
                value={newEntry.etymology || ""}
                onChange={(e) => setNewEntry({ ...newEntry, etymology: e.target.value })}
                placeholder="Origem da palavra"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Palavra</Label>
                      <Input
                        value={editingEntry.word}
                        onChange={(e) => setEditingEntry({ ...editingEntry, word: e.target.value })}
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
                          <SelectItem value="substantivo">Substantivo</SelectItem>
                          <SelectItem value="verbo">Verbo</SelectItem>
                          <SelectItem value="adjetivo">Adjetivo</SelectItem>
                          <SelectItem value="advérbio">Advérbio</SelectItem>
                          <SelectItem value="expressão">Expressão</SelectItem>
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
                    <h3 className="text-base font-bold text-primary leading-snug">{entry.word}</h3>
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
                    <Badge variant="outline" className="text-xs">{entry.difficulty}</Badge>
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
            <p className="text-muted-foreground">Nenhuma entrada encontrada.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
