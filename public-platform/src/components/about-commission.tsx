import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Users, BookOpen, Globe, Award, Lightbulb } from "lucide-react"

export function AboutCommission() {
  const objectives = [
    {
      icon: Target,
      title: "Promoção da Língua",
      description: "Promover o uso correto e enriquecimento da língua portuguesa em Angola",
    },
    {
      icon: BookOpen,
      title: "Recursos Educativos",
      description: "Desenvolver materiais didáticos e recursos para o ensino do português",
    },
    {
      icon: Globe,
      title: "Cooperação Internacional",
      description: "Fortalecer laços com países lusófonos e organizações internacionais",
    },
    {
      icon: Award,
      title: "Normalização Linguística",
      description: "Estabelecer normas e padrões para o português angolano",
    },
  ]

  const members = [
    {
      name: "Dra. Paula Henriques",
      position: "Coordenadora Nacional",
      specialization: "Linguística Aplicada",
      institution: "Universidade Agostinho Neto",
    },
    {
      name: "Téc. Leo da Silva",
      position: "Gestor de Porjectos",
      specialization: "Técnico de Informática",
      institution: "Ministério da Educação",
    },
    {
      name: "Téc. Jonatão Cardoso",
      position: "Desenvolvedor de Sistemas",
      specialization: "Gramática Histórica",
      institution: "Instituto Superior de Ciências da Educação",
    },
    {
      name: "Téc. Jesus Fernando",
      position: "Coordenadora de Projetos",
      specialization: "Sociolinguística",
      institution: "Academia Angolana de Letras",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Comissão Nacional de Língua Portuguesa</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Criada para promover, preservar e desenvolver a língua portuguesa em Angola, a nossa comissão trabalha
          incansavelmente pela valorização do património linguístico nacional.
        </p>
      </div>

      {/* Mission and Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Nossa Missão</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Promover o desenvolvimento, preservação e difusão da língua portuguesa em Angola, garantindo a sua
              vitalidade como instrumento de comunicação, educação e expressão cultural, respeitando as especificidades
              nacionais e contribuindo para o enriquecimento da lusofonia mundial.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle>Nossa Visão</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Ser a instituição de referência na promoção da língua portuguesa em Angola, reconhecida pela excelência
              dos seus trabalhos, pela qualidade dos recursos produzidos e pela contribuição significativa para a
              educação e cultura nacionais e lusófonas.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Objectives */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-6">Nossos Objetivos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {objectives.map((objective, index) => {
            const Icon = objective.icon
            return (
              <Card key={index} className="text-center group hover:-translate-y-0.5 transition-all duration-200">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{objective.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{objective.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Commission Members */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-6">Membros da Comissão</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {members.map((member, index) => (
            <Card key={index} className="group hover:-translate-y-0.5 transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <Badge variant="secondary">{member.position}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">Especialização:</span>
                  <span className="text-muted-foreground ml-1">{member.specialization}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Instituição:</span>
                  <span className="text-muted-foreground ml-1">{member.institution}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
