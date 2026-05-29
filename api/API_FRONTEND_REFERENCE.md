# Med-API — Frontend reference (OpenAPI-style)

Machine-oriented reference for integrating the NestJS **Med-API** (Linguistic API v2). Layout mirrors Swagger: **info**, **security**, **common parameters**, **schemas**, then **operations by tag**. Descriptions are in **English**.

---

## API info

| Field | Value |
| :--- | :--- |
| **Title** | Linguistic API |
| **Version** | 2.0 |
| **Default origin** | `http://localhost:4000` (override with `PORT`) |
| **Global prefix** | _none_ (paths are root-relative, e.g. `/auth/login`) |
| **OpenAPI UI** | `GET /api/docs` (Swagger UI, Bearer auth supported) |
| **Content-Type** | `application/json` unless noted (`multipart/form-data` for media upload) |

### CORS (server)

- **Methods:** `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`
- **Allowed headers:** `Content-Type`, `Authorization`
- **Origin:** `FRONTEND_URL` env or `*`

### Validation

Global `ValidationPipe`: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`. Unknown JSON properties on DTO-backed bodies are rejected.

### Rate limiting

- **Global:** `@nestjs/throttler` — **60 requests / 60s** per default context (app-wide guard).
- **`GET /search`:** stricter throttle — **30 requests / 60s**.

### Errors

Structured HTTP exceptions (global filter). Typical codes: `400` validation, `401` auth, `403` role/forbidden, `404` not found, `429` throttle.

---

## Security

### Bearer JWT (`Authorization`)

Most routes require:

```http
Authorization: Bearer <access_token>
```

Obtain tokens via **`POST /auth/login`** or **`POST /auth/refresh`**.

### Role model (`UserRole`)

| Value | Access summary |
| :--- | :--- |
| `ADMIN` | Full administrative access |
| `SUPERVISOR` | Review / elevated content access where noted |
| `OPERATOR` | Content entry; restricted approve/reject and ownership rules on linguistic resources |

---

## Common query parameters

### `GlobalFilterDto` (pagination & sort)

Used by: `GET /users`, `GET /media`, `GET /reports/history`, and extended DTOs below.

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | integer | `1` | Page number (min `1`) |
| `limit` | integer | `20` | Page size (min `1`) |
| `orderBy` | string | — | Field name to sort by |
| `orderDirection` | string enum | `desc` | `asc` or `desc` (see `OrderDirection` in code) |

### `LinguisticFilterDto` extends `GlobalFilterDto`

Used by: `GET /entries`, `GET /toponyms`, `GET /anthroponyms`, `GET /foreignisms`.

| Name | Type | Description |
| :--- | :--- | :--- |
| `search` | string | Full-text style search (delegates to service search when set) |
| `approvalStatus` | `ApprovalStatus` | Filter by workflow status |
| `isVocabulary` | boolean | `true` / `false` (query coerced) |
| `isForeignism` | boolean | `true` / `false` (query coerced) |
| `createdById` | string (UUID) | Filter by author user id |

### `BlogPostsFilterDto` extends `GlobalFilterDto`

`GET /blog-posts`

| Name | Type | Description |
| :--- | :--- | :--- |
| `status` | `PostStatus` | **Admin only** (when JWT + role ADMIN); ignored for public |
| `category` | string | Filter by category |

### `EventsFilterDto` extends `GlobalFilterDto`

`GET /events`

| Name | Type | Description |
| :--- | :--- | :--- |
| `period` | `upcoming` \| `ongoing` \| `past` | Time window filter |
| `category` | string | Filter by category |
| `status` | `EventStatus` | **Admin only** |

### `RegistrationFilterDto` extends `GlobalFilterDto`

`GET /event-registrations`

| Name | Type | Description |
| :--- | :--- | :--- |
| `eventId` | UUID | Filter by event |
| `status` | `RegistrationStatus` | Filter by registration status |
| `search` | string | Case-insensitive match on `name` or `email` |

### `AuditLogFilterDto` extends `GlobalFilterDto`

`GET /audit-logs`

| Name | Type | Description |
| :--- | :--- | :--- |
| `actorId` | string | User id of actor |
| `action` | string | Action key |
| `entity` | string | Entity type key |
| `from` | ISO date string | `createdAt` ≥ |
| `to` | ISO date string | `createdAt` ≤ |

---

## Schemas — enums (Prisma)

### `UserRole`

`ADMIN` · `SUPERVISOR` · `OPERATOR`

### `ApprovalStatus`

`DRAFT` · `PENDING_APPROVAL` · `APPROVED` · `REJECTED` · `NEEDS_CORRECTION` · `ARCHIVED`

### `PostStatus`

`DRAFT` · `PUBLISHED` · `ARCHIVED`

### `PostType`

`ARTICLE` · `VIDEO` · `IMAGE` · `EVENT_COVERAGE` · `ANNOUNCEMENT`

### `EventStatus`

`DRAFT` · `PUBLISHED` · `CANCELLED` · `ARCHIVED`

### `RegistrationStatus`

`PENDING` · `APPROVED` · `CANCELLED` · `REJECTED` · `ATTENDED`

---

## Schemas — request bodies (DTOs)

### `CreateEntryDto` / `UpdateEntryDto`

`UpdateEntryDto`: all fields optional (partial of create).

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `entry` | string | yes* | Headword / lemma |
| `pronunciation` | string | no | |
| `syllabicDivision` | string | no | |
| `etymology` | string | no | |
| `firstDefinition` | string | yes* | Primary definition |
| `secondDefinition` | string | no | |
| `thirdDefinition` | string | no | |
| `usageExample` | string | no | |
| `abbreviation` | string | no | |
| `acronym` | string | no | |
| `acronymMeaning` | string | no | |
| `reductionMeaning` | string | no | |
| `shortForm` | string | no | |
| `fullForm` | string | no | |
| `languageCode` | string | no | |
| `isVocabulary` | boolean | no | |
| `isForeignism` | boolean | no | |

\*Required on **create** only.

### `CreateToponymDto` / `UpdateToponymDto`

| Field | Type | Required (create) | Description |
| :--- | :--- | :---: | :--- |
| `toponym` | string | yes | Canonical form |
| `pronunciation` | string | no | |
| `meaning` | string | no | |
| `province` | string | yes | |
| `municipality` | string | no | |
| `location` | string | no | |
| `gentilic` | string | no | |
| `locationImage` | string | no | |
| `toponymHistory` | string | no | |
| `toponymProvenance` | string | no | |
| `commonUsage` | string | no | |
| `graphicVariation` | string | no | |
| `toponymClasses` | string[] | no | |
| `toponymSubclasses` | string[] | no | |
| `languageCode` | string | no | |
| `isVocabulary` | boolean | no | |
| `isForeignism` | boolean | no | |

### `CreateAnthroponymDto` / `UpdateAnthroponymDto`

| Field | Type | Required (create) | Description |
| :--- | :--- | :---: | :--- |
| `name` | string | yes | |
| `gender` | string | no | |
| `etymology` | string | no | |
| `meaning` | string | no | |
| `surname` | string | no | |
| `surnameMeaning` | string | no | |
| `historicalFigure` | string | no | |
| `historicalFigurePseudonym` | string | no | |
| `historicalFigureDomain` | string | no | |
| `isVocabulary` | boolean | no | |
| `isForeignism` | boolean | no | |

### `CreateForeignismDto` / `UpdateForeignismDto`

| Field | Type | Required (create) | Description |
| :--- | :--- | :---: | :--- |
| `term` | string | yes | Borrowed term |
| `pronunciation` | string | no | |
| `originalLanguage` | string | no | |
| `originCountry` | string | no | |
| `adaptedForm` | string | no | |
| `originalForm` | string | no | |
| `meaning` | string | no | |
| `definition` | string | no | |
| `usageExample` | string | no | |
| `context` | string | no | |
| `field` | string | no | Domain / field label |

### `CreateBlogPostDto` / `UpdateBlogPostDto`

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `title` | string | yes* | |
| `slug` | string | yes* | Unique slug |
| `excerpt` | string | no | |
| `content` | string | no | |
| `coverImageUrl` | string (URL) | no | |
| `videoUrl` | string (URL) | no | |
| `galleryImageUrls` | string[] | no | |
| `type` | `PostType` | yes* | |
| `status` | `PostStatus` | no | Default `DRAFT` on create |
| `category` | string | no | |
| `tags` | string[] | no | |
| `isFeatured` | boolean | no | Default `false` |

### `CreateEventDto` / `UpdateEventDto`

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `title` | string | yes* | |
| `slug` | string | yes* | |
| `description` | string | no | |
| `category` | string | no | |
| `coverImageUrl` | string (URL) | no | |
| `startDate` | string (ISO 8601) | yes* | |
| `endDate` | string (ISO 8601) | yes* | |
| `location` | string | yes* | |
| `registrationCount` | integer ≥ 0 | no | Default `0` |
| `maxRegistrations` | integer ≥ 1 | no | Capacity cap |
| `status` | `EventStatus` | no | Default `DRAFT` on create |

### `CreateRegistrationDto` — public registration

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `eventId` | UUID | yes | Target event |
| `name` | string | yes | Participant name |
| `email` | string (email) | yes | |
| `phone` | string | no | |
| `organization` | string | no | |
| `notes` | string | no | |

---

## Operations by tag

This section contains a comprehensive list of all controllers, their endpoints, parameters, body schemas, and the internal service methods they invoke.

### Controller: `AppController`

**Base Path:** `/`

#### `GET /`

| Property | Value |
| :--- | :--- |
| **Method Name** | `getHello` |
| **Services Invoked** | `Service: appService, Method: getHello` |

---

### Controller: `AnthroponymsController`

**Base Path:** `/anthroponyms`

#### `POST /anthroponyms`

| Property | Value |
| :--- | :--- |
| **Method Name** | `create` |
| **Services Invoked** | `Service: anthroponymsService, Method: create` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `createAnthroponymDto` | `CreateAnthroponymDto` |

#### `GET /anthroponyms`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findAll` |
| **Services Invoked** | `Service: anthroponymsService, Method: search`<br>`Service: anthroponymsService, Method: findAll` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `filters` | `LinguisticFilterDto` |

