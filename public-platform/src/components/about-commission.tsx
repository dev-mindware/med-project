import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, BookOpen, Globe, Lightbulb, Target, Users } from "lucide-react"

export function AboutCommission() {
  const objectives = [
    {
      icon: Target,
      title: "Promoção da Língua",
      description: "Promover o uso correcto e o enriquecimento da língua portuguesa em Angola.",
    },
    {
      icon: BookOpen,
      title: "Recursos Educativos",
      description: "Desenvolver materiais didácticos e recursos para o ensino do português.",
    },
    {
      icon: Globe,
      title: "Cooperação Internacional",
      description: "Fortalecer laços com países lusófonos e organizações internacionais.",
    },
    {
      icon: Award,
      title: "Normalização Linguística",
      description: "Estabelecer normas e padrões para o português angolano.",
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
      position: "Gestor de Projetos",
      specialization: "Técnico de Informática",
      institution: "Ministério da Educação",
    },
    {
      name: "Ângelo Domingos",
      position: "Técnico Informático",
      specialization: "Tecnologias de Informação",
      institution: "Universidade Católica de Angola",
    },
    {
      name: "Téc. Jonatão Cardoso",
      position: "Desenvolvedor de Sistemas",
      specialization: "Gramática Histórica",
      institution: "Instituto Superior de Ciências da Educação",
    },
    {
      name: "Téc. Jesus Fernando",
      position: "Coordenador de Projetos",
      specialization: "Sociolinguística",
      institution: "Academia Angolana de Letras",
    },
  ]

  return (
    <div className="space-y-10">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-bold">Comissão Nacional de Língua Portuguesa</h2>
        <p className="text-muted-foreground">
          Criada para promover, preservar e desenvolver a língua portuguesa em Angola, a Comissão trabalha pela
          valorização do património linguístico nacional.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-lg border-blue-100/80">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Nossa Missão</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-muted-foreground">
              Promover o desenvolvimento, preservação e difusão da língua portuguesa em Angola, garantindo a sua
              vitalidade como instrumento de comunicação, educação e expressão cultural, respeitando as especificidades
              nacionais e contribuindo para o enriquecimento da lusofonia mundial.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-blue-100/80">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle>Nossa Visão</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-muted-foreground">
              Ser a instituição de referência na promoção da língua portuguesa em Angola, reconhecida pela excelência
              dos seus trabalhos, pela qualidade dos recursos produzidos e pela contribuição significativa para a
              educação e cultura nacionais e lusófonas.
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-6 text-center text-2xl font-bold">Nossos Objectivos</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {objectives.map((objective) => {
            const Icon = objective.icon
            return (
              <Card key={objective.title} className="group rounded-lg border-blue-100/80 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30">
                <CardHeader>
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{objective.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{objective.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <div className="mx-auto mb-6 max-w-2xl text-center">
          <h3 className="text-2xl font-bold">Membros da Comissão</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Equipa técnica e institucional responsável pela coordenação, produção e apoio aos trabalhos da Comissão.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <Card key={member.name} className="group overflow-hidden rounded-lg border-blue-100/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
              <div className="h-1 w-full bg-primary/70" />
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <Badge variant="secondary" className="mt-2 rounded-md">
                      {member.position}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">Especialização:</span>
                  <span className="ml-1 text-muted-foreground">{member.specialization}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Instituição:</span>
                  <span className="ml-1 text-muted-foreground">{member.institution}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
