import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, ArrowLeft, Share2, Download } from "lucide-react"
import Link from "next/link"

const articleData = {
  id: 1,
  title: "O Futuro da Língua Portuguesa em Angola",
  author: "Prof. Dr. Carlos Mendes",
  authorRole: "Linguista e investigador — Universidade Agostinho Neto",
  date: "2024-03-01",
  readTime: "10 min",
  category: "Linguística",
  abstract:
    "Este artigo apresenta uma análise prospectiva sobre a evolução da língua portuguesa em Angola, considerando os fatores demográficos, educacionais e tecnológicos que moldarão o seu desenvolvimento nas próximas décadas.",
  color: "from-blue-700 to-blue-950",
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 mt-10 mb-4">
      <span className="mt-1 shrink-0 w-1 h-6 rounded-full bg-blue-500" />
      <h2 className="text-xl font-bold text-foreground">{children}</h2>
    </div>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">{children}</h3>
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-[17px] leading-[1.85] text-muted-foreground mb-4">{children}</p>
}

function ArticleList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 my-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[17px] leading-[1.85] text-muted-foreground">
          <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-6 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg px-5 py-4">
      <p className="text-[17px] leading-[1.85] text-blue-900 dark:text-blue-200 italic">{children}</p>
    </blockquote>
  )
}

