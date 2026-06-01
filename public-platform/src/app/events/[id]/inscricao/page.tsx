"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { EventRegistrationForm } from "@/components/event-registration-form"
import { Button } from "@/components/ui/button"
import { publicApi, type PublicEvent } from "@/lib/public-api"

export default function EventRegistrationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [event, setEvent] = useState<PublicEvent | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    publicApi
      .eventDetails(id)
      .then((data) => {
        if (mounted) setEvent(data)
      })
      .catch(() => {
        if (mounted) setError("Evento não encontrado ou indisponível para inscrição.")
      })

    return () => {
      mounted = false
    }
  }, [id])

  return (
    <div className="min-h-screen bg-background">
      <main className="section-paper min-h-screen px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <Button variant="ghost" className="rounded-md text-primary hover:text-primary" asChild>
              <Link href="/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar aos eventos
              </Link>
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-blue-100/80 bg-white/88 shadow-lg shadow-blue-950/8 backdrop-blur">
            <div className="border-b border-blue-100/80 bg-primary/5 px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Inscrição em evento</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Ficha de inscrição</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Esta página continua disponível como fallback. O fluxo principal de inscrição também pode ser aberto em modal na agenda.
              </p>
            </div>

            <div className="p-6">
              {event && <EventRegistrationForm event={event} />}
              {!event && !error && <p className="text-sm text-muted-foreground">A carregar evento...</p>}
              {error && <p className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
