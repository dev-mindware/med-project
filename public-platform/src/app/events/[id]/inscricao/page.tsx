"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"

export default function EventRegistrationPage() {
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    areaFormacao: "",
    instituicao: "",
    pais: "",
    telefone: "",
    email: "",
    tituloComunicacao: "",
    resumo: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Registration submitted:", formData)
    // Here would be the actual submission logic
    alert("Inscrição enviada com sucesso!")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Eventos
          </Link>
        </div>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Ficha de Inscrição</CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios para completar sua inscrição no evento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                  <Input
                    id="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areaFormacao">Área de Formação *</Label>
                  <Input
                    id="areaFormacao"
                    value={formData.areaFormacao}
                    onChange={(e) => handleInputChange("areaFormacao", e.target.value)}
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instituicao">Instituição que Representa *</Label>
                  <Input
                    id="instituicao"
                    value={formData.instituicao}
                    onChange={(e) => handleInputChange("instituicao", e.target.value)}
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pais">País *</Label>
                  <Select onValueChange={(value) => handleInputChange("pais", value)}>
                    <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                      <SelectValue placeholder="Selecione o país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="angola">Angola</SelectItem>
                      <SelectItem value="brasil">Brasil</SelectItem>
                      <SelectItem value="portugal">Portugal</SelectItem>
                      <SelectItem value="mocambique">Moçambique</SelectItem>
                      <SelectItem value="cabo-verde">Cabo Verde</SelectItem>
                      <SelectItem value="guine-bissau">Guiné-Bissau</SelectItem>
                      <SelectItem value="sao-tome">São Tomé e Príncipe</SelectItem>
                      <SelectItem value="timor-leste">Timor-Leste</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Contactos (Telefone) *</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange("telefone", e.target.value)}
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Endereço de Correio Electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tituloComunicacao">Título de Comunicação</Label>
                <Input
                  id="tituloComunicacao"
                  value={formData.tituloComunicacao}
                  onChange={(e) => handleInputChange("tituloComunicacao", e.target.value)}
                  placeholder="Opcional - apenas se for apresentar uma comunicação"
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resumo">Resumo</Label>
                <Textarea
                  id="resumo"
                  value={formData.resumo}
                  onChange={(e) => handleInputChange("resumo", e.target.value)}
                  placeholder="Opcional - resumo da comunicação (máximo 300 palavras)"
                  rows={4}
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <Button type="submit" className="w-full animate-scale-in">
                <Send className="h-4 w-4 mr-2" />
                Enviar Inscrição
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
