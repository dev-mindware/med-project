"use client"

import { useEffect, useState } from "react"
import { Check, Heart, Link2, Quote, Share2, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"

const SAVED_KEY = "cnlp:palavras-guardadas"
const CONTACT_EMAIL = "geral@cn-iilp.ao"

function readSaved(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]")
  } catch {
    return []
  }
}

export function EntryActions({ id, word, citation }: { id: string; word: string; citation: string }) {
  const [saved, setSaved] = useState(false)
  const [pageUrl, setPageUrl] = useState("")
  const [done, setDone] = useState<"link" | "cite" | null>(null)

  useEffect(() => {
    setSaved(readSaved().includes(id))
    setPageUrl(window.location.href)
  }, [id])

  const flash = (what: "link" | "cite") => {
    setDone(what)
    setTimeout(() => setDone(null), 2000)
  }

  const copy = async (text: string, what: "link" | "cite") => {
    try {
      await navigator.clipboard.writeText(text)
      flash(what)
    } catch {
      window.prompt("Copie o texto:", text)
    }
  }

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: word, url })
      } catch {
        /* partilha cancelada */
      }
    } else {
      await copy(url, "link")
    }
  }

  const toggleSaved = () => {
    const list = readSaved()
    const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next))
    } catch {
      /* armazenamento indisponível */
    }
    setSaved(next.includes(id))
  }

  const correction = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Sugestão de correcção: ${word}`)}&body=${encodeURIComponent(
    `Verbete: ${word}\nEndereço: ${pageUrl}\n\nSugestão:\n`,
  )}`

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={share}>
        <Share2 className="h-4 w-4" /> Partilhar
      </Button>
      <Button variant="outline" size="sm" onClick={() => copy(window.location.href, "link")}>
        {done === "link" ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {done === "link" ? "Ligação copiada" : "Copiar ligação"}
      </Button>
      <Button variant="outline" size="sm" onClick={() => copy(citation, "cite")}>
        {done === "cite" ? <Check className="h-4 w-4" /> : <Quote className="h-4 w-4" />}
        {done === "cite" ? "Citação copiada" : "Citar"}
      </Button>
      <Button variant="outline" size="sm" onClick={toggleSaved} aria-pressed={saved}>
        <Heart className={`h-4 w-4 ${saved ? "fill-current text-primary" : ""}`} />
        {saved ? "Guardada" : "Guardar"}
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <a href={correction}>
          <Flag className="h-4 w-4" /> Sugerir correcção
        </a>
      </Button>
    </div>
  )
}