#### `GET /anthroponyms/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findOne` |
| **Services Invoked** | `Service: anthroponymsService, Method: findOne` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /anthroponyms/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `update` |
| **Services Invoked** | `Service: anthroponymsService, Method: findOne`<br>`Service: anthroponymsService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `updateAnthroponymDto` | `UpdateAnthroponymDto` |

#### `DELETE /anthroponyms/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `remove` |
| **Services Invoked** | `Service: anthroponymsService, Method: findOne`<br>`Service: anthroponymsService, Method: remove` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /anthroponyms/:id/review`

| Property | Value |
| :--- | :--- |
| **Method Name** | `review` |
| **Services Invoked** | `Service: anthroponymsService, Method: findOne`<br>`Service: anthroponymsService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `status` | `ApprovalStatus` |
| `reason` | `string` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION', 'ARCHIVED'],
          description: 'New approval status to set for the anthroponym'
        },
        reason: { 
          type: 'string', 
          description: 'Optional reason or feedback, required for rejection or correction' 
        }
      },
      required: ['status']
    }
  }
```

#### `GET /anthroponyms/:id/schema`

| Property | Value |
| :--- | :--- |
| **Method Name** | `generateSchema` |
| **Services Invoked** | `Service: anthroponymsService, Method: findOne` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

---

### Controller: `AuditLogsController`

**Base Path:** `/audit-logs`

#### `GET /audit-logs`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findAll` |
| **Services Invoked** | `Service: auditLogsService, Method: findAll` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `filters` | `AuditLogFilterDto` |

