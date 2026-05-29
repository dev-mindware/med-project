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

interface GrammarRule {
  id: string
  title: string
  category: string
  difficulty: string
  rule: string
  examples: string[]
  exceptions?: string
}

export function GrammarManager() {
  const [rules, setRules] = useState<GrammarRule[]>([
    {
      id: "1",
      title: "Concordância Nominal",
      category: "morfologia",
      difficulty: "intermediário",
      rule: "O artigo, o adjetivo, o numeral e o pronome concordam em gênero e número com o substantivo a que se referem.",
      examples: ["As duas meninas estudiosas", "Os livros interessantes", "Aquelas casas antigas"],
      exceptions: "Alguns adjetivos são invariáveis em gênero (ex: simples, feliz)",
    },
  ])

  const [editingRule, setEditingRule] = useState<GrammarRule | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [newRule, setNewRule] = useState<Partial<GrammarRule>>({
    title: "",
    category: "",
    difficulty: "",
    rule: "",
    examples: [],
    exceptions: "",
  })

  const filteredRules = rules.filter(
    (rule) =>
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.rule.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreate = () => {
    if (newRule.title && newRule.rule) {
      const rule: GrammarRule = {
        id: Date.now().toString(),
        title: newRule.title,
        category: newRule.category || "",
        difficulty: newRule.difficulty || "básico",
        rule: newRule.rule,
        examples: newRule.examples || [],
        exceptions: newRule.exceptions,
      }
      setRules([...rules, rule])
      setNewRule({})
      setIsCreating(false)
      console.log("[v0] Created new grammar rule:", rule)
    }
  }

  const handleUpdate = () => {
    if (editingRule) {
      setRules(rules.map((rule) => (rule.id === editingRule.id ? editingRule : rule)))
      setEditingRule(null)
      console.log("[v0] Updated grammar rule:", editingRule)
    }
  }

  const handleDelete = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id))
    console.log("[v0] Deleted grammar rule:", id)
  }

  return (
    <div className="space-y-6">
      {/* Search and Create */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 h-11">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <Input
            placeholder="Pesquisar regras..."
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
          Nova Regra
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="bg-white shadow-none border-slate-200 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Criar Nova Regra Gramatical
              <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={newRule.title || ""}
                  onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                  placeholder="Nome da regra"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select onValueChange={(value) => setNewRule({ ...newRule, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morfologia">Morfologia</SelectItem>
                    <SelectItem value="sintaxe">Sintaxe</SelectItem>
                    <SelectItem value="ortografia">Ortografia</SelectItem>
                    <SelectItem value="semântica">Semântica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Select onValueChange={(value) => setNewRule({ ...newRule, difficulty: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="básico">Básico</SelectItem>
                    <SelectItem value="intermediário">Intermediário</SelectItem>
                    <SelectItem value="avançado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Regra *</Label>
              <Textarea
                value={newRule.rule || ""}
                onChange={(e) => setNewRule({ ...newRule, rule: e.target.value })}
                placeholder="Descrição da regra gramatical"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Exceções</Label>
              <Textarea
                value={newRule.exceptions || ""}
                onChange={(e) => setNewRule({ ...newRule, exceptions: e.target.value })}
                placeholder="Exceções à regra (opcional)"
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

      {/* Rules List */}
      <div className={`grid gap-3 ${editingRule ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredRules.map((rule) => (
          <Card key={rule.id} className="bg-white shadow-none border-slate-200 hover:-translate-y-0.5 transition-all duration-150">
            <CardContent className="p-4">
              {editingRule?.id === rule.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={editingRule.title}
                        onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={editingRule.category}
                        onValueChange={(value) => setEditingRule({ ...editingRule, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morfologia">Morfologia</SelectItem>
                          <SelectItem value="sintaxe">Sintaxe</SelectItem>
                          <SelectItem value="ortografia">Ortografia</SelectItem>
                          <SelectItem value="semântica">Semântica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Dificuldade</Label>
                      <Select
                        value={editingRule.difficulty}
                        onValueChange={(value) => setEditingRule({ ...editingRule, difficulty: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="básico">Básico</SelectItem>
                          <SelectItem value="intermediário">Intermediário</SelectItem>
                          <SelectItem value="avançado">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Regra</Label>
                    <Textarea
                      value={editingRule.rule}
                      onChange={(e) => setEditingRule({ ...editingRule, rule: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingRule(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-primary leading-snug">{rule.title}</h3>
                    <div className="flex gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingRule(rule)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => handleDelete(rule.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary" className="text-xs">{rule.category}</Badge>
                    <Badge variant="outline" className="text-xs">{rule.difficulty}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{rule.rule}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRules.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma regra encontrada.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
