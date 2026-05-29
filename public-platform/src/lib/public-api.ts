export type PublicMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type PublicPaginated<T> = {
  data: T[]
  meta: PublicMeta
}

export type PublicEntry = {
  id: string
  entry: string
  pronunciation?: string | null
  etymology?: string | null
  firstDefinition?: string | null
  secondDefinition?: string | null
  thirdDefinition?: string | null
  usageExample?: string | null
  grammaticalCategory?: string | null
  grammaticalSubcategory?: string | null
  languageCode?: string | null
  audioUrl?: string | null
  imageUrl?: string | null
}

export type PublicVonalpTerm = {
  id: string
  term: string
  pronunciation?: string | null
  grammaticalCategory?: string | null
  grammaticalSubcategory?: string | null
  syllabicDivision?: string | null
  etymology?: string | null
  firstDefinition?: string | null
  secondDefinition?: string | null
  thirdDefinition?: string | null
  origin?: string | null
}

export type PublicBlogPost = {
  id: string
  title: string
  slug?: string | null
  excerpt?: string | null
  content?: string | null
  coverImageUrl?: string | null
  videoUrl?: string | null
  galleryImageUrls?: string[]
  type?: string | null
  category?: string | null
  tags?: string[]
  isFeatured?: boolean
  publishedAt?: string | null
  createdAt?: string
  author?: {
    id: string
    name: string
    profilePhotoUrl?: string | null
  } | null
}

export type PublicEvent = {
  id: string
  title: string
  slug?: string | null
  description?: string | null
  category?: string | null
  coverImageUrl?: string | null
  startDate: string
  endDate?: string | null
  location?: string | null
  registrationCount?: number
  maxRegistrations?: number | null
  publishedAt?: string | null
}

export type PublicEventRegistrationPayload = {
  name: string
  email: string
  phone?: string
  organization?: string
  notes?: string
}

type PublicFilters = {
  q?: string
  search?: string
  category?: string
  languageCode?: string
  province?: string
  municipality?: string
  period?: "upcoming" | "ongoing" | "past"
  page?: number
  limit?: number
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "")

function buildUrl(path: string, filters?: PublicFilters) {
  const url = new URL(`${API_BASE_URL}${path}`)

  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

async function request<T>(path: string, init?: RequestInit & { filters?: PublicFilters }): Promise<T> {
  const { filters, ...requestInit } = init ?? {}
  const response = await fetch(buildUrl(path, filters), {
    ...requestInit,
    headers: {
      "Content-Type": "application/json",
      ...requestInit.headers,
    },
    next: requestInit.method ? undefined : { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error(`Public API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export const publicApi = {
  dictionary: (filters?: PublicFilters) =>
    request<PublicPaginated<PublicEntry>>("/public/dictionary", { filters }),
  vonalp: (filters?: PublicFilters) =>
    request<PublicPaginated<PublicVonalpTerm>>("/public/vocabularies/vonalp", { filters }),
  events: (filters?: PublicFilters) =>
    request<PublicPaginated<PublicEvent>>("/public/events", { filters }),
  eventDetails: (idOrSlug: string) =>
    request<PublicEvent>(`/public/events/${encodeURIComponent(idOrSlug)}`),
  registerForEvent: (idOrSlug: string, payload: PublicEventRegistrationPayload) =>
    request(`/public/events/${encodeURIComponent(idOrSlug)}/registrations`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  blogPosts: (filters?: PublicFilters) =>
    request<PublicPaginated<PublicBlogPost>>("/public/blog-posts", { filters }),
  blogPostDetails: (idOrSlug: string) =>
    request<PublicBlogPost>(`/public/blog-posts/${encodeURIComponent(idOrSlug)}`),
}

export async function safePublicApi<T>(callback: () => Promise<T>, fallback: T) {
  try {
    return await callback()
  } catch {
    return fallback
  }
}
