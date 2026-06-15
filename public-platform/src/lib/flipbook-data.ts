import { publicApi, safePublicApi, type PublicPaginated } from "@/lib/public-api"

const FLIPBOOK_LIMIT = 2

const emptyFlipbookData: PublicPaginated<any> = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: FLIPBOOK_LIMIT,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
}

export function getDictionaryFlipbookData() {
  return safePublicApi(() => publicApi.dictionary({ limit: FLIPBOOK_LIMIT }), emptyFlipbookData)
}

export function getNeologismsFlipbookData() {
  return safePublicApi(() => publicApi.neologisms({ limit: FLIPBOOK_LIMIT }), emptyFlipbookData)
}

export function getForeignismsFlipbookData() {
  return safePublicApi(() => publicApi.foreignisms({ limit: FLIPBOOK_LIMIT }), emptyFlipbookData)
}

export function getToponymsFlipbookData() {
  return safePublicApi(() => publicApi.toponyms({ limit: FLIPBOOK_LIMIT }), emptyFlipbookData)
}

export function getAnthroponymsFlipbookData() {
  return safePublicApi(() => publicApi.anthroponyms({ limit: FLIPBOOK_LIMIT }), emptyFlipbookData)
}

export function getVonalpFlipbookData() {
  return safePublicApi(() => publicApi.vonalp({ limit: FLIPBOOK_LIMIT }), emptyFlipbookData)
}

export function getVonalpEpFlipbookData() {
  return safePublicApi(() => publicApi.vonalpEp({ limit: FLIPBOOK_LIMIT }), emptyFlipbookData)
}

export function getVolnaFlipbookData() {
  return safePublicApi(() => publicApi.volna({ limit: FLIPBOOK_LIMIT }), emptyFlipbookData)
}
