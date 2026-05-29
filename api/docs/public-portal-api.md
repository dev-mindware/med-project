# Documentação do Portal Público

Esta documentação orienta a implementação do portal público com base no módulo `PublicModule` da API. Todas as rotas abaixo são públicas, não exigem autenticação e devolvem apenas dados que podem ser mostrados ao público.

Base URL local sugerida:

```txt
http://localhost:4000/public
```

Base path:

```txt
/public
```

## Regras Gerais

- Conteúdos linguísticos aparecem apenas quando `approvalStatus = APPROVED`.
- Eventos aparecem apenas quando `status = PUBLISHED`.
- Publicações de blog aparecem apenas quando `status = PUBLISHED`.
- Vocabulários VONALP e VONALP EP aparecem apenas quando o termo dedicado está completo e a origem está aprovada.
- O portal público não deve consumir endpoints administrativos.
- IDs internos de auditoria, autores internos, notas de correcção, motivos de rejeição e estados editoriais internos não são expostos.
- Listagens usam paginação padrão `page=1` e `limit=20`.
- `limit` máximo: `100`.
- Pesquisa textual aceita `q` ou `search`.

## Tipos Base

```ts
export type ISODateString = string;

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type PublicEventPeriod = "upcoming" | "ongoing" | "past";

export type PublicContentFilters = {
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
  category?: string;
  languageCode?: string;
  province?: string;
  municipality?: string;
  period?: PublicEventPeriod;
};
```

## Pesquisa Global

### `GET /public/search`

Pesquisa em entradas, neologismos, topónimos, antropónimos e estrangeirismos aprovados.

Params:

| Param | Tipo | Obrigatório | Uso |
|---|---|---:|---|
| `q` | `string` | Não | Texto de pesquisa. |
| `search` | `string` | Não | Alias de `q`. |

Exemplo:

```http
GET /public/search?q=casa
```

Tipo de resposta:

```ts
export type PublicSearchResponse = {
  query: string;
  entries: PublicEntry[];
  neologisms: PublicNeologism[];
  toponyms: PublicToponym[];
  anthroponyms: PublicAnthroponym[];
  foreignisms: PublicForeignism[];
};
```

Contexto no portal: barra de pesquisa global, autocomplete, página inicial e resultados rápidos.

## Entradas do Dicionário

### Tipo

```ts
export type PublicEntry = {
  id: string;
  entry: string;
  pronunciation?: string | null;
  syllabicDivision?: string | null;
  etymology?: string | null;
  firstDefinition: string;
  secondDefinition?: string | null;
  thirdDefinition?: string | null;
  usageExample?: string | null;
  abbreviation?: string | null;
  acronym?: string | null;
  acronymMeaning?: string | null;
  reduction?: string | null;
  reductionMeaning?: string | null;
  shortForm?: string | null;
  fullForm?: string | null;
  grammaticalCategory?: string | null;
  grammaticalSubcategory?: string | null;
  grammaticalStatus?: string | null;
  languageCode?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isVocabulary: boolean;
  isVocabularyEP: boolean;
  isForeignism: boolean;
  approvedAt?: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
```

### `GET /public/dictionary`

Lista entradas aprovadas.

Params:

| Param | Tipo | Obrigatório | Uso |
|---|---|---:|---|
| `page` | `number` | Não | Página actual. |
| `limit` | `number` | Não | Itens por página, máximo `100`. |
| `q` / `search` | `string` | Não | Pesquisa em termo, definições, etimologia e exemplo de uso. |
| `category` | `string` | Não | Filtra por `grammaticalCategory`. |
| `languageCode` | `string` | Não | Filtra pelo código da língua, por exemplo `pt-AO`, `kmb`, `umb`. |

Resposta:

```ts
PaginatedResponse<PublicEntry>
```

### `GET /public/dictionary/:id`

Detalha uma entrada aprovada.

Path params:

| Param | Tipo | Obrigatório | Uso |
|---|---|---:|---|
| `id` | `string` | Sim | ID da entrada. |

Resposta:

```ts
PublicEntry
```

Contexto no portal: página de verbete, dicionário pesquisável e cartões de termo.

## Neologismos

Neologismos seguem a mesma estrutura pública das entradas.

```ts
export type PublicNeologism = PublicEntry;
```