#### `GET /audit-logs/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findOne` |
| **Services Invoked** | `Service: auditLogsService, Method: findOne` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

---

### Controller: `AuthController`

**Base Path:** `/auth`

#### `POST /auth/login`

| Property | Value |
| :--- | :--- |
| **Method Name** | `login` |
| **Services Invoked** | `Service: authService, Method: login` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['email', 'password'],
    },
  }
```

#### `POST /auth/register`

| Property | Value |
| :--- | :--- |
| **Method Name** | `register` |
| **Services Invoked** | `Service: authService, Method: register` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `body` | `Record<string, any>` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
        role: { type: 'string', example: 'OPERATOR' },
      },
      required: ['name', 'email', 'password'],
    },
  }
```

#### `POST /auth/refresh`

| Property | Value |
| :--- | :--- |
| **Method Name** | `refresh` |
| **Services Invoked** | `Service: authService, Method: refreshTokens` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `refreshToken` | `string` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'jwt-refresh-token' },
      },
      required: ['refreshToken'],
    },
  }
```

#### `POST /auth/logout`

| Property | Value |
| :--- | :--- |
| **Method Name** | `logout` |
| **Services Invoked** | `Service: authService, Method: logout` |

#### `GET /auth/profile`

| Property | Value |
| :--- | :--- |
| **Method Name** | `getProfile` |

---

### Controller: `BlogController`

**Base Path:** `/blog-posts`

#### `POST /blog-posts`

| Property | Value |
| :--- | :--- |
| **Method Name** | `create` |
| **Services Invoked** | `Service: blogService, Method: create` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `createDto` | `CreateBlogPostDto` |

#### `GET /blog-posts`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findAll` |
| **Services Invoked** | `Service: blogService, Method: findAll` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `filters` | `BlogPostsFilterDto` |

