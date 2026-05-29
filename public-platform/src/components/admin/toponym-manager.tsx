"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Save, X, MapPin } from "lucide-react"

interface Toponym {
  id: string
  name: string
  type: string
  province: string
  etymology: string
  description: string
  coordinates?: string
}

export function ToponymManager() {
  const [toponyms, setToponyms] = useState<Toponym[]>([
    {
      id: "1",
      name: "Luanda",
      type: "cidade",
      province: "Luanda",
      etymology: "Do kimbundu 'Loanda', que significa 'tributo' ou 'imposto'",
      description: "Capital e maior cidade de Angola, centro político e económico do país",
      coordinates: "-8.8390, 13.2894",
    },
    {
      id: "2",
      name: "Benguela",
      type: "cidade",
      province: "Benguela",
      etymology: "Do umbundu 'Mbenguela', referente ao povo local",
      description: "Importante cidade portuária na costa atlântica de Angola",
      coordinates: "-12.5763, 13.4055",
    },
  ])

  const [editingToponym, setEditingToponym] = useState<Toponym | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [newToponym, setNewToponym] = useState<Partial<Toponym>>({
    name: "",
    type: "",
    province: "",
    etymology: "",
    description: "",
    coordinates: "",
  })

  const filteredToponyms = toponyms.filter(
    (toponym) =>
      toponym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      toponym.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreate = () => {
    if (newToponym.name && newToponym.description) {
      const toponym: Toponym = {
        id: Date.now().toString(),
        name: newToponym.name,
        type: newToponym.type || "",
        province: newToponym.province || "",
        etymology: newToponym.etymology || "",
        description: newToponym.description,
        coordinates: newToponym.coordinates,
      }
      setToponyms([...toponyms, toponym])
      setNewToponym({})
      setIsCreating(false)
      console.log("[v0] Created new toponym:", toponym)
    }
  }

  const handleUpdate = () => {
    if (editingToponym) {
      setToponyms(toponyms.map((toponym) => (toponym.id === editingToponym.id ? editingToponym : toponym)))
      setEditingToponym(null)
      console.log("[v0] Updated toponym:", editingToponym)
    }
  }

  const handleDelete = (id: string) => {
    setToponyms(toponyms.filter((toponym) => toponym.id !== id))
    console.log("[v0] Deleted toponym:", id)
  }

  return (
    <div className="space-y-6">
      {/* Search and Create */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 h-11">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <Input
            placeholder="Pesquisar topónimos..."
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
          Novo Topónimo
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="bg-white shadow-none border-slate-200 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Criar Novo Topónimo
              <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={newToponym.name || ""}
                  onChange={(e) => setNewToponym({ ...newToponym, name: e.target.value })}
                  placeholder="Nome do lugar"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select onValueChange={(value) => setNewToponym({ ...newToponym, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cidade">Cidade</SelectItem>
                    <SelectItem value="vila">Vila</SelectItem>
                    <SelectItem value="aldeia">Aldeia</SelectItem>
                    <SelectItem value="rio">Rio</SelectItem>
                    <SelectItem value="montanha">Montanha</SelectItem>
                    <SelectItem value="província">Província</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Província</Label>
                <Select onValueChange={(value) => setNewToponym({ ...newToponym, province: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Luanda">Luanda</SelectItem>
                    <SelectItem value="Benguela">Benguela</SelectItem>
                    <SelectItem value="Huambo">Huambo</SelectItem>
                    <SelectItem value="Huíla">Huíla</SelectItem>
                    <SelectItem value="Cabinda">Cabinda</SelectItem>
                    <SelectItem value="Cunene">Cunene</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Textarea
                value={newToponym.description || ""}
                onChange={(e) => setNewToponym({ ...newToponym, description: e.target.value })}
                placeholder="Descrição do lugar"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Etimologia</Label>
              <Textarea
                value={newToponym.etymology || ""}
                onChange={(e) => setNewToponym({ ...newToponym, etymology: e.target.value })}
                placeholder="Origem do nome"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Coordenadas</Label>
              <Input
                value={newToponym.coordinates || ""}
                onChange={(e) => setNewToponym({ ...newToponym, coordinates: e.target.value })}
                placeholder="Latitude, Longitude (ex: -8.8390, 13.2894)"
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

      {/* Toponyms List */}
      <div className={`grid gap-3 ${editingToponym ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredToponyms.map((toponym) => (
          <Card key={toponym.id} className="bg-white shadow-none border-slate-200 hover:-translate-y-0.5 transition-all duration-150">
            <CardContent className="p-4">
              {editingToponym?.id === toponym.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={editingToponym.name}
                        onChange={(e) => setEditingToponym({ ...editingToponym, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={editingToponym.type}
                        onValueChange={(value) => setEditingToponym({ ...editingToponym, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cidade">Cidade</SelectItem>
                          <SelectItem value="vila">Vila</SelectItem>
                          <SelectItem value="aldeia">Aldeia</SelectItem>
                          <SelectItem value="rio">Rio</SelectItem>
                          <SelectItem value="montanha">Montanha</SelectItem>
                          <SelectItem value="província">Província</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Província</Label>
                      <Select
                        value={editingToponym.province}
                        onValueChange={(value) => setEditingToponym({ ...editingToponym, province: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Luanda">Luanda</SelectItem>
                          <SelectItem value="Benguela">Benguela</SelectItem>
                          <SelectItem value="Huambo">Huambo</SelectItem>
                          <SelectItem value="Huíla">Huíla</SelectItem>
                          <SelectItem value="Cabinda">Cabinda</SelectItem>
                          <SelectItem value="Cunene">Cunene</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={editingToponym.description}
                      onChange={(e) => setEditingToponym({ ...editingToponym, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingToponym(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-primary flex items-center gap-1.5 leading-snug">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {toponym.name}
                    </h3>
                    <div className="flex gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingToponym(toponym)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => handleDelete(toponym.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary" className="text-xs">{toponym.type}</Badge>
                    <Badge variant="outline" className="text-xs">{toponym.province}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{toponym.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredToponyms.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Nenhum topónimo encontrado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
