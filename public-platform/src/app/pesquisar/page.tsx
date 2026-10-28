import Link from "next/link"
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { publicApi, safePublicApi, type PublicGlobalSearch } from "@/lib/public-api"

export const metadata: Metadata = { title: "Pesquisa" }

type Result = { id: string; label: string; meta?: string | null; text?: string | null; href: string }

const emptyResults: PublicGlobalSearch = {
  query: "",
  entries: [],
  neologisms: [],
  toponyms: [],
  anthroponyms: [],
  foreignisms: [],
}

function buildTabs(data: PublicGlobalSearch) {
  const link = (path: string, label: string) => `${path}?q=${encodeURIComponent(label)}`
  return [
    {
      key: "dicionario",
      label: "Dicionário",
      results: data.entries.map<Result>((e) => ({
        id: e.id,
        label: e.entry,
        meta: e.grammaticalCategory,
        text: e.firstDefinition ?? e.secondDefinition ?? e.thirdDefinition,
        href: link("/dictionary", e.entry),
      })),
    },
    {
      key: "neologismos",
      label: "Neologismos",
      results: data.neologisms.map<Result>((e) => ({
        id: e.id,
        label: e.entry,
        meta: e.grammaticalCategory,
        text: e.firstDefinition ?? e.secondDefinition ?? e.thirdDefinition,
        href: link("/neologismos", e.entry),
      })),
    },
    {
      key: "toponimos",
      label: "Topónimos",
      results: data.toponyms.map<Result>((t) => ({
        id: t.id,
        label: t.toponym,
        meta: t.province,
        text: t.meaning,
        href: link("/toponimos", t.toponym),
      })),
    },
    {
      key: "antroponimos",
      label: "Antropónimos",
      results: data.anthroponyms.map<Result>((a) => ({
        id: a.id,
        label: a.name,
        meta: a.gender,
        text: a.meaning,
        href: link("/antroponimos", a.name),
      })),
    },
    {
      key: "estrangeirismos",
      label: "Estrangeirismos",
      results: data.foreignisms.map<Result>((f) => ({
        id: f.id,
        label: f.term,
        meta: f.originalLanguage,
        text: f.definition ?? f.meaning,
        href: link("/estrangeirismos", f.term),
      })),
    },
  ]
}

/** Cada colecção devolve no máximo este número de resultados na pesquisa global. */
const PER_COLLECTION = 8

export default async function PesquisarPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; tipo?: string }>
}) {
  const params = await searchParams
  const q = (params?.q ?? "").trim()
  const data = q.length >= 2 ? await safePublicApi(() => publicApi.globalSearch(q), emptyResults) : emptyResults
  const tabs = buildTabs(data)
  const total = tabs.reduce((sum, tab) => sum + tab.results.length, 0)
  const active = tabs.find((tab) => tab.key === params?.tipo)
  const visible = active ? [active] : tabs.filter((tab) => tab.results.length > 0)
  const tabHref = (tipo?: string) => `/pesquisar?q=${encodeURIComponent(q)}${tipo ? `&tipo=${tipo}` : ""}`
  const count = (n: number) => (n >= PER_COLLECTION ? `${n}+` : String(n))

  return (
    <div className="flex min-h-screen flex-col pt-[4.75rem]">
      <Header />
      <main className="flex-1">
        <PageHero
          badge="Pesquisa"
          title={q ? `Resultados para «${q}»` : "Pesquisar no portal"}
          subtitle={
            q.length >= 2
              ? `${total} resultado${total === 1 ? "" : "s"} no dicionário, neologismos, topónimos, antropónimos e estrangeirismos.`
              : "Escreva pelo menos duas letras na caixa de pesquisa do cabeçalho (atalho: / ou Ctrl K)."
          }
          tone="ice"
        />
        <section className="section-paper py-10">
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            {q.length >= 2 && (
              <nav aria-label="Filtrar por tipo" className="mb-8 flex flex-wrap gap-2">
                <Link
                  href={tabHref()}
                  aria-current={!active ? "page" : undefined}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium ${!active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-primary/10"}`}
                >
                  Tudo ({total})
                </Link>
                {tabs.map((tab) => (
                  <Link
                    key={tab.key}
                    href={tabHref(tab.key)}
                    aria-current={active?.key === tab.key ? "page" : undefined}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium ${active?.key === tab.key ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-primary/10"}`}
                  >
                    {tab.label} ({count(tab.results.length)})
                  </Link>
                ))}
              </nav>
            )}

            {q.length >= 2 && visible.every((tab) => tab.results.length === 0) && (
              <p className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
                Não encontrámos resultados para «{q}». Verifique a ortografia ou tente uma palavra mais curta.
              </p>
            )}

            {visible.map(
              (tab) =>
                tab.results.length > 0 && (
                  <div key={tab.key} className="mb-10">
                    <h2 className="mb-3 flex items-baseline justify-between text-xl font-bold">
                      {tab.label}
                      <Link href={`/${tab.key === "dicionario" ? "dictionary" : tab.key}?q=${encodeURIComponent(q)}`} className="text-sm font-medium text-primary hover:underline">
                        Ver tudo em {tab.label.toLowerCase()}
                      </Link>
                    </h2>
                    <ul className="divide-y rounded-md border bg-background">
                      {tab.results.map((result) => (
                        <li key={result.id}>
                          <Link href={result.href} className="block px-4 py-3 transition-colors hover:bg-primary/5">
                            <span className="font-semibold">{result.label}</span>
                            {result.meta && <span className="ml-2 text-xs text-muted-foreground">{result.meta}</span>}
                            {result.text && <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{result.text}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
