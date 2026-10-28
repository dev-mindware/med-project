import { eventToIcs } from "@/lib/ics"
import { publicApi, safePublicApi } from "@/lib/public-api"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await safePublicApi(() => publicApi.eventDetails(id), null)
  if (!event) return new Response("Evento não encontrado", { status: 404 })

  return new Response(eventToIcs(event), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${(event.slug || event.id).replace(/[^a-z0-9-]/gi, "")}.ics"`,
    },
  })
}
