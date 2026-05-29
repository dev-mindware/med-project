import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Calendar, Globe, Languages, GraduationCap } from "lucide-react"

export function AboutAngola() {
  const facts = [
    {
      icon: MapPin,
      label: "Capital",
      value: "Luanda",
      description: "Centro político, económico e cultural do país",
    },
    {
      icon: Users,
      label: "População",
      value: "35+ milhões",
      description: "Uma das maiores populações de África",
    },
    {
      icon: Calendar,
      label: "Independência",
      value: "11 de Novembro de 1975",
      description: "Independência de Portugal",
    },
    {
      icon: Languages,
      label: "Línguas Nacionais",
      value: "Português + 6 línguas",
      description: "Umbundu, Kimbundu, Kikongo, Chokwe, Nganguela, Kwanyama",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">República de Angola</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Angola é um país da África Austral com uma rica diversidade cultural e linguística, onde o português
          desempenha um papel fundamental como língua oficial e de unidade nacional.
        </p>
      </div>

      {/* Country Facts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {facts.map((fact, index) => {
          const Icon = fact.icon
          return (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{fact.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-sm font-semibold">
                    {fact.value}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{fact.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>A Língua Portuguesa em Angola</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              O português é a língua oficial de Angola desde a independência, servindo como meio de comunicação nacional
              e instrumento de unidade entre os diversos grupos étnicos do país.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Com mais de 35 milhões de habitantes, Angola é o segundo maior país lusófono do mundo, contribuindo
              significativamente para a diversidade e riqueza da língua portuguesa global.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">Características únicas:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Influências das línguas nacionais africanas</li>
                <li>• Vocabulário específico da realidade angolana</li>
                <li>• Expressões culturais próprias</li>
                <li>• Literatura e arte em português angolano</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <CardTitle>Educação e Cultura</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A educação em português é fundamental para o desenvolvimento nacional, promovendo a alfabetização e o
              acesso ao conhecimento para todos os angolanos.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Angola possui uma rica tradição cultural que se expressa através da literatura, música, dança e artes
              visuais, todas contribuindo para o enriquecimento da cultura lusófona.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">Contribuições culturais:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Literatura angolana de renome internacional</li>
                <li>• Música tradicional e contemporânea</li>
                <li>• Artes plásticas e artesanato</li>
                <li>• Tradições orais e narrativas populares</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