### `GET /public/neologisms`

Lista neologismos aprovados.

Params:

| Param | Tipo | Obrigatório | Uso |
|---|---|---:|---|
| `page` | `number` | Não | Página actual. |
| `limit` | `number` | Não | Itens por página, máximo `100`. |
| `q` / `search` | `string` | Não | Pesquisa em termo, definições, etimologia e exemplo de uso. |
| `category` | `string` | Não | Filtra por `grammaticalCategory`. |
| `languageCode` | `string` | Não | Filtra pelo código da língua. |

Resposta:

```ts
PaginatedResponse<PublicNeologism>
```

### `GET /public/neologisms/:id`

Detalha um neologismo aprovado.

Resposta:

```ts
PublicNeologism
```

Contexto no portal: secção de termos recentes, novas unidades lexicais e actualizações do acervo.

## Topónimos

### Tipo

```ts
export type PublicToponym = {
  id: string;
  toponym: string;
  pronunciation?: string | null;
  meaning?: string | null;
  province: string;
  municipality?: string | null;
  location?: string | null;
  gentilic?: string | null;
  locationImage?: string | null;
  toponymHistory?: string | null;
  toponymProvenance?: string | null;
  commonUsage?: string | null;
  graphicVariation?: string | null;
  toponymClasses: string[];
  toponymSubclasses: string[];
  status?: string | null;
  languageCode?: string | null;
  isVocabulary: boolean;
  isVocabularyEP: boolean;
  isForeignism: boolean;
  approvedAt?: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
```

### `GET /public/toponyms`

Lista topónimos aprovados.

Params:

| Param | Tipo | Obrigatório | Uso |
|---|---|---:|---|
| `page` | `number` | Não | Página actual. |
| `limit` | `number` | Não | Itens por página, máximo `100`. |
| `q` / `search` | `string` | Não | Pesquisa em topónimo, significado, província, município, gentílico e história. |
| `province` | `string` | Não | Filtra por província. |
| `municipality` | `string` | Não | Filtra por município. |
| `languageCode` | `string` | Não | Filtra pelo código da língua. |

Resposta:

```ts
PaginatedResponse<PublicToponym>
```

### `GET /public/toponyms/:id`

Detalha um topónimo aprovado.

Resposta:

```ts
PublicToponym
```

Contexto no portal: mapa, directório geográfico, página de província/município e detalhe de localidade.

## Antropónimos

### Tipo

```ts
export type PublicAnthroponym = {
  id: string;
  name: string;
  gender?: string | null;
  etymology?: string | null;
  meaning?: string | null;
  surname?: string | null;
  surnameMeaning?: string | null;
  historicalFigure?: string | null;
  historicalFigurePseudonym?: string | null;
  historicalFigureDomain?: string | null;
  isVocabulary: boolean;
  isVocabularyEP: boolean;
  isForeignism: boolean;
  approvedAt?: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
```

### `GET /public/anthroponyms`

Lista antropónimos aprovados.

Params:

| Param | Tipo | Obrigatório | Uso |
|---|---|---:|---|
| `page` | `number` | Não | Página actual. |
| `limit` | `number` | Não | Itens por página, máximo `100`. |
| `q` / `search` | `string` | Não | Pesquisa em nome, apelido, significado, etimologia e figura histórica. |

Resposta:

```ts
PaginatedResponse<PublicAnthroponym>
```

### `GET /public/anthroponyms/:id`

Detalha um antropónimo aprovado.

Resposta:

```ts
PublicAnthroponym
```

Contexto no portal: catálogo de nomes próprios, apelidos, origem e figuras históricas.

## Estrangeirismos

### Tipo

```ts
export type PublicForeignism = {
  id: string;
  term: string;
  pronunciation?: string | null;
  originalLanguage?: string | null;
  originCountry?: string | null;
  adaptedForm?: string | null;
  originalForm?: string | null;
  meaning?: string | null;
  definition?: string | null;
  usageExample?: string | null;
  context?: string | null;
  field?: string | null;
  abbreviation?: string | null;
  acronym?: string | null;
  reduction?: string | null;
  shortForm?: string | null;
  fullForm?: string | null;
  grammaticalCategory?: string | null;
  isVocabulary: boolean;
  isVocabularyEP: boolean;
  approvedAt?: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
```

