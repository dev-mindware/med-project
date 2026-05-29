"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, Download, Share2 } from "lucide-react"
import Link from "next/link"

// Mock article data - in real app this would come from API/database
const mockArticle = {
  id: "1",
  title: "A Evolução da Língua Portuguesa em Angola: Perspectivas Contemporâneas",
  author: "Dr. Maria Santos",
  date: "2024-01-15",
  category: "Linguística",
  readTime: "12 min",
  abstract:
    "Este artigo examina as transformações da língua portuguesa em Angola desde a independência, analisando as influências das línguas nacionais e as adaptações locais que caracterizam o português angolano contemporâneo.",
  content: `
    <h2>Introdução</h2>
    <p>A língua portuguesa em Angola passou por transformações significativas desde a independência do país em 1975. Este processo de evolução linguística reflete não apenas mudanças políticas e sociais, mas também a rica diversidade cultural angolana.</p>
    
    <h2>Contexto Histórico</h2>
    <p>Durante o período colonial, o português era principalmente a língua da administração e da educação formal. No entanto, a maioria da população mantinha suas línguas nacionais como meio de comunicação primário.</p>
    
    <h2>Influências das Línguas Nacionais</h2>
    <p>O português angolano incorporou elementos lexicais, fonéticos e sintáticos das línguas bantu locais, particularmente do kimbundu, umbundu e kikongo. Esta influência é evidente em:</p>
    <ul>
      <li>Empréstimos lexicais para conceitos culturais específicos</li>
      <li>Adaptações fonéticas que refletem os sistemas sonoros das línguas nacionais</li>
      <li>Estruturas sintáticas que mostram interferência das línguas bantu</li>
    </ul>
    
    <h2>Características do Português Angolano</h2>
    <p>O português falado em Angola apresenta características distintivas que o diferenciam das outras variedades da língua:</p>
    
    <h3>Aspectos Lexicais</h3>
    <p>Incorporação de termos das línguas nacionais para designar realidades locais, como "muxima" (coração), "kandengue" (criança), e "zungueira" (vendedora ambulante).</p>
    
    <h3>Aspectos Fonéticos</h3>
    <p>Adaptações na pronúncia que refletem os sistemas fonológicos das línguas bantu, incluindo a realização de certas vogais e consoantes.</p>
    
    <h2>Políticas Linguísticas Atuais</h2>
    <p>O governo angolano tem implementado políticas que reconhecem tanto o português como língua oficial quanto a importância das línguas nacionais na educação e na preservação cultural.</p>
    
    <h2>Desafios e Oportunidades</h2>
    <p>A padronização do português angolano apresenta desafios únicos, incluindo a necessidade de equilibrar a manutenção da unidade linguística com o reconhecimento das especificidades locais.</p>
    
    <h2>Conclusão</h2>
    <p>A evolução da língua portuguesa em Angola representa um processo dinâmico de adaptação cultural e linguística. O reconhecimento e a documentação dessas variações são essenciais para a preservação da riqueza linguística angolana.</p>
  `,
}

export default function ArticlePage() {
  const [article] = useState(mockArticle)

  return (
    <div className="min-h-screen bg-background py-8 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/articles"
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Artigos
          </Link>
        </div>

        <Card className="hover-lift">
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{article.category}</Badge>
              <Badge variant="outline">{article.readTime}</Badge>
            </div>
            <CardTitle className="text-3xl text-primary mb-4">{article.title}</CardTitle>
            <CardDescription className="text-lg">{article.abstract}</CardDescription>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {article.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(article.date).toLocaleDateString("pt-AO")}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Partilhar
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div
              className="prose prose-lg max-w-none dark:prose-invert animate-slide-up"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