#### `GET /blog-posts/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findOne` |
| **Services Invoked** | `Service: blogService, Method: findOne` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /blog-posts/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `update` |
| **Services Invoked** | `Service: blogService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `updateDto` | `UpdateBlogPostDto` |

#### `DELETE /blog-posts/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `remove` |
| **Services Invoked** | `Service: blogService, Method: remove` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /blog-posts/:id/status`

| Property | Value |
| :--- | :--- |
| **Method Name** | `updateStatus` |
| **Services Invoked** | `Service: blogService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `status` | `PostStatus` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] }
      },
      required: ['status']
    },
  }
```

---

### Controller: `EntriesController`

**Base Path:** `/entries`

#### `POST /entries`

| Property | Value |
| :--- | :--- |
| **Method Name** | `create` |
| **Services Invoked** | `Service: entriesService, Method: create` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `createEntryDto` | `CreateEntryDto` |

#### `GET /entries`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findAll` |
| **Services Invoked** | `Service: entriesService, Method: search`<br>`Service: entriesService, Method: findAll` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `filters` | `LinguisticFilterDto` |

#### `GET /entries/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findOne` |
| **Services Invoked** | `Service: entriesService, Method: findOne` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /entries/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `update` |
| **Services Invoked** | `Service: entriesService, Method: findOne`<br>`Service: entriesService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `updateEntryDto` | `UpdateEntryDto` |

#### `DELETE /entries/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `remove` |
| **Services Invoked** | `Service: entriesService, Method: findOne`<br>`Service: entriesService, Method: remove` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /entries/:id/review`

| Property | Value |
| :--- | :--- |
| **Method Name** | `review` |
| **Services Invoked** | `Service: entriesService, Method: findOne`<br>`Service: entriesService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `status` | `ApprovalStatus` |
| `reason` | `string` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION', 'ARCHIVED'],
          description: 'New approval status to set for the entry'
        },
        reason: { 
          type: 'string', 
          description: 'Optional reason or feedback, required for rejection or correction' 
        }
      },
      required: ['status']
    }
  }
```

#### `GET /entries/:id/schema`

| Property | Value |
| :--- | :--- |
| **Method Name** | `generateSchema` |
| **Services Invoked** | `Service: entriesService, Method: findOne` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

---

### Controller: `EventRegistrationsController`

**Base Path:** `/event-registrations`

#### `POST /event-registrations`

| Property | Value |
| :--- | :--- |
| **Method Name** | `create` |
| **Services Invoked** | `Service: registrationsService, Method: create` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `createDto` | `CreateRegistrationDto` |

#### `GET /event-registrations`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findAll` |
| **Services Invoked** | `Service: registrationsService, Method: findAll` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `filters` | `RegistrationFilterDto` |

#### `GET /event-registrations/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findOne` |
| **Services Invoked** | `Service: registrationsService, Method: findOne` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /event-registrations/:id/status`

| Property | Value |
| :--- | :--- |
| **Method Name** | `updateStatus` |
| **Services Invoked** | `Service: registrationsService, Method: updateStatus` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `status` | `RegistrationStatus` |
| `notes` | `string` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] },
        notes: { type: 'string', description: 'Optional notes/reason for rejection' }
      },
      required: ['status']
    }
  }
```

#### `PATCH /event-registrations/:id/attendance`

| Property | Value |
| :--- | :--- |
| **Method Name** | `markAttendance` |
| **Services Invoked** | `Service: registrationsService, Method: markAttendance` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `attended` | `boolean` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        attended: { type: 'boolean' }
      },
      required: ['attended']
    }
  }
