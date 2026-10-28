import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { formatDate, formatTime } from "@/lib/format-date"
import { publicApi, safePublicApi } from "@/lib/public-api"

const WINDOW_DAYS = 30

/** Faixa de avisos: o próximo evento publicado, se começar nos próximos 30 dias. */
export async function NoticeStrip() {
  const result = await safePublicApi(() => publicApi.events({ period: "upcoming", limit: 1 }), null)
  const event = result?.data[0]
  if (!event) return null

  const days = (new Date(event.startDate).getTime() - Date.now()) / 86_400_000
  if (days > WINDOW_DAYS) return null

  const full = Boolean(event.maxRegistrations && (event.registrationCount ?? 0) >= event.maxRegistrations)
  return (
    <aside aria-label="Aviso" className="border-b border-primary/20 bg-primary/10 print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-6 py-2.5 text-sm sm:px-8 lg:px-12">
        <span className="flex items-center gap-2 font-semibold text-primary">
          <CalendarDays className="h-4 w-4" /> Próximo evento
        </span>
        <span className="min-w-0 flex-1">
          <strong>{event.title}</strong> · {formatDate(event.startDate, { day: "numeric", month: "long" })}, {formatTime(event.startDate)}
          {event.location ? ` · ${event.location}` : ""}
        </span>
        <Link href={`/events/${event.slug || event.id}`} className="font-semibold text-primary hover:underline">
          {full ? "Ver detalhes (inscrições esgotadas)" : "Ver detalhes e inscrever-se"}
        </Link>
      </div>
    </aside>
  )
}
