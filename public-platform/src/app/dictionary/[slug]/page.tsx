import { notFound, permanentRedirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft, Volume2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EntryActions } from "@/components/entry-actions"
import { entryIdFromParam, entryPath, SITE_URL } from "@/lib/entry-slug"
import { getGrammaticalCategoryLabel, getGrammaticalSubcategoryLabel } from "@/lib/grammatical-labels"
import { publicApi, safePublicApi, type PublicEntry } from "@/lib/public-api"

type Params = { params: Promise<{ slug: string }> }

async function loadEntry(slug: string) {
  const id = entryIdFromParam(slug)
  if (!id) return { id: undefined, entry: null as PublicEntry | null }
  return { id, entry: await safePublicApi<PublicEntry | null>(() => publicApi.dictionaryDetails(id), null) }
}

const definitionsOf = (e: PublicEntry) => [e.firstDefinition, e.secondDefinition, e.thirdDefinition].filter(Boolean) as string[]

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { entry } = await loadEntry((await params).slug)
  if (!entry) return { title: "Verbete não encontrado", robots: { index: false } }
  const [first] = definitionsOf(entry)
  const category = getGrammaticalCategoryLabel(entry.grammaticalCategory)
  const description = [category, first].filter(Boolean).join(". ").slice(0, 200)
  const url = `${SITE_URL}${entryPath(entry)}`
  return {
    title: `${entry.entry}: definição e significado`,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${entry.entry} | Dicionário CNLP`, description, url, type: "article", locale: "pt_AO" },
    twitter: { card: "summary", title: entry.entry, description },
  }
}

export default async function VerbetePage({ params }: Params) {
  const { slug } = await params
  const { id, entry } = await loadEntry(slug)
  if (!id || !entry) notFound()

  // Endereço canónico: palavra + id. Qualquer outra forma redireciona para ele.
  const canonical = entryPath(entry)
  if (decodeURIComponent(slug) !== canonical.replace("/dictionary/", "")) permanentRedirect(canonical)

  const definitions = definitionsOf(entry)
  const url = `${SITE_URL}${canonical}`
  const category = getGrammaticalCategoryLabel(entry.grammaticalCategory)
  const subcategory = getGrammaticalSubcategoryLabel(entry.grammaticalCategory, entry.grammaticalSubcategory)
  const citation = `Comissão Nacional de Língua Portuguesa de Angola. «${entry.entry}». Dicionário de Língua Portuguesa. Disponível em: ${url}.`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: entry.entry,
    description: definitions[0],
    url,
    inDefinedTermSet: { "@type": "DefinedTermSet", name: "Dicionário de Língua Portuguesa (CNLP Angola)", url: `${SITE_URL}/dictionary` },
  }

  return (
    <div className="min-h-screen bg-background pt-[4.75rem]">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

        <Link href="/dictionary" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Dicionário
        </Link>

        <article>
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-primary md:text-5xl">{entry.entry}</h1>
              {entry.audioUrl && (
                <a href={entry.audioUrl} target="_blank" rel="noreferrer" aria-label={`Ouvir ${entry.entry}`} className="rounded-full p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                  <Volume2 className="h-5 w-5" />
                </a>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {entry.pronunciation && <span className="font-mono text-sm text-muted-foreground">{entry.pronunciation}</span>}
              {entry.syllabicDivision && <Badge variant="outline">{entry.syllabicDivision}</Badge>}
              {category && <Badge>{category}</Badge>}
              {subcategory && <Badge variant="secondary">{subcategory}</Badge>}
              {entry.isVocabulary && <Badge variant="outline">VONALP</Badge>}
              {entry.isVocabularyEP && <Badge variant="outline">VONALP-EP</Badge>}
              {entry.isForeignism && <Badge variant="outline">Estrangeirismo</Badge>}
            </div>
          </header>

          <div className="mt-6">
            <EntryActions id={entry.id} word={entry.entry} citation={citation} />
          </div>

          <section className="mt-8" aria-labelledby="definicoes">
            <h2 id="definicoes" className="mb-3 text-xl font-bold">Definições</h2>
            {definitions.length > 0 ? (
              <ol className="list-decimal space-y-3 pl-6 text-lg leading-relaxed">
                {definitions.map((definition, index) => <li key={index}>{definition}</li>)}
              </ol>
            ) : (
              <p className="text-muted-foreground">Definição não disponível.</p>
            )}
          </section>

          {entry.usageExample && (
            <section className="mt-8">
              <h2 className="mb-3 text-xl font-bold">Exemplo de uso</h2>
              <blockquote className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground">{entry.usageExample}</blockquote>
            </section>
          )}

          {entry.etymology && (
            <section className="mt-8">
              <h2 className="mb-3 text-xl font-bold">Etimologia</h2>
              <p className="leading-relaxed text-muted-foreground">{entry.etymology}</p>
            </section>
          )}

          {entry.imageUrl && (
            <img src={entry.imageUrl} alt={`Ilustração de ${entry.entry}`} className="mt-8 max-h-80 rounded-lg border object-contain" />
          )}

          <footer className="mt-10 border-t pt-4 text-sm text-muted-foreground">
            <p>{citation}</p>
          </footer>
        </article>
      </main>
      <Footer />
    </div>
  )
}
