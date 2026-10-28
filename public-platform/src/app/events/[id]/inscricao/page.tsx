import { redirect } from "next/navigation"

/** A inscrição passou a fazer parte da página do evento. */
export default async function EventRegistrationRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/events/${id}#inscricao`)
}
