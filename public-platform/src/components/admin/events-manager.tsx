"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Plus, Search, Edit, Trash2 } from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: "conference" | "workshop" | "seminar" | "meeting"
  status: "upcoming" | "ongoing" | "completed"
  registrations: number
  maxParticipants: number
}

export function EventsManager() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Seminário de Linguística Aplicada",
      description: "Discussão sobre as aplicações práticas da linguística no contexto angolano.",
      date: "2024-02-15",
      time: "09:00",
      location: "Auditório da Universidade Agostinho Neto",
      type: "seminar",
      status: "upcoming",
      registrations: 45,
      maxParticipants: 100,
    },
    {
      id: "2",
      title: "Workshop de Lexicografia",
      description: "Técnicas modernas de elaboração de dicionários.",
      date: "2024-02-20",
      time: "14:00",
      location: "Centro Cultural Português",
      type: "workshop",
      status: "upcoming",
      registrations: 23,
      maxParticipants: 50,
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Event>>({})

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || event.type === filterType
    const matchesStatus = filterStatus === "all" || event.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleEdit = (event: Event) => {
    setIsEditing(event.id)
    setEditForm(event)
  }

  const handleSave = () => {
    if (isEditing && editForm.id) {
      setEvents(events.map((event) => (event.id === isEditing ? ({ ...event, ...editForm } as Event) : event)))
      setIsEditing(null)
      setEditForm({})
    }
  }

  const handleDelete = (id: string) => {
    setEvents(events.filter((event) => event.id !== id))
  }

  const handleAddNew = () => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title: "Novo Evento",
      description: "Descrição do evento",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      location: "Local a definir",
      type: "seminar",
      status: "upcoming",
      registrations: 0,
      maxParticipants: 50,
    }
    setEvents([newEvent, ...events])
    setIsEditing(newEvent.id)
    setEditForm(newEvent)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "ongoing":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "conference":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "workshop":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "seminar":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
      case "meeting":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Eventos</h2>
        <p className="text-gray-500">Gerencie eventos, workshops e seminários</p>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 h-11">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <Input
            placeholder="Pesquisar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm p-0 h-full min-w-0"
          />
          <div className="h-5 w-px bg-slate-200 shrink-0" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="border-0 shadow-none bg-transparent focus:ring-0 text-sm h-auto w-auto min-w-[110px] p-0 pr-6">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="conference">Conferência</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="seminar">Seminário</SelectItem>
              <SelectItem value="meeting">Reunião</SelectItem>
            </SelectContent>
          </Select>
          <div className="h-5 w-px bg-slate-200 shrink-0" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="border-0 shadow-none bg-transparent focus:ring-0 text-sm h-auto w-auto min-w-[110px] p-0 pr-6">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="upcoming">Próximos</SelectItem>
              <SelectItem value="ongoing">Em andamento</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          onClick={handleAddNew}
          className="shrink-0 rounded-lg h-11 px-5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Novo Evento
        </Button>
      </div>

      {/* Events List */}
      <div className={`grid gap-3 ${isEditing ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredEvents.map((event) => (
          <Card key={event.id} className="bg-white shadow-none border-slate-200 hover:-translate-y-0.5 transition-all duration-150">
            <CardContent className="p-6">
              {isEditing === event.id ? (
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
                      <Label>Local</Label>
                      <Input
                        value={editForm.location || ""}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={editForm.date || ""}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Horário</Label>
                      <Input
                        type="time"
                        value={editForm.time || ""}
                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={editForm.type}
                        onValueChange={(value) => setEditForm({ ...editForm, type: value as Event["type"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conference">Conferência</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="seminar">Seminário</SelectItem>
                          <SelectItem value="meeting">Reunião</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value) => setEditForm({ ...editForm, status: value as Event["status"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Próximo</SelectItem>
                          <SelectItem value="ongoing">Em andamento</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
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
                    <Button onClick={handleSave}>Salvar</Button>
                    <Button variant="outline" onClick={() => setIsEditing(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 flex items-start gap-1.5">
                      {event.title}
                    </h3>
                    <div className="flex gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(event)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge className={getTypeColor(event.type) + " text-xs"}>
                      {event.type === "conference" ? "Conferência" : event.type === "workshop" ? "Workshop" : event.type === "seminar" ? "Seminário" : "Reunião"}
                    </Badge>
                    <Badge className={getStatusColor(event.status) + " text-xs"}>
                      {event.status === "upcoming" ? "Próximo" : event.status === "ongoing" ? "Em andamento" : "Concluído"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{event.description}</p>
                  <div className="flex flex-col gap-1 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(event.date).toLocaleDateString("pt-PT")} · {event.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-600 dark:text-gray-400">Tente ajustar os filtros ou adicione um novo evento.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
