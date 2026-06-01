"use client"

import { PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { PublicEvent } from "@/lib/public-api"
import { EventRegistrationForm } from "@/components/event-registration-form"

export function EventRegistrationDialog({
  event,
  className,
  size = "default",
}: {
  event: PublicEvent
  className?: string
  size?: "default" | "lg"
}) {
  const registrationFull = Boolean(event.maxRegistrations && (event.registrationCount ?? 0) >= event.maxRegistrations)

  if (registrationFull) {
    return (
      <Button disabled size={size} className={className}>
        Inscrições esgotadas
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={size} className={className}>
          <PenLine className="mr-2 h-4 w-4" />
          Inscrever-se
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ficha de inscrição</DialogTitle>
          <DialogDescription>
            Preencha os campos obrigatórios para se inscrever neste evento.
          </DialogDescription>
        </DialogHeader>
        <EventRegistrationForm event={event} compact />
      </DialogContent>
    </Dialog>
  )
}
