import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, ImageIcon, Star, Tag, User, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { publicApi } from "@/lib/public-api"
import { getPostTypeLabel } from "@/lib/display-labels"

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let article

  try {
    article = await publicApi.blogPostDetails(id)
  } catch {
    notFound()
  }

  const date = article.publishedAt || article.createdAt

  return (
    <div className="min-h-screen bg-background pt-[4.75rem]">
      <Header />
      <main>
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
              dangerouslySetInnerHTML={{ __html: article.content ?? "<p>Conteúdo não disponível.</p>" }}
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

          <aside className="space-y-5">
            <Card>
              <CardContent className="p-5">
                <h2 className="text-lg font-bold">Dados da publicação</h2>
                <dl className="mt-4 space-y-4 text-sm">
                  {article.slug && <Detail label="Slug" value={article.slug} />}
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
                    Tags
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
          </aside>
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
  return new Date(value).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })
}

function formatDateTime(value: string) {
  const date = new Date(value)
  return `${formatDate(value)} às ${date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`
}

function isYoutube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be")
}

function youtubeEmbed(url: string) {
  return url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
}
