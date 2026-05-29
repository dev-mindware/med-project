"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, BookOpen, Users, Scale, Search, Presentation, Download, Eye } from "lucide-react"

interface Document {
  id: string
  title: string
  size: string
  date: string
  downloadUrl: string
}

export function DocumentCategories() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    {
      id: "manuais",
      name: "Manuais Escolares",
      icon: BookOpen,
      description: "Manuais de língua portuguesa adaptados ao contexto educativo angolano",
      count: 25,
      recent: ["Manual de Ortografia", "Gramática Prática", "Exercícios de Português"],
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      documents: [
        {
          id: "1",
          title: "Manual de Ortografia Angolana",
          size: "2.5 MB",
          date: "2024-01-15",
          downloadUrl: "/docs/manual-ortografia.pdf",
        },
        {
          id: "2",
          title: "Gramática Prática do Português",
          size: "3.2 MB",
          date: "2024-01-10",
          downloadUrl: "/docs/gramatica-pratica.pdf",
        },
        {
          id: "3",
          title: "Exercícios de Português - 1º Ciclo",
          size: "1.8 MB",
          date: "2024-01-05",
          downloadUrl: "/docs/exercicios-1ciclo.pdf",
        },
      ],
    },
    {
      id: "cplp",
      name: "Brochuras CPLP",
      icon: Users,
      description: "Documentos oficiais da Comunidade dos Países de Língua Portuguesa",
      count: 18,
      recent: ["Cooperação Linguística", "Acordo Ortográfico", "Plano Estratégico"],
      color: "bg-green-500/10 text-green-700 dark:text-green-300",
      documents: [
        {
          id: "4",
          title: "Cooperação Linguística na CPLP",
          size: "4.1 MB",
          date: "2024-01-20",
          downloadUrl: "/docs/cooperacao-linguistica.pdf",
        },
        {
          id: "5",
          title: "Acordo Ortográfico da Língua Portuguesa",
          size: "1.2 MB",
          date: "2024-01-18",
          downloadUrl: "/docs/acordo-ortografico.pdf",
        },
        {
          id: "6",
          title: "Plano Estratégico CPLP 2024-2028",
          size: "5.3 MB",
          date: "2024-01-12",
          downloadUrl: "/docs/plano-estrategico.pdf",
        },
      ],
    },
    {
      id: "legislacao",
      name: "Legislação",
      icon: Scale,
      description: "Leis, decretos e regulamentos sobre a língua portuguesa em Angola",
      count: 12,
      recent: ["Lei de Bases da Educação", "Decreto sobre Ortografia", "Regulamento CNLP"],
      color: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
      documents: [
        {
          id: "7",
          title: "Lei de Bases da Educação",
          size: "6.0 MB",
          date: "2024-01-25",
          downloadUrl: "/docs/lei-educacao.pdf",
        },
        {
          id: "8",
          title: "Decreto sobre Ortografia",
          size: "2.8 MB",
          date: "2024-01-22",
          downloadUrl: "/docs/decreto-ortografia.pdf",
        },
        {
          id: "9",
          title: "Regulamento CN-IILP",
          size: "4.5 MB",
          date: "2024-01-19",
          downloadUrl: "/docs/regulamento-cnlp.pdf",
        },
      ],
    },
    {
      id: "relatorios",
      name: "Relatórios",
      icon: FileText,
      description: "Relatórios anuais e documentos de atividades da comissão",
      count: 15,
      recent: ["Relatório Anual 2023", "Atividades do 1º Semestre", "Balanço de Projetos"],
      color: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
      documents: [
        {
          id: "10",
          title: "Relatório Anual 2023",
          size: "7.1 MB",
          date: "2024-01-30",
          downloadUrl: "/docs/relatorio-2023.pdf",
        },
        {
          id: "11",
          title: "Atividades do 1º Semestre",
          size: "3.9 MB",
          date: "2024-01-28",
          downloadUrl: "/docs/atividades-1semestre.pdf",
        },
        {
          id: "12",
          title: "Balanço de Projetos",
          size: "5.6 MB",
          date: "2024-01-26",
          downloadUrl: "/docs/balanco-projetos.pdf",
        },
      ],
    },
    {
      id: "pesquisas",
      name: "Pesquisas",
      icon: Search,
      description: "Estudos e pesquisas sobre a língua portuguesa em Angola",
      count: 22,
      recent: ["Variações Linguísticas", "Estudo Sociolinguístico", "Análise do Vocabulário"],
      color: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
      documents: [
        {
          id: "13",
          title: "Variações Linguísticas",
          size: "8.2 MB",
          date: "2024-01-31",
          downloadUrl: "/docs/variacoes-linguisticas.pdf",
        },
        {
          id: "14",
          title: "Estudo Sociolinguístico",
          size: "4.8 MB",
          date: "2024-01-29",
          downloadUrl: "/docs/estudo-sociolinguistico.pdf",
        },
        {
          id: "15",
          title: "Análise do Vocabulário",
          size: "6.3 MB",
          date: "2024-01-27",
          downloadUrl: "/docs/analise-vocabulario.pdf",
        },
      ],
    },
    {
      id: "apresentacoes",
      name: "Apresentações",
      icon: Presentation,
      description: "Slides e materiais de apresentações em eventos e conferências",
      count: 30,
      recent: ["Conferência CPLP 2024", "Seminário de Gramática", "Workshop de Ortografia"],
      color: "bg-red-500/10 text-red-700 dark:text-red-300",
      documents: [
        {
          id: "16",
          title: "Conferência CPLP 2024",
          size: "9.0 MB",
          date: "2024-02-01",
          downloadUrl: "/docs/conferencia-cplp.pdf",
        },
        {
          id: "17",
          title: "Seminário de Gramática",
          size: "5.5 MB",
          date: "2024-01-31",
          downloadUrl: "/docs/seminario-gramatica.pdf",
        },
        {
          id: "18",
          title: "Workshop de Ortografia",
          size: "7.7 MB",
          date: "2024-01-30",
          downloadUrl: "/docs/workshop-ortografia.pdf",
        },
      ],
    },
  ]

  const handleDownload = (document: Document) => {
    console.log("[v0] Downloading document:", document.title)
    const link = document.createElement("a")
    link.href = document.downloadUrl
    link.download = document.title + ".pdf"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    alert(`A descarregar: ${document.title}`)
  }

  const handlePreview = (document: Document) => {
    console.log("[v0] Previewing document:", document.title)
    window.open(document.downloadUrl, "_blank")
  }

  if (selectedCategory) {
    const category = categories.find((c) => c.id === selectedCategory)
    if (!category) return null

    return (
      <div className="space-y-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">{category.name}</h2>
            <p className="text-muted-foreground mt-2">{category.description}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedCategory(null)}>
            Voltar às Categorias
          </Button>
        </div>

        <div className="grid gap-4">
          {category.documents?.map((document) => (
            <Card key={document.id} className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{document.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span>Tamanho: {document.size}</span>
                        <span>Data: {new Date(document.date).toLocaleDateString("pt-AO")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handlePreview(document)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button size="sm" onClick={() => handleDownload(document)}>
                      <Download className="h-4 w-4 mr-2" />
                      Descarregar PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Categorias de Documentos</h2>
        <p className="text-muted-foreground">
          Explore nossa biblioteca organizada de documentos oficiais e materiais educativos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const Icon = category.icon
          return (
            <Card key={index} className="group hover-lift transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {category.count} documentos
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Documentos recentes:</h4>
                  <ul className="space-y-1">
                    {category.recent.map((doc, docIndex) => (
                      <li key={docIndex} className="text-sm text-muted-foreground">
                        • {doc}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  Ver documentos
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
