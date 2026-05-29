import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Globe, GraduationCap, Building, Users } from "lucide-react"

export function PartnersGrid() {
  const partners = [
    {
      name: "Comunidade dos Países de Língua Portuguesa (CPLP)",
      type: "Internacional",
      category: "Organização Multilateral",
      description:
        "Organização internacional que reúne os países de língua portuguesa para cooperação política e diplomática.",
      website: "https://www.cplp.org",
      logo: "/placeholder.svg?height=80&width=200&text=CPLP",
      established: "1996",
      icon: Globe,
    },
    {
      name: "Instituto Internacional da Língua Portuguesa (IILP)",
      type: "Internacional",
      category: "Instituto Especializado",
      description: "Instituto da CPLP dedicado à promoção, defesa, enriquecimento e difusão da língua portuguesa.",
      website: "https://www.iilp.org.cv",
      logo: "/placeholder.svg?height=80&width=200&text=IILP",
      established: "1989",
      icon: GraduationCap,
    },
    {
      name: "Universidade Agostinho Neto",
      type: "Nacional",
      category: "Instituição de Ensino",
      description: "Principal universidade de Angola, parceira em projetos de investigação linguística e formação.",
      website: "https://www.uan.ao",
      logo: "/placeholder.svg?height=80&width=200&text=UAN",
      established: "1962",
      icon: GraduationCap,
    },
    {
      name: "Ministério da Educação de Angola",
      type: "Nacional",
      category: "Órgão Governamental",
      description: "Ministério tutelar responsável pelas políticas educativas e linguísticas do país.",
      website: "#",
      logo: "/placeholder.svg?height=80&width=200&text=MED",
      established: "1975",
      icon: Building,
    },
    {
      name: "Academia Brasileira de Letras",
      type: "Internacional",
      category: "Academia",
      description: "Instituição cultural brasileira dedicada à língua e literatura portuguesa.",
      website: "https://www.academia.org.br",
      logo: "/placeholder.svg?height=80&width=200&text=ABL",
      established: "1897",
      icon: Users,
    },
    {
      name: "Academia das Ciências de Lisboa",
      type: "Internacional",
      category: "Academia",
      description: "Academia portuguesa que colabora em projetos de investigação linguística.",
      website: "https://www.acad-ciencias.pt",
      logo: "/placeholder.svg?height=80&width=200&text=ACL",
      established: "1779",
      icon: Users,
    },
    {
      name: "Instituto Camões",
      type: "Internacional",
      category: "Instituto Cultural",
      description: "Instituto português para a cooperação e língua, promovendo a cultura lusófona.",
      website: "https://www.instituto-camoes.pt",
      logo: "/placeholder.svg?height=80&width=200&text=IC",
      established: "1992",
      icon: Globe,
    },
    {
      name: "Fundação Calouste Gulbenkian",
      type: "Internacional",
      category: "Fundação",
      description: "Fundação que apoia projetos culturais e educativos nos países lusófonos.",
      website: "https://gulbenkian.pt",
      logo: "/placeholder.svg?height=80&width=200&text=FCG",
      established: "1956",
      icon: Building,
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Internacional":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Nacional":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Nossos Parceiros</h2>
        <p className="text-muted-foreground">
          Instituições que colaboram connosco na promoção e desenvolvimento da língua portuguesa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner, index) => {
          const Icon = partner.icon
          return (
            <Card key={index} className="group hover:-translate-y-0.5 transition-all duration-200">
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-center h-20 bg-muted/30 rounded-lg">
                    <img
                      src={partner.logo || "/placeholder.svg"}
                      alt={`Logo ${partner.name}`}
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-lg leading-tight">{partner.name}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getTypeColor(partner.type)}>{partner.type}</Badge>
                      <Badge variant="outline">{partner.category}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{partner.description}</p>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon className="h-4 w-4" />
                    <span>Desde {partner.established}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href={partner.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visitar website
                  </a>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
