import Link from "next/link"
import { Clock, User } from "lucide-react"
import { formatDate } from "@/lib/format-date"
import { getPostTypeLabel } from "@/lib/display-labels"
import { readingMinutes } from "@/lib/reading-time"
import type { PublicBlogPost } from "@/lib/public-api"

export function ArticleCard({ article, featured = false }: { article: PublicBlogPost; featured?: boolean }) {
  const href = `/articles/${article.slug || article.id}`
  const date = article.publishedAt || article.createdAt
  const minutes = readingMinutes(article.content)

  return (
    <article className={`group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md ${featured ? "md:grid md:grid-cols-2" : "flex flex-col"}`}>
      <Link href={href} className={`block overflow-hidden bg-muted ${featured ? "md:min-h-72" : ""}`} tabIndex={-1} aria-hidden="true">
        {article.coverImageUrl ? (
          <img src={article.coverImageUrl} alt="" loading="lazy" className={`w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${featured ? "h-full min-h-56" : "aspect-video"}`} />
        ) : (
          <div className={`flex w-full items-center justify-center bg-primary/5 text-primary/30 ${featured ? "h-full min-h-56" : "aspect-video"}`}>
            <span className="text-5xl font-extrabold">{article.title.charAt(0)}</span>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          {article.category && <span className="rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary">{article.category}</span>}
          {article.type && article.type !== "ARTICLE" && <span className="text-muted-foreground">{getPostTypeLabel(article.type)}</span>}
        </div>
        <h2 className={`font-bold leading-snug ${featured ? "text-2xl md:text-3xl" : "text-lg"}`}>
          <Link href={href} className="hover:text-primary">{article.title}</Link>
        </h2>
        {article.excerpt && <p className={`mt-2 text-sm leading-relaxed text-muted-foreground ${featured ? "line-clamp-4" : "line-clamp-3"}`}>{article.excerpt}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-xs text-muted-foreground">
          {article.author?.name && <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author.name}</span>}
          {date && <time dateTime={date}>{formatDate(date, { day: "numeric", month: "short", year: "numeric" })}</time>}
          {minutes && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{minutes} min de leitura</span>}
        </div>
      </div>
    </article>
  )
}
