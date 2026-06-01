"use client"

import type React from "react"
import { useState } from "react"
import { Calendar, CheckCircle2, Loader2, MapPin, Send, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { publicApi, type PublicEvent } from "@/lib/public-api"

const initialFormData = {
  nomeCompleto: "",
  areaFormacao: "",
  instituicao: "",
  pais: "",
  telefone: "",
  email: "",
  tituloComunicacao: "",
  resumo: "",
}

const countries = [
  "Angola",
  "Brasil",
  "Portugal",
  "Moçambique",
  "Cabo Verde",
  "Guiné-Bissau",
  "São Tomé e Príncipe",
  "Timor-Leste",
  "Outro",
]

export function EventRegistrationForm({
  event,
  compact = false,
}: {
  event: PublicEvent
  compact?: boolean
}) {
  const [formData, setFormData] = useState(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const startDate = new Date(event.startDate)

  const handleInputChange = (field: keyof typeof initialFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault()
    setIsSubmitting(true)
    setMessage("")
    setError("")

    try {
      const notes = [
        formData.areaFormacao && `Área de formação: ${formData.areaFormacao}`,
        formData.pais && `País: ${formData.pais}`,
        formData.tituloComunicacao && `Título de comunicação: ${formData.tituloComunicacao}`,
        formData.resumo && `Resumo: ${formData.resumo}`,
      ]
        .filter(Boolean)
        .join("\n")

      await publicApi.registerForEvent(event.slug || event.id, {
        name: formData.nomeCompleto,
        email: formData.email,
        phone: formData.telefone,
        organization: formData.instituicao,
        notes,
      })

      setMessage("Inscrição enviada com sucesso. Aguarde a confirmação da equipa.")
      setFormData(initialFormData)
    } catch {
      setError("Não foi possível enviar a inscrição. Verifique os dados ou tente novamente mais tarde.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-100/80 bg-primary/5 p-4 text-sm">
        <h3 className="font-bold text-foreground">{event.title}</h3>
        <div className="mt-3 grid gap-2 text-muted-foreground sm:grid-cols-2">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {startDate.toLocaleDateString("pt-PT")}
          </span>
          {event.location && (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {event.location}
            </span>
          )}
          {event.maxRegistrations && (
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {event.registrationCount ?? 0}/{event.maxRegistrations} inscritos
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "space-y-6"}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nomeCompleto">Nome completo *</Label>
            <Input
              id="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={(event) => handleInputChange("nomeCompleto", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(event) => handleInputChange("email", event.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="areaFormacao">Área de formação</Label>
            <Input
              id="areaFormacao"
              value={formData.areaFormacao}
              onChange={(event) => handleInputChange("areaFormacao", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instituicao">Instituição que representa</Label>
            <Input
              id="instituicao"
              value={formData.instituicao}
              onChange={(event) => handleInputChange("instituicao", event.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pais">País</Label>
            <Select value={formData.pais} onValueChange={(value) => handleInputChange("pais", value)}>
              <SelectTrigger id="pais" className="rounded-md">
                <SelectValue placeholder="Selecione o país" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              type="tel"
              value={formData.telefone}
              onChange={(event) => handleInputChange("telefone", event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tituloComunicacao">Título de comunicação</Label>
          <Input
            id="tituloComunicacao"
            value={formData.tituloComunicacao}
            onChange={(event) => handleInputChange("tituloComunicacao", event.target.value)}
            placeholder="Opcional, apenas se for apresentar uma comunicação"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="resumo">Resumo</Label>
          <Textarea
            id="resumo"
            value={formData.resumo}
            onChange={(event) => handleInputChange("resumo", event.target.value)}
            placeholder="Opcional, resumo da comunicação"
            rows={compact ? 3 : 4}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full rounded-md font-semibold">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {isSubmitting ? "A enviar..." : "Enviar inscrição"}
        </Button>

        {message && (
          <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </form>
    </div>
  )
}
