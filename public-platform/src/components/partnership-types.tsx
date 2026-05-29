import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, GraduationCap, Building, Users, BookOpen, Handshake } from "lucide-react"

export function PartnershipTypes() {
  const partnershipTypes = [
    {
      title: "CPLP e Organizações Internacionais",
      icon: Globe,
      description: "Cooperação com a Comunidade dos Países de Língua Portuguesa e outras organizações multilaterais",
      count: 8,
      examples: ["CPLP", "IILP", "UNESCO", "OEI"],
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    },
    {
      title: "Instituições de Ensino Superior",
      icon: GraduationCap,
      description: "Parcerias com universidades nacionais e internacionais para investigação e formação",
      count: 12,
      examples: ["Universidade Agostinho Neto", "Universidade de Coimbra", "USP", "UFRJ"],
      color: "bg-green-500/10 text-green-700 dark:text-green-300",
    },
    {
      title: "Órgãos Governamentais",
      icon: Building,
      description: "Colaboração com ministérios e instituições públicas nacionais e estrangeiras",
      count: 6,
      examples: ["Ministério da Educação", "Instituto Camões", "Fundações Públicas"],
      color: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
    },
    {
      title: "Academias e Sociedades Científicas",
      icon: Users,
      description: "Cooperação com academias de letras e sociedades científicas lusófonas",
      count: 5,
      examples: ["Academia Brasileira de Letras", "Academia das Ciências de Lisboa"],
      color: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    },
    {
      title: "Editoras e Meios de Comunicação",
      icon: BookOpen,
      description: "Parcerias para publicação e divulgação de materiais educativos",
      count: 10,
      examples: ["Editoras Especializadas", "Meios de Comunicação", "Plataformas Digitais"],
      color: "bg-red-500/10 text-red-700 dark:text-red-300",
    },
    {
      title: "Organizações da Sociedade Civil",
      icon: Handshake,
      description: "Colaboração com ONGs e associações culturais e educativas",
      count: 15,
      examples: ["Associações Culturais", "ONGs Educativas", "Grupos Comunitários"],
      color: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partnershipTypes.map((type, index) => {
          const Icon = type.icon
          return (
            <Card key={index} className="group hover:-translate-y-0.5 transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-3 rounded-lg ${type.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg leading-tight">{type.title}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {type.count} parceiros
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{type.description}</p>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Exemplos:</h4>
                  <div className="flex flex-wrap gap-1">
                    {type.examples.map((example, exampleIndex) => (
                      <Badge key={exampleIndex} variant="secondary" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
