import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, ImageIcon, Star, Tag, User, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SITE_URL } from "@/lib/entry-slug"
import { formatDate as formatDay, formatTime as formatHour } from "@/lib/format-date"
import { readingMinutes } from "@/lib/reading-time"
import { sanitizeArticleHtml } from "@/lib/sanitize"
import { publicApi, safePublicApi } from "@/lib/public-api"
import { getPostTypeLabel } from "@/lib/display-labels"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const article = await safePublicApi(() => publicApi.blogPostDetails(id), null)
  if (!article) return { title: "Artigo não encontrado", robots: { index: false } }
  const description = (article.excerpt ?? "").slice(0, 200) || undefined
  return {
    title: article.title,
    description,
    alternates: { canonical: `${SITE_URL}/articles/${article.slug || article.id}` },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      locale: "pt_AO",
      publishedTime: article.publishedAt ?? undefined,
      authors: article.author?.name ? [article.author.name] : undefined,
      ...(article.coverImageUrl ? { images: [article.coverImageUrl] } : {}),
    },
    twitter: { card: article.coverImageUrl ? "summary_large_image" : "summary", title: article.title, description },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let article

  try {
    article = await publicApi.blogPostDetails(id)
  } catch {
    notFound()
  }

  const date = article.publishedAt || article.createdAt
  const minutes = readingMinutes(article.content)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    ...(article.excerpt ? { description: article.excerpt } : {}),
    ...(article.coverImageUrl ? { image: article.coverImageUrl } : {}),
    ...(date ? { datePublished: date } : {}),
    ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
    ...(article.author?.name ? { author: { "@type": "Person", name: article.author.name } } : {}),
    publisher: { "@type": "Organization", name: "Comissão Nacional de Língua Portuguesa de Angola", url: SITE_URL },
  }

  return (
    <div className="min-h-screen bg-background pt-[4.75rem]">
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <section className="relative overflow-hidden border-b border-border bg-muted/30">
          {article.coverImageUrl && (
            <img src={article.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
          <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
            <Link href="/articles" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Voltar aos artigos
            </Link>

            <div className="mt-10 max-w-4xl">
              <div className="flex flex-wrap gap-2">
                {article.category && <Badge>{article.category}</Badge>}
                {article.type && <Badge variant="outline">{getPostTypeLabel(article.type)}</Badge>}
                {article.isFeatured && (
                  <Badge variant="secondary">
                    <Star className="mr-1.5 h-3.5 w-3.5" />
                    Destaque
                  </Badge>
                )}
              </div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-6xl">{article.title}</h1>
              {article.excerpt && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>}

              <div className="mt-7 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {article.author?.name && (
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {article.author.name}
                  </span>
                )}
                {date && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(date)}
                  </span>
                )}
                {minutes && (
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {minutes} min de leitura
                  </span>
                )}
                {article.videoUrl && (
                  <span className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Vídeo associado
                  </span>
                )}
                {article.galleryImageUrls?.length ? (
                  <span className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {article.galleryImageUrls.length} imagem{article.galleryImageUrls.length === 1 ? "" : "s"}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-12">
          <article className="min-w-0">
            {article.coverImageUrl && (
              <img src={article.coverImageUrl} alt={article.title} className="mb-8 aspect-video w-full rounded-lg object-cover" />
            )}

            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content ? sanitizeArticleHtml(article.content) : "<p>Conteúdo não disponível.</p>" }}
            />

            {article.videoUrl && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold">Vídeo</h2>
                <div className="mt-4 overflow-hidden rounded-lg border border-border bg-muted">
                  {isYoutube(article.videoUrl) ? (
                    <iframe src={youtubeEmbed(article.videoUrl)} className="aspect-video w-full" allowFullScreen />
                  ) : (
                    <video src={article.videoUrl} controls className="aspect-video w-full object-cover" />
                  )}
                </div>
              </div>
            )}

            {article.galleryImageUrls && article.galleryImageUrls.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold">Galeria</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {article.galleryImageUrls.map((imageUrl) => (
                    <img key={imageUrl} src={imageUrl} alt="" className="aspect-video w-full rounded-lg object-cover" />
                  ))}
                </div>
              </div>
            )}
          </article>

          <div className="space-y-5">
            <Card>
              <CardContent className="p-5">
                <h2 className="text-lg font-bold">Dados da publicação</h2>
                <dl className="mt-4 space-y-4 text-sm">
                  {article.slug && <Detail label="Endereço (slug)" value={article.slug} />}
                  {article.type && <Detail label="Tipo" value={getPostTypeLabel(article.type)} />}
                  {article.category && <Detail label="Categoria" value={article.category} />}
                  <Detail label="Destaque" value={article.isFeatured ? "Sim" : "Não"} />
                  {article.publishedAt && <Detail label="Publicado em" value={formatDateTime(article.publishedAt)} />}
                  {article.author?.name && <Detail label="Autor" value={article.author.name} />}
                </dl>
              </CardContent>
            </Card>

            {article.tags && article.tags.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h2 className="flex items-center gap-2 text-lg font-bold">
                    <Tag className="h-4 w-4" />
                    Etiquetas
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/articles">Ver todos os artigos</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-foreground">{value}</dd>
    </div>
  )
}

function formatDate(value: string) {
  return formatDay(value)
}

function formatDateTime(value: string) {
  return `${formatDate(value)} às ${formatHour(value)}`
}

function isYoutube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be")
}

function youtubeEmbed(url: string) {
  return url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
}
