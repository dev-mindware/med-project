"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, Loader2, ArrowRight } from "lucide-react"

const wordData = {
  word: "Saudade",
  pronunciation: "/saw·DA·deh/",
  class: "substantivo feminino",
  definition: "Sentimento melancólico de ausência de alguém ou algo que se ama; nostalgia profunda.",
  examples: [
    "Sinto saudade dos tempos de criança em Luanda.",
    "A saudade da terra natal acompanha muitos emigrantes.",
  ],
  etymology: "Do latim solitas, -atis (solidão)",
  date: "24 de Maio",
}

export function WordOfTheDay() {
  const [speaking, setSpeaking] = useState(false)

  const playAudio = () => {
    if (!("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(wordData.word)
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-border/50 bg-muted/30">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Palavra do Dia
          </span>
          <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border border-border/50">
            {wordData.date}
          </span>
        </div>

        <div className="px-8 py-8">
          {/* Word + pronunciation + audio */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tight leading-none mb-3">
                {wordData.word}
              </h2>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-muted-foreground">{wordData.pronunciation}</span>
                <Button
                  variant={speaking ? "default" : "outline"}
                  size="icon"
                  className="h-7 w-7 rounded-full shrink-0"
                  onClick={playAudio}
                  disabled={speaking}
                  aria-label="Ouvir pronúncia"
                >
                  {speaking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full self-start sm:self-auto">
              {wordData.class}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50 mb-8" />

          {/* Definition + Examples */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Definição</p>
              <p className="text-base leading-relaxed text-foreground">{wordData.definition}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Exemplos</p>
              <ul className="space-y-2.5">
                {wordData.examples.map((ex, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-2 h-1 w-1 rounded-full bg-primary/50 shrink-0" />
                    <span className="italic">{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer row */}
          <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/70">Etimologia:</span>{" "}
              {wordData.etymology}
            </p>
            <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:text-primary rounded-lg shrink-0 -ml-2 sm:ml-0">
              Ver mais detalhes
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