```

#### `DELETE /event-registrations/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `remove` |
| **Services Invoked** | `Service: registrationsService, Method: remove` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

---

### Controller: `EventsController`

**Base Path:** `/events`

#### `POST /events`

| Property | Value |
| :--- | :--- |
| **Method Name** | `create` |
| **Services Invoked** | `Service: eventsService, Method: create` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `createDto` | `CreateEventDto` |

#### `GET /events`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findAll` |
| **Services Invoked** | `Service: eventsService, Method: findAll` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `filters` | `EventsFilterDto` |

#### `GET /events/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findOne` |
| **Services Invoked** | `Service: eventsService, Method: findOne` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /events/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `update` |
| **Services Invoked** | `Service: eventsService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `updateDto` | `UpdateEventDto` |

#### `DELETE /events/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `remove` |
| **Services Invoked** | `Service: eventsService, Method: remove` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /events/:id/status`

| Property | Value |
| :--- | :--- |
| **Method Name** | `updateStatus` |
| **Services Invoked** | `Service: eventsService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `status` | `EventStatus` |
| `reason` | `string` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'] },
        reason: { type: 'string', description: 'Reason for cancellation' }
      },
      required: ['status']
    },
  }
```

---

### Controller: `ForeignismsController`

**Base Path:** `/foreignisms`

#### `POST /foreignisms`

| Property | Value |
| :--- | :--- |
| **Method Name** | `create` |
| **Services Invoked** | `Service: foreignismsService, Method: create` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `createForeignismDto` | `CreateForeignismDto` |

#### `GET /foreignisms`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findAll` |
| **Services Invoked** | `Service: foreignismsService, Method: search`<br>`Service: foreignismsService, Method: findAll` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `filters` | `LinguisticFilterDto` |

#### `GET /foreignisms/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findOne` |
| **Services Invoked** | `Service: foreignismsService, Method: findOne` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /foreignisms/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `update` |
| **Services Invoked** | `Service: foreignismsService, Method: findOne`<br>`Service: foreignismsService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `updateForeignismDto` | `UpdateForeignismDto` |

#### `DELETE /foreignisms/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `remove` |
| **Services Invoked** | `Service: foreignismsService, Method: findOne`<br>`Service: foreignismsService, Method: remove` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /foreignisms/:id/review`

| Property | Value |
| :--- | :--- |
| **Method Name** | `review` |
| **Services Invoked** | `Service: foreignismsService, Method: findOne`<br>`Service: foreignismsService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `status` | `ApprovalStatus` |
| `reason` | `string` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION', 'ARCHIVED'],
          description: 'New approval status to set for the foreignism'
        },
        reason: { 
          type: 'string', 
          description: 'Optional reason or feedback, required for rejection or correction' 
        }
      },
      required: ['status']
    }
  }
```

---

### Controller: `MediaController`

**Base Path:** `/media`

#### `POST /media/upload`

| Property | Value |
| :--- | :--- |
| **Method Name** | `uploadFile` |
| **Services Invoked** | `Service: mediaService, Method: uploadFile` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `entity` | `string` |
| `entityId` | `string` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entity: { type: 'string' },
        entityId: { type: 'string' },
      },
    },
  }
```

#### `GET /media`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findAll` |
| **Services Invoked** | `Service: mediaService, Method: findAll` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `filters` | `GlobalFilterDto` |

#### `GET /media/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findOne` |
| **Services Invoked** | `Service: mediaService, Method: findOne` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `DELETE /media/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `remove` |
| **Services Invoked** | `Service: mediaService, Method: remove` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

---

### Controller: `NotificationsController`

**Base Path:** `/notifications`

#### `GET /notifications`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findAll` |
| **Services Invoked** | `Service: notificationsService, Method: findAll` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `limit` | `any` |
| `unreadOnly` | `string` |

#### `GET /notifications/unread-count`

| Property | Value |
| :--- | :--- |
| **Method Name** | `unreadCount` |
| **Services Invoked** | `Service: notificationsService, Method: unreadCount` |

#### `GET /notifications/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findOne` |
| **Services Invoked** | `Service: notificationsService, Method: findOne` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /notifications/:id/read`

| Property | Value |
| :--- | :--- |
| **Method Name** | `markAsRead` |
| **Services Invoked** | `Service: notificationsService, Method: markAsRead` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /notifications/read-all`