### `GET /public/foreignisms`

Lista estrangeirismos aprovados.

Params:

| Param | Tipo | Obrigatório | Uso |
|---|---|---:|---|
| `page` | `number` | Não | Página actual. |
| `limit` | `number` | Não | Itens por página, máximo `100`. |
| `q` / `search` | `string` | Não | Pesquisa em termo, significado, definição, idioma, país e área. |
| `category` | `string` | Não | Filtra por `field`, isto é, área de conhecimento. |

Resposta:

```ts
PaginatedResponse<PublicForeignism>
```

### `GET /public/foreignisms/:id`

Detalha um estrangeirismo aprovado.

Resposta:

```ts
PublicForeignism
```

Contexto no portal: glossário de estrangeirismos, termos técnicos e origem de palavras.

## Vocabulários VONALP e VONALP EP

### Tipo

```ts
export type VonalpVocabularyType = "VONALP" | "VONALP_EP";
export type VonalpSourceType = "ENTRY" | "TOPONYM" | "ANTHROPONYM" | "FOREIGNISM";

export type PublicVonalpTerm = {
  id: string;
  vocabularyType: VonalpVocabularyType;
  sourceType: VonalpSourceType;
  sourceId: string;
  term: string;
  pronunciation: string;
  grammaticalCategory: string;
  grammaticalSubcategory: string;
  syllabicDivision: string;
  etymology: string;
  firstDefinition: string;
  secondDefinition?: string | null;
  origin: string;
};
```

### `GET /public/vocabularies/vonalp`

Lista termos VONALP completos e públicos.

### `GET /public/vocabularies/vonalpep`

Lista termos VONALP EP completos e públicos.

Params:

| Param | Tipo | Obrigatório | Uso |
|---|---|---:|---|
| `page` | `number` | Não | Página actual. |
| `limit` | `number` | Não | Itens por página, máximo `100`. |
| `q` / `search` | `string` | Não | Pesquisa nos campos do termo VONALP. |

Resposta:

```ts
PaginatedResponse<PublicVonalpTerm>
```

Contexto no portal: páginas normativas VONALP/VONALP EP, listagens oficiais, pesquisa por origem e detalhe de termo.

## Eventos

### Tipo

```ts
export type PublicEvent = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  coverImageUrl?: string | null;
  startDate: ISODateString;
  endDate: ISODateString;
  location: string;
  registrationCount: number;
  maxRegistrations?: number | null;
  publishedAt?: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type PublicEventRegistrationPayload = {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  notes?: string;
};

export type PublicEventRegistrationResponse = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  status: "PENDING";
  createdAt: ISODateString;
  message: string;
};
```

### `GET /public/events`

Lista eventos publicados.

Params:

| Param | Tipo | Obrigatório | Uso |
|---|---|---:|---|
| `page` | `number` | Não | Página actual. |
| `limit` | `number` | Não | Itens por página, máximo `100`. |
| `q` / `search` | `string` | Não | Pesquisa em título, descrição e localização. |
| `category` | `string` | Não | Filtra por categoria. |
| `period` | `upcoming \| ongoing \| past` | Não | Filtra eventos futuros, em curso ou passados. |

Resposta:

```ts
PaginatedResponse<PublicEvent>
```

### `GET /public/events/:idOrSlug`

Detalha evento publicado por ID ou slug.

Path params:

| Param | Tipo | Obrigatório | Uso |
|---|---|---:|---|
| `idOrSlug` | `string` | Sim | ID ou slug público do evento. |

Resposta:

```ts
PublicEvent
```

### `POST /public/events/:idOrSlug/registrations`

Cria inscrição pública num evento publicado.

Body:

```ts
PublicEventRegistrationPayload
```

Exemplo:

```json
{
  "name": "Maria Manuel",
  "email": "maria@example.com",
  "phone": "+244 923 000 000",
  "organization": "Universidade Agostinho Neto",
  "notes": "Pretendo receber certificado."
}
```

Validações:

- `name` é obrigatório.
- `email` é obrigatório e deve ser válido.
- O evento deve estar publicado.
- Não permite inscrição duplicada no mesmo evento com o mesmo email.
- Se `maxRegistrations` estiver preenchido e o limite já tiver sido atingido, a inscrição é bloqueada.

