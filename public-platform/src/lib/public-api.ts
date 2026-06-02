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
  syllabicDivision?: string | null
  etymology?: string | null
  firstDefinition?: string | null
  secondDefinition?: string | null
  thirdDefinition?: string | null
  usageExample?: string | null
  abbreviation?: string | null
  acronym?: string | null
  acronymMeaning?: string | null
  reduction?: string | null
  reductionMeaning?: string | null
  shortForm?: string | null
  fullForm?: string | null
  grammaticalCategory?: string | null
  grammaticalSubcategory?: string | null
  grammaticalStatus?: string | null
  languageCode?: string | null
  audioUrl?: string | null
  imageUrl?: string | null
  videoUrl?: string | null
  isVocabulary?: boolean
  isVocabularyEP?: boolean
  isForeignism?: boolean
  approvedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type PublicNeologism = PublicEntry

export type PublicForeignism = {
  id: string
  term: string
  pronunciation?: string | null
  originalLanguage?: string | null
  originCountry?: string | null
  adaptedForm?: string | null
  originalForm?: string | null
  meaning?: string | null
  definition?: string | null
  usageExample?: string | null
  context?: string | null
  field?: string | null
  abbreviation?: string | null
  acronym?: string | null
  reduction?: string | null
  shortForm?: string | null
  fullForm?: string | null
  grammaticalCategory?: string | null
  isVocabulary?: boolean
  isVocabularyEP?: boolean
  approvedAt?: string | null
  createdAt?: string
  updatedAt?: string
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

export type PublicToponym = {
  id: string
  toponym: string
  pronunciation?: string | null
  meaning?: string | null
  province?: string | null
  municipality?: string | null
  location?: string | null
  gentilic?: string | null
  locationImage?: string | null
  toponymHistory?: string | null
  toponymProvenance?: string | null
  commonUsage?: string | null
  graphicVariation?: string | null
  toponymClasses?: string | null
  toponymSubclasses?: string | null
  languageCode?: string | null
}

export type PublicAnthroponym = {
  id: string
  name: string
  gender?: string | null
  etymology?: string | null
  meaning?: string | null
  surname?: string | null
  surnameMeaning?: string | null
  historicalFigure?: string | null
  historicalFigurePseudonym?: string | null
  historicalFigureDomain?: string | null
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
  updatedAt?: string
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
  createdAt?: string
  updatedAt?: string
}

export type PublicEventRegistrationPayload = {
  name: string
  email: string
  phone?: string
  organization?: string
  notes?: string
}

export type PublicStats = {
  dictionaryEntries: number
  toponyms: number
  anthroponyms: number
  publishedArticles: number
  publishedEvents: number
  upcomingEvents: number
  vonalpTerms: number
  vonalpEpTerms: number
  lexicalTotal: number
  updatedAt: string
}

export type PublicFilters = {
  q?: string
  search?: string
  category?: string
  grammaticalCategory?: string
  grammaticalSubcategory?: string
  languageCode?: string
  province?: string
  municipality?: string
  gender?: string
  originalLanguage?: string
  originCountry?: string
  field?: string
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
    throw new Error(`Public content request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export const publicApi = {
  stats: () => request<PublicStats>("/public/stats"),
  dictionary: (filters?: PublicFilters) =>
    request<PublicPaginated<PublicEntry>>("/public/dictionary", { filters }),
  dictionaryDetails: (id: string) =>
    request<PublicEntry>(`/public/dictionary/${encodeURIComponent(id)}`),
  neologisms: (filters?: PublicFilters) =>
    request<PublicPaginated<PublicNeologism>>("/public/neologisms", { filters }),
  foreignisms: (filters?: PublicFilters) =>
    request<PublicPaginated<PublicForeignism>>("/public/foreignisms", { filters }),
  vonalp: (filters?: PublicFilters) =>
    request<PublicPaginated<PublicVonalpTerm>>("/public/vocabularies/vonalp", { filters }),
  vonalpEp: (filters?: PublicFilters) =>
    request<PublicPaginated<PublicVonalpTerm>>("/public/vocabularies/vonalpep", { filters }),
  toponyms: (filters?: PublicFilters) =>
    request<PublicPaginated<PublicToponym>>("/public/toponyms", { filters }),
  anthroponyms: (filters?: PublicFilters) =>
    request<PublicPaginated<PublicAnthroponym>>("/public/anthroponyms", { filters }),
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