| Property | Value |
| :--- | :--- |
| **Method Name** | `markAllAsRead` |
| **Services Invoked** | `Service: notificationsService, Method: markAllAsRead` |

---

### Controller: `PublicController`

**Base Path:** `/public`

#### `GET /public/search`

| Property | Value |
| :--- | :--- |
| **Method Name** | `globalSearch` |
| **Services Invoked** | `Service: entriesService, Method: search`<br>`Service: toponymsService, Method: search`<br>`Service: anthroponymsService, Method: search`<br>`Service: foreignismsService, Method: search` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `query` | `string` |

#### `GET /public/dictionary`

| Property | Value |
| :--- | :--- |
| **Method Name** | `dictionarySearch` |
| **Services Invoked** | `Service: entriesService, Method: search` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `query` | `string` |

#### `GET /public/toponyms`

| Property | Value |
| :--- | :--- |
| **Method Name** | `toponymSearch` |
| **Services Invoked** | `Service: toponymsService, Method: search` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `query` | `string` |

#### `GET /public/events`

| Property | Value |
| :--- | :--- |
| **Method Name** | `publicEvents` |
| **Services Invoked** | `Service: eventsService, Method: findAll` |

#### `GET /public/events/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `publicEventDetails` |
| **Services Invoked** | `Service: eventsService, Method: findOne` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

---

### Controller: `ReportsController`

**Base Path:** `/reports`

#### `GET /reports/generate/:type`

| Property | Value |
| :--- | :--- |
| **Method Name** | `generateReport` |
| **Services Invoked** | `Service: reportsService, Method: generateReport` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `type` | `string` | `type` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `format` | `'xlsx' | 'pdf'` |

#### `GET /reports/history`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findAll` |
| **Services Invoked** | `Service: reportsService, Method: getHistory` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `filters` | `GlobalFilterDto` |

#### `POST /reports/schedule`

| Property | Value |
| :--- | :--- |
| **Method Name** | `scheduleReport` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `body` | `any` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        reportType: { type: 'string', example: 'users' },
        frequency: { type: 'string', example: 'weekly' },
        emailTo: { type: 'string', example: 'admin@example.com' }
      },
      required: ['reportType']
    },
  }
```

#### `GET /reports/download/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `downloadReport` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

---

### Controller: `SearchController`

**Base Path:** `/search`

#### `GET /search`

| Property | Value |
| :--- | :--- |
| **Method Name** | `search` |
| **Services Invoked** | `Service: searchService, Method: globalSearch` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `q` | `string` |
| `limit` | `string` |

---

### Controller: `StatsController`

**Base Path:** `/stats`

#### `GET /stats/dashboard`

| Property | Value |
| :--- | :--- |
| **Method Name** | `getGlobalDashboard` |
| **Services Invoked** | `Service: statsService, Method: getDashboardGlobal` |

#### `GET /stats/dashboard/me`

| Property | Value |
| :--- | :--- |
| **Method Name** | `getMeDashboard` |
| **Services Invoked** | `Service: statsService, Method: getUserDashboard` |

#### `GET /stats/dashboard/users/:userId`

| Property | Value |
| :--- | :--- |
| **Method Name** | `getUserDashboard` |
| **Services Invoked** | `Service: statsService, Method: getUserDashboard` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `userId` | `string` | `userId` |

---

### Controller: `ToponymsController`

**Base Path:** `/toponyms`

#### `POST /toponyms`

| Property | Value |
| :--- | :--- |
| **Method Name** | `create` |
| **Services Invoked** | `Service: toponymsService, Method: create` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `createToponymDto` | `CreateToponymDto` |

#### `GET /toponyms`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findAll` |
| **Services Invoked** | `Service: toponymsService, Method: search`<br>`Service: toponymsService, Method: findAll` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `filters` | `LinguisticFilterDto` |

