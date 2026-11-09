import type { PublicEvent } from "@/lib/public-api"
import { SITE_URL } from "@/lib/entry-slug"

const escapeText = (value: string) => value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n")
const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")

/** Linhas com mais de 75 caracteres continuam na seguinte, iniciada por um espaço (RFC 5545). */
function fold(line: string) {
  const parts: string[] = []
  for (let i = 0; i < line.length; i += 74) parts.push((i ? " " : "") + line.slice(i, i + 74))
  return parts.join("\r\n")
}

export function eventToIcs(event: PublicEvent) {
  const start = new Date(event.startDate)
  const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 60 * 60 * 1000)
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CNLP Angola//Eventos//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@cn-iilp.ao`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    ...(event.description ? [`DESCRIPTION:${escapeText(event.description)}`] : []),
    ...(event.location ? [`LOCATION:${escapeText(event.location)}`] : []),
    `URL:${SITE_URL}/events/${event.slug || event.id}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
  return lines.map(fold).join("\r\n") + "\r\n"
}
