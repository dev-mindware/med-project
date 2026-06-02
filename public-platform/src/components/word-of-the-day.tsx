"use client"

import { useState } from "react"
import { ArrowRight, Loader2, Volume2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { PublicEntry } from "@/lib/public-api"
import { getGrammaticalCategoryLabel } from "@/lib/grammatical-labels"

export function WordOfTheDay({ word }: { word?: PublicEntry }) {
  const [speaking, setSpeaking] = useState(false)

  const todayStr = new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
  }).format(new Date())

  const playAudio = () => {
    if (!word || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word.entry)
    utterance.lang = "pt-PT"
    utterance.rate = 0.82
    utterance.pitch = 1.05

    const speak = () => {
      const voices = window.speechSynthesis.getVoices()
      const voice =
        voices.find((v) => v.lang.startsWith("pt-PT")) ||
        voices.find((v) => v.lang.startsWith("pt-BR")) ||
        voices.find((v) => v.lang.startsWith("pt"))
      if (voice) utterance.voice = voice
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }

    if (window.speechSynthesis.getVoices().length > 0) speak()
    else window.speechSynthesis.onvoiceschanged = speak
  }

  if (!word) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-dashed border-primary/25 bg-white/72 p-8 text-center shadow-sm backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Palavra do Dia</p>
          <h3 className="mt-3 text-2xl font-extrabold">Sem entrada publicada para destacar</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Assim que houver entradas aprovadas, esta área passa a escolher uma palavra real do acervo.
          </p>
        </div>
      </div>
    )
  }

  const displayWordClass = getGrammaticalCategoryLabel(word.grammaticalCategory) || "Classe não informada"

  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-lg border border-blue-100/80 bg-white/88 shadow-lg shadow-blue-950/8 backdrop-blur">
        <div className="flex items-center justify-between border-b border-blue-100/70 bg-primary/5 px-8 py-4">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Palavra do Dia
          </span>
          <span className="rounded-md border border-blue-100 bg-white px-3 py-1 text-xs text-muted-foreground">
            {todayStr}
          </span>
        </div>

        <div className="px-8 py-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="mb-3 text-5xl font-extrabold leading-none tracking-tight text-primary md:text-6xl">
                {word.entry}
              </h2>
              <div className="flex items-center gap-3">
                {word.pronunciation && (
                  <span className="font-mono text-sm text-muted-foreground">{word.pronunciation}</span>
                )}
                <Button
                  variant={speaking ? "default" : "outline"}
                  size="icon"
                  className="h-7 w-7 shrink-0 rounded-md"
                  onClick={playAudio}
                  disabled={speaking}
                  aria-label="Ouvir pronúncia"
                >
                  {speaking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <span className="self-start rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:self-auto">
              {displayWordClass}
            </span>
          </div>

          <div className="mb-8 h-px bg-blue-100/80" />

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Definição</p>
              <p className="text-base leading-relaxed text-foreground">{word.firstDefinition || "Definição não disponível."}</p>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Exemplo</p>
              {word.usageExample ? (
                <p className="text-sm italic leading-relaxed text-muted-foreground">"{word.usageExample}"</p>
              ) : (
                <p className="text-sm italic text-muted-foreground">Nenhum exemplo em contexto disponível.</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-blue-100/80 pt-6 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
              {word.etymology ? (
                <>
                  <span className="font-semibold text-foreground/70">Etimologia:</span>{" "}
                  {word.etymology}
                </>
              ) : (
                <span className="italic">Etimologia não disponível.</span>
              )}
            </p>
            <Button variant="ghost" size="sm" className="gap-1.5 rounded-md text-primary hover:text-primary shrink-0 -ml-2 sm:ml-0" asChild>
              <Link href="/dictionary">
                Ver no dicionário
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
