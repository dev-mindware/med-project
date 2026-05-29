"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle2 } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card">
      {/* Subtle grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 80% at 50% 100%, oklch(0.85 0.12 264 / 0.1) 0%, transparent 70%)",
        }}
      />

      <div className="relative px-8 py-12 md:py-14 text-center max-w-2xl mx-auto">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-5">
          <Mail className="h-6 w-6 text-primary" />
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight mb-3">Newsletter da CN-IILP</h2>
        <p className="text-muted-foreground leading-relaxed mb-8 max-w-md mx-auto">
          Mantenha-se atualizado com eventos, publicações e novidades sobre a língua portuguesa em Angola.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="h-5 w-5" />
            Subscrição confirmada! Obrigado.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="o.seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-lg flex-1"
            />
            <Button type="submit" className="h-11 rounded-lg px-6 font-semibold shrink-0" disabled={!email}>
              Subscrever
            </Button>
          </form>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          Sem spam. Pode cancelar a qualquer momento.
        </p>
      </div>
    </div>
  )
}
