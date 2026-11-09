const TIME_ZONE = "Africa/Luanda"

export const formatDate = (value: string | Date, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) =>
  new Date(value).toLocaleDateString("pt-PT", { timeZone: TIME_ZONE, ...options })

export const formatTime = (value: string | Date) =>
  new Date(value).toLocaleTimeString("pt-PT", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" })
