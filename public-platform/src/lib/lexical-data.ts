import { publicApi, safePublicApi } from "@/lib/public-api"

const EMPTY_META = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
}

const emptyLexicalData = {
  neologisms: { data: [], meta: EMPTY_META },
  foreignisms: { data: [], meta: EMPTY_META },
  toponyms: { data: [], meta: EMPTY_META },
  anthroponyms: { data: [], meta: EMPTY_META },
  vonalp: { data: [], meta: EMPTY_META },
  vonalpEp: { data: [], meta: EMPTY_META },
  volna: { data: [], meta: EMPTY_META },
}

export async function getLexicalData() {
  const [neologisms, foreignisms, toponyms, anthroponyms, vonalp, vonalpEp, volna] = await Promise.all([
    safePublicApi(() => publicApi.neologisms({ limit: 20 }), emptyLexicalData.neologisms),
    safePublicApi(() => publicApi.foreignisms({ limit: 20 }), emptyLexicalData.foreignisms),
    safePublicApi(() => publicApi.toponyms({ limit: 20 }), emptyLexicalData.toponyms),
    safePublicApi(() => publicApi.anthroponyms({ limit: 20 }), emptyLexicalData.anthroponyms),
    safePublicApi(() => publicApi.vonalp({ limit: 20 }), emptyLexicalData.vonalp),
    safePublicApi(() => publicApi.vonalpEp({ limit: 20 }), emptyLexicalData.vonalpEp),
    safePublicApi(() => publicApi.volna({ limit: 20 }), emptyLexicalData.volna),
  ])

  return { neologisms, foreignisms, toponyms, anthroponyms, vonalp, vonalpEp, volna }
}