#### `GET /toponyms/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findOne` |
| **Services Invoked** | `Service: toponymsService, Method: findOne` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /toponyms/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `update` |
| **Services Invoked** | `Service: toponymsService, Method: findOne`<br>`Service: toponymsService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `updateToponymDto` | `UpdateToponymDto` |

#### `DELETE /toponyms/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `remove` |
| **Services Invoked** | `Service: toponymsService, Method: findOne`<br>`Service: toponymsService, Method: remove` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /toponyms/:id/review`

| Property | Value |
| :--- | :--- |
| **Method Name** | `review` |
| **Services Invoked** | `Service: toponymsService, Method: findOne`<br>`Service: toponymsService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `status` | `ApprovalStatus` |
| `reason` | `string` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION', 'ARCHIVED'],
          description: 'New approval status to set for the toponym'
        },
        reason: { 
          type: 'string', 
          description: 'Optional reason or feedback, required for rejection or correction' 
        }
      },
      required: ['status']
    }
  }
```

#### `GET /toponyms/:id/schema`

| Property | Value |
| :--- | :--- |
| **Method Name** | `generateSchema` |
| **Services Invoked** | `Service: toponymsService, Method: findOne` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

---

### Controller: `UsersController`

**Base Path:** `/users`

#### `GET /users`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findAll` |
| **Services Invoked** | `Service: usersService, Method: listManagedOperators`<br>`Service: usersService, Method: findAll`<br>`Service: usersService, Method: count` |

**Query Parameters:**

| Name | Type |
| :--- | :--- |
| `filters` | `UserFilterDto` |

#### `POST /users`

| Property | Value |
| :--- | :--- |
| **Method Name** | `create` |
| **Services Invoked** | `Service: usersService, Method: create` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `createData` | `any` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Unique email address for the user' },
        password: { type: 'string', description: 'Strong password for authentication' },
        name: { type: 'string', description: 'Full name of the user' },
        role: { 
          type: 'string', 
          enum: ['ADMIN', 'SUPERVISOR', 'OPERATOR'],
          description: 'User role: ADMIN (Full access), SUPERVISOR (Reviewer), OPERATOR (Data entry)'
        },
        isActive: { type: 'boolean', description: 'Enable or disable the user account', default: true }
      },
      required: ['email', 'password', 'name'],
    },
  }
```

#### `GET /users/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `findOne` |
| **Services Invoked** | `Service: usersService, Method: findById` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /users/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `update` |
| **Services Invoked** | `Service: usersService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `updateData` | `any` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        name: { type: 'string' },
        role: { 
          type: 'string', 
          enum: ['ADMIN', 'SUPERVISOR', 'OPERATOR'],
          description: 'User role: ADMIN (Full access), SUPERVISOR (Reviewer), OPERATOR (Data entry)'
        },
        isActive: { type: 'boolean' }
      }
    },
  }
```

#### `PATCH /users/:id/role`

| Property | Value |
| :--- | :--- |
| **Method Name** | `updateRole` |
| **Services Invoked** | `Service: usersService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `role` | `UserRole` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        role: { 
          type: 'string', 
          enum: ['ADMIN', 'SUPERVISOR', 'OPERATOR'],
          description: 'New role for the user: ADMIN, SUPERVISOR, or OPERATOR'
        }
      },
      required: ['role']
    },
  }
```

#### `PATCH /users/:id/status`

| Property | Value |
| :--- | :--- |
| **Method Name** | `updateStatus` |
| **Services Invoked** | `Service: usersService, Method: update` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `isActive` | `boolean` |

**@ApiBody Schema:**

```javascript
{
    schema: {
      type: 'object',
      properties: {
        isActive: { type: 'boolean' }
      },
      required: ['isActive']
    }
  }
```

#### `GET /users/:id/operators`

| Property | Value |
| :--- | :--- |
| **Method Name** | `listManagedOperators` |
| **Services Invoked** | `Service: usersService, Method: listManagedOperators` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

#### `PATCH /users/:id/operators`

| Property | Value |
| :--- | :--- |
| **Method Name** | `assignManagedOperators` |
| **Services Invoked** | `Service: usersService, Method: assignOperatorsToSupervisor` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

**Request Body Types:**

| Name | Type |
| :--- | :--- |
| `assignSupervisorOperatorsDto` | `AssignSupervisorOperatorsDto` |

**@ApiBody Schema:**

```javascript
{ type: AssignSupervisorOperatorsDto }
```

#### `DELETE /users/:id`

| Property | Value |
| :--- | :--- |
| **Method Name** | `remove` |
| **Services Invoked** | `Service: usersService, Method: remove` |

**Path Parameters:**

| Name | Type | Key |
| :--- | :--- | :--- |
| `id` | `string` | `id` |

---

_End of document._