export default function ArticlePage({ params: _params }: { params: { id: string } }) {
  const initials = articleData.author.split(" ").filter(w => w.length > 1 && w[0] === w[0].toUpperCase()).slice(-2).map(w => w[0]).join("")

  return (
    <div className="min-h-screen bg-background pt-[4.75rem]">
      <Header />

      {/* Hero banner */}
      <div className={`relative min-h-[580px] bg-gradient-to-br ${articleData.color} overflow-hidden`}>

        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />

        {/* Back link — top */}
        <div className="absolute top-8 left-0 right-0 z-10">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <Link
              href="/artigos"
              className="inline-flex items-center gap-1.5 text-sm text-white/65 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos artigos
            </Link>
          </div>
        </div>

        {/* Main content — bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">

            {/* Category badge */}
            <div className="mb-5">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs font-semibold uppercase tracking-widest">
                {articleData.category}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-[3.25rem] font-extrabold text-white leading-tight max-w-4xl mb-5">
              {articleData.title}
            </h1>

            {/* Abstract */}
            <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-2xl mb-8">
              {articleData.abstract}
            </p>

            {/* Meta + actions row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {initials}
                </div>
                <span className="text-white/90 text-sm font-medium">{articleData.author}</span>
              </span>
              <span className="flex items-center gap-1.5 text-sm text-white/60">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(articleData.date).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-white/60">
                <Clock className="h-3.5 w-3.5" />
                {articleData.readTime} de leitura
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 h-8 rounded-lg text-white/65 hover:text-white hover:bg-white/15 border-0"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs">Partilhar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 h-8 rounded-lg text-white/65 hover:text-white hover:bg-white/15 border-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs">PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-16">
        <div className="max-w-2xl mx-auto">

          {/* Content */}
          <SectionHeading>Introdução</SectionHeading>
          <Paragraph>
            Angola é um país de profunda riqueza linguística. Com mais de vinte línguas nacionais e o português como
            língua oficial, o país enfrenta um momento decisivo na forma como organiza, ensina e preserva o seu
            patrimônio linguístico. Nas últimas três décadas, a língua portuguesa consolidou-se como veículo de
            comunicação inter-étnica, de acesso à educação formal e de participação na vida pública.
          </Paragraph>
          <Paragraph>
            No entanto, os desafios são consideráveis. A rápida urbanização, a expansão dos meios digitais e a
            diversidade geracional criam pressões sobre a norma linguística e abrem espaço para novas formas de
            expressão que merecem estudo aprofundado.
          </Paragraph>

          <SectionHeading>O Contexto Demográfico</SectionHeading>
          <Paragraph>
            Angola tem uma das populações mais jovens do mundo, com mais de 65% da população abaixo dos 25 anos.
            Esta realidade impõe exigências específicas ao sistema de ensino da língua portuguesa. Os jovens
            angolanos crescem em ambientes onde o português convive diariamente com o kimbundu, o kikongo, o
            umbundu e outras línguas nacionais.
          </Paragraph>
          <Callout>
            "A vitalidade de uma língua não se mede apenas pelo número de falantes, mas pela profundidade com que
            penetra na vida cultural e intelectual de um povo."
          </Callout>
          <Paragraph>
            Esta convivência produz um português angolano com características próprias — lexicais, fonéticas e
            pragmáticas — que distinguem Angola dos demais países lusófonos e enriquecem o panorama da língua
            portuguesa no mundo.
          </Paragraph>

          <SectionHeading>Fatores que Moldam o Futuro</SectionHeading>
          <SubHeading>Educação e Formação</SubHeading>
          <Paragraph>
            O investimento crescente na rede escolar pública e na formação de professores especializados em língua
            portuguesa é, provavelmente, o fator mais determinante para o futuro linguístico do país. A qualidade
            do ensino básico e secundário define as competências linguísticas das gerações futuras.
          </Paragraph>
          <ArticleList
            items={[
              "Formação contínua de docentes em metodologias de ensino da língua materna",
              "Produção de manuais escolares adequados ao contexto angolano",
              "Integração curricular das línguas nacionais no ensino básico",
              "Promoção da leitura através de bibliotecas escolares e programas de literacia",
            ]}
          />

          <SubHeading>Tecnologia e Meios Digitais</SubHeading>
          <Paragraph>
            A explosão do acesso à internet e às redes sociais em Angola tem duplo efeito sobre a língua. Por um
            lado, expõe os falantes a um português mais global e padronizado; por outro, acelera a difusão de
            neologismos, calões e hibridismos que emergem da criatividade linguística dos jovens urbanos.
          </Paragraph>
          <Paragraph>
            A ausência de recursos digitais robustos em português angolano — dicionários em linha, corretores
            ortográficos, sintetizadores de voz — representa uma lacuna que a Comissão Nacional tem vindo a
            endereçar através do projeto VONA e de parcerias com instituições internacionais.
          </Paragraph>

          <SectionHeading>Recomendações e Perspetivas</SectionHeading>
          <Paragraph>
            Com base na análise apresentada, identificam-se três eixos estratégicos prioritários para os próximos
            dez anos:
          </Paragraph>
          <ArticleList
            items={[
              "Consolidação do Vocabulário Ortográfico Nacional de Angola (VONA) como referência normativa",
              "Criação de programas de promoção da leitura orientados para contextos urbanos e rurais",
              "Desenvolvimento de tecnologias de processamento de linguagem natural para o português angolano",
            ]}
          />
          <Paragraph>
            O caminho para o futuro passa necessariamente pela conjugação do orgulho na identidade linguística
            angolana com a abertura ao diálogo com a comunidade lusófona global.
          </Paragraph>

          <SectionHeading>Conclusão</SectionHeading>
          <Paragraph>
            A língua portuguesa em Angola vive um momento de transformação vibrante. O desafio das próximas
            gerações será o de afirmar a sua especificidade sem abdicar da unidade que caracteriza a lusofonia.
            Cabe às instituições como a Comissão Nacional criar as condições para que essa afirmação se faça com
            rigor, criatividade e solidariedade linguística.
          </Paragraph>

          <Separator className="my-10" />

          {/* Author card */}
          <div className="flex items-start gap-4 rounded-xl border border-border bg-muted/30 p-5">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-primary">{initials}</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{articleData.author}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{articleData.authorRole}</p>
            </div>
          </div>

          {/* Back button */}
          <div className="mt-10">
            <Link href="/artigos">
              <Button variant="outline" className="rounded-lg gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar aos artigos
              </Button>
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
