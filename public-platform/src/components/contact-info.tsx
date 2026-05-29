"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin, Youtube, Send } from "lucide-react"

export function ContactInfo() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const contactDetails = [
    {
      icon: MapPin,
      title: "Endereço",
      content: ["Ministério da Educação", "Rua 17 de Setembro", "Luanda, Angola"],
    },
    {
      icon: Phone,
      title: "Telefone",
      content: ["+244 222 334 455", "+244 222 334 456"],
    },
    {
      icon: Mail,
      title: "Email",
      content: ["info@cnlp.gov.ao", "secretaria@cnlp.gov.ao"],
    },
    {
      icon: Clock,
      title: "Horário",
      content: ["Segunda a Sexta: 08:00 - 17:00", "Sábado: 08:00 - 12:00"],
    },
  ]

  const socialMedia = [
    { icon: Facebook, name: "Facebook", url: "#", color: "text-blue-600" },
    { icon: Instagram, name: "Instagram", url: "#", color: "text-pink-600" },
    { icon: Linkedin, name: "LinkedIn", url: "#", color: "text-blue-700" },
    { icon: Youtube, name: "YouTube", url: "#", color: "text-red-600" },
  ]

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Send className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">Mensagem enviada!</h3>
              <p className="text-muted-foreground">
                Obrigado pelo seu contacto. Responderemos à sua mensagem o mais breve possível.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Contacte-nos</h2>
        <p className="text-muted-foreground">
          Entre em contacto connosco para esclarecimentos, sugestões ou colaborações
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Informações de Contacto</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactDetails.map((detail, index) => {
              const Icon = detail.icon
              return (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{detail.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {detail.content.map((line, lineIndex) => (
                        <p key={lineIndex} className="text-sm text-muted-foreground">
                          {line}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                {socialMedia.map((social, index) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={index}
                      href={social.url}
                      className={`p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors ${social.color}`}
                      title={social.name}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Siga-nos nas redes sociais para atualizações e conteúdos exclusivos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Envie-nos uma Mensagem</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nome completo
                  </label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Assunto
                </label>
                <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o assunto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Informação Geral</SelectItem>
                    <SelectItem value="colaboracao">Proposta de Colaboração</SelectItem>
                    <SelectItem value="recursos">Recursos Educativos</SelectItem>
                    <SelectItem value="eventos">Eventos e Atividades</SelectItem>
                    <SelectItem value="sugestao">Sugestões</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Mensagem
                </label>
                <Textarea
                  id="message"
                  placeholder="Escreva a sua mensagem aqui..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!formData.name || !formData.email || !formData.message}
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar mensagem
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