Resposta:

```ts
PublicEventRegistrationResponse
```

Contexto no portal: agenda, página de evento, calendário público e formulário de inscrição.

## Blog

### Tipo

```ts
export type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  coverImageUrl?: string | null;
  videoUrl?: string | null;
  galleryImageUrls: string[];
  type: "ARTICLE" | "VIDEO" | "IMAGE" | "EVENT_COVERAGE" | "ANNOUNCEMENT";
  category?: string | null;
  tags: string[];
  isFeatured: boolean;
  publishedAt?: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  author: {
    id: string;
    name: string;
    profilePhotoUrl?: string | null;
  };
};
```

### `GET /public/blog-posts`

Lista publicações publicadas.

Params:

| Param | Tipo | Obrigatório | Uso |
|---|---|---:|---|
| `page` | `number` | Não | Página actual. |
| `limit` | `number` | Não | Itens por página, máximo `100`. |
| `q` / `search` | `string` | Não | Pesquisa em título, resumo, conteúdo e tags. |
| `category` | `string` | Não | Filtra por categoria. |

Resposta:

```ts
PaginatedResponse<PublicBlogPost>
```

### `GET /public/blog-posts/:idOrSlug`

Detalha publicação publicada por ID ou slug.

Resposta:

```ts
PublicBlogPost
```

Contexto no portal: notícias, artigos, vídeos, anúncios e cobertura de eventos.

## Tratamento de Erros

```ts
export type PublicApiError = {
  statusCode: number;
  message: string | string[];
  error?: string;
};
```

Erros comuns:

| Código | Quando acontece | Tratamento recomendado no portal |
|---:|---|---|
| `400` | Query inválida, body inválido, inscrição duplicada ou evento lotado. | Mostrar mensagem clara ao visitante. |
| `404` | Conteúdo inexistente, não aprovado ou não publicado. | Mostrar página de indisponibilidade/404 pública. |
| `500` | Erro inesperado da API. | Mostrar estado de erro e permitir tentar novamente. |

## Recomendações de Implementação do Portal

- Usar `/public/search` apenas para pesquisa global rápida.
- Usar endpoints específicos para listagens paginadas.
- Usar `slug` para URLs públicas de eventos e blog.
- Usar `id` para detalhe de conteúdos linguísticos.
- Tratar `404` como conteúdo indisponível ao público, mesmo que exista internamente.
- Não mostrar campos técnicos ao visitante.
- Guardar filtros na query string do portal para permitir partilha de links.
- Fazer debounce em pesquisas textuais.
- Definir estados de UI para `loading`, `empty`, `error` e `success`.

## Exemplos de Rotas no Portal

```txt
/dicionario
/dicionario/:id
/neologismos
/neologismos/:id
/toponimos
/toponimos/:id
/antroponimos
/antroponimos/:id
/estrangeirismos
/estrangeirismos/:id
/vonalp
/vonalp-ep
/eventos
/eventos/:slug
/blog
/blog/:slug
```

## Mapa de Consumo

| Página do portal | Endpoint principal |
|---|---|
| Pesquisa global | `GET /public/search` |
| Dicionário | `GET /public/dictionary` |
| Detalhe de entrada | `GET /public/dictionary/:id` |
| Neologismos | `GET /public/neologisms` |
| Detalhe de neologismo | `GET /public/neologisms/:id` |
| Topónimos | `GET /public/toponyms` |
| Detalhe de topónimo | `GET /public/toponyms/:id` |
| Antropónimos | `GET /public/anthroponyms` |
| Detalhe de antropónimo | `GET /public/anthroponyms/:id` |
| Estrangeirismos | `GET /public/foreignisms` |
| Detalhe de estrangeirismo | `GET /public/foreignisms/:id` |
| VONALP | `GET /public/vocabularies/vonalp` |
| VONALP EP | `GET /public/vocabularies/vonalpep` |
| Eventos | `GET /public/events` |
| Detalhe de evento | `GET /public/events/:idOrSlug` |
| Inscrição em evento | `POST /public/events/:idOrSlug/registrations` |
| Blog | `GET /public/blog-posts` |
| Detalhe de publicação | `GET /public/blog-posts/:idOrSlug` |
