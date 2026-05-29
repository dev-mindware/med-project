# Planeamento Funcional do Sistema Linguístico

## 1. Visão geral

O sistema será uma plataforma de gestão linguística, cultural e documental, com autenticação completa, controlo de permissões por nível de utilizador, auditoria detalhada, fluxo de aprovação de conteúdos e módulos públicos para artigos, eventos e gestão nativa de inscrições com emissão de passes por e-mail. A documentação técnica (Swagger) e as descrições de status são mantidas em **Inglês** para compatibilidade com padrões de desenvolvimento modernos.


A aplicação terá três níveis principais de utilizador:

1. **Admin**
2. **Supervisor**
3. **Operator**

A regra central do sistema é simples:

> O Admin controla tudo. O Supervisor valida e gere conteúdos. O Operator apenas cadastra e gere aquilo que ele próprio criou.

---

## 2. Perfis de utilizador e permissões

## 2.1 Admin

O Admin tem acesso total ao sistema.

### Permissões do Admin

- Criar, editar, activar, desactivar e apagar utilizadores.
- Alterar o perfil de qualquer utilizador.
- Gerir todos os registos de:
  - Entries
  - Anthroponyms
  - Toponyms
  - Foreignisms
  - Artigos do blog
  - Eventos
  - Inscrições
- Aprovar, rejeitar, editar ou apagar qualquer conteúdo.
- Ver todos os audit logs.
- Ver estatísticas gerais do sistema.
- Gerir categorias, estados, classificações e dados administrativos.
- Alterar configurações globais do sistema.

### O Admin pode fazer tudo, inclusive:

- Apagar conteúdos de outros utilizadores.
- Forçar aprovação de conteúdos.
- Reverter estados de aprovação.
- Bloquear utilizadores.
- Consultar histórico completo de alterações.

---

## 2.2 Supervisor

O Supervisor é o perfil responsável pela validação e controlo da qualidade dos conteúdos.

### Permissões do Supervisor

- Cadastrar conteúdos como:
  - Entry
  - Anthroponym
  - Toponym
  - Foreignism
- Editar conteúdos linguísticos.
- Aprovar cadastros feitos por Operators.
- Rejeitar cadastros feitos por Operators.
- Solicitar correcções em conteúdos submetidos.
- Ver conteúdos pendentes de aprovação.
- Ver histórico de aprovação dos conteúdos.
- Não pode gerir blog.
- Não pode gerir eventos.
- Consultar audit logs relacionados aos conteúdos que gere.

### Limitações do Supervisor

- Não pode gerir utilizadores Admin.
- Não pode apagar utilizadores.
- Não pode alterar permissões globais.
- Não pode apagar conteúdos de Admin, salvo se o sistema permitir mediante regra especial.
- Não deve ter acesso total aos logs sensíveis de autenticação de outros utilizadores.

---

## 2.3 Operator

O Operator é o perfil básico de registo de dados.

### Permissões do Operator

- Cadastrar conteúdos linguísticos.
- Editar conteúdos que ele próprio cadastrou, enquanto ainda não estiverem aprovados.
- Apagar somente conteúdos que ele próprio cadastrou, desde que ainda não estejam aprovados.
- Submeter conteúdos para aprovação.
- Ver o estado dos seus próprios cadastros:
  - Draft
  - Pending approval
  - Approved
  - Rejected
  - Needs correction
- Actualizar os próprios dados pessoais.

### Limitações do Operator

- Não pode aprovar conteúdos.
- Não pode editar conteúdos de outros utilizadores.
- Não pode apagar conteúdos de outros utilizadores.
- Não pode gerir utilizadores.
- Não pode ver audit logs globais.
- Não pode alterar configurações do sistema.

---

# 3. Fluxo de autenticação

O sistema deve ter autenticação completa, segura e auditável.

## 3.1 Login

### Campos necessários

- Email
- Password

### Funcionamento

1. O utilizador envia email e password.
2. O backend valida as credenciais.
3. Se estiver correcto, gera:
   - Access token
   - Refresh token
4. O refresh token deve ser armazenado com hash no banco.
5. O sistema actualiza o `lastLogin`.
6. Um audit log deve ser criado com o evento `LOGIN_SUCCESS`.

### Em caso de erro

Criar audit log com:

- `LOGIN_FAILED`
- Email usado
- IP
- User agent
- Motivo do erro, sem expor a password

---

## 3.2 Refresh token

### Funcionamento

1. O frontend envia o refresh token.
2. O backend valida se o token existe e não expirou.
3. O backend compara com o hash guardado.
4. Se for válido, emite novo access token.
5. Opcionalmente, também emite novo refresh token.
6. Cria audit log `TOKEN_REFRESHED`.

### Regra recomendada

Usar rotação de refresh token.

Isto significa que sempre que um refresh token é usado, ele deve ser substituído por outro. É mais seguro.

---

## 3.3 Logout

### Funcionamento

1. O utilizador solicita logout.
2. O backend invalida o refresh token guardado.
3. O frontend remove os tokens locais.
4. O sistema cria audit log `LOGOUT`.

---

## 3.4 Reset password

### Fluxo completo

1. O utilizador solicita recuperação de senha pelo email.
2. O sistema gera um token temporário.
3. Guarda no banco:
   - `resetPasswordToken`
   - `resetPasswordExpires`
4. Envia email com link de recuperação.
5. O utilizador define nova senha.
6. O sistema valida se o token ainda é válido.
7. A nova senha é guardada com hash.
8. O token de recuperação é removido.
9. Todos os refresh tokens activos devem ser invalidados.
10. Cria audit log `PASSWORD_RESET_SUCCESS`.

### Eventos de auditoria relacionados

- `PASSWORD_RESET_REQUESTED`
- `PASSWORD_RESET_FAILED`
- `PASSWORD_RESET_SUCCESS`
- `PASSWORD_CHANGED`

---

# 4. Gestão dos próprios dados do utilizador

Cada utilizador pode alterar os seus próprios dados.

## Campos editáveis pelo próprio utilizador

- Nome
- Foto de perfil
- Email
- Senha

## Regras importantes

### Alteração de nome

Permitida directamente.

### Alteração de foto

A imagem deve ser enviada para storage externo, como:

- Cloudinary
- S3
- Cloudflare R2
- Outro storage compatível

No banco deve ficar apenas a URL da imagem.

### Alteração de email

Deve exigir confirmação.

Fluxo recomendado:

1. Utilizador pede alteração do email.
2. Sistema envia confirmação para o novo email.
3. Só após confirmação o email é actualizado.
4. Criar audit log `EMAIL_CHANGE_REQUESTED` e `EMAIL_CHANGED`.

### Alteração de senha

Deve exigir senha actual.

Fluxo:

1. Utilizador envia senha actual.
2. Envia nova senha.
3. Backend valida a senha actual.
4. Backend troca a senha.
5. Backend invalida refresh tokens antigos.
6. Audit log `PASSWORD_CHANGED`.

---

# 5. Audit logs detalhados

O sistema deve guardar logs de auditoria para praticamente tudo que muda estado, cria dados, apaga dados, aprova conteúdos ou altera permissões.

## 5.1 Objectivo dos audit logs

Os audit logs servem para responder perguntas como:

- Quem criou este conteúdo?
- Quem alterou este campo?
- Quem apagou este registo?
- Quem aprovou esta entrada?
- Quem tentou entrar no sistema e falhou?
- Quando determinada acção aconteceu?
- De que IP veio a acção?
- Qual era o valor anterior e qual passou a ser o novo valor?

---

## 5.2 Dados mínimos de um audit log

Cada audit log deve guardar:

- Utilizador que fez a acção
- Tipo de acção
- Entidade afectada
- ID da entidade afectada
- Dados anteriores
- Dados novos
- IP
- User agent
- Resultado da acção
- Motivo da falha, se existir
- Data e hora

---

## 5.3 Acções que devem ser auditadas

## Autenticação

- Login com sucesso
- Login falhado
- Logout
- Refresh token
- Pedido de reset password
- Reset password concluído
- Alteração de senha
- Alteração de email

## Utilizadores

- Criação de utilizador
- Edição de utilizador
- Alteração de role
- Activação de utilizador
- Desactivação de utilizador
- Eliminação de utilizador

## Conteúdos linguísticos

- Criação de Entry
- Leitura/listagem de Entry
- Edição de Entry
- Eliminação de Entry
- Submissão para aprovação
- Aprovação
- Rejeição
- Pedido de correcção
- Marcação como vocabulário
- Remoção da marcação como vocabulário
- Marcação como estrangeirismo
- Remoção da marcação como estrangeirismo

As mesmas regras aplicam-se a:

- Anthroponym
- Toponym
- Foreignism

## Blog

- Criação de artigo
- Edição de artigo
- Publicação de artigo
- Arquivamento de artigo
- Eliminação de artigo

## Eventos

- Criação de evento
- Edição de evento
- Cancelamento de evento
- Publicação de evento
- Arquivamento de evento
- Gestão de inscrições e emissão de passes

---

# 6. Fluxo de aprovação de conteúdos

Os conteúdos cadastrados por Operators devem passar por aprovação.

## 6.1 Estados de aprovação

Criar enum `ApprovalStatus`:

```prisma
DRAFT
PENDING_APPROVAL
APPROVED
REJECTED
NEEDS_CORRECTION
ARCHIVED
```

## 6.2 Fluxo normal

1. Operator cria conteúdo como `DRAFT`.
2. Operator submete para aprovação.
3. Estado muda para `PENDING_APPROVAL`.
4. Supervisor analisa.
5. Supervisor pode:
   - Aprovar
   - Rejeitar
   - Pedir correcção
6. Se aprovado, o conteúdo fica disponível.
7. Se rejeitado, fica registado o motivo.
8. Se precisar de correcção, volta ao Operator.

## 6.3 Campos recomendados em cada model de conteúdo

Adicionar estes campos em:

- Entry
- Anthroponym
- Toponym
- Foreignism

```prisma
createdById String? @db.ObjectId
updatedById String? @db.ObjectId
approvedById String? @db.ObjectId
approvalStatus ApprovalStatus @default(DRAFT)
approvedAt DateTime?
submittedAt DateTime?
rejectedAt DateTime?
rejectionReason String?
correctionNotes String?
```

## 6.4 Regra principal de acesso

### Operator

Só pode editar/apagar se:

```ts
content.createdById === currentUser.id && content.approvalStatus !== "APPROVED"
```

### Supervisor

Pode aprovar conteúdos submetidos por Operators.

### Admin

Pode fazer tudo.

---

# 7. Campos para reduções e abreviaturas

As palavras cadastradas devem permitir registar reduções e abreviaturas.

## 7.1 Campos recomendados

Adicionar nos conteúdos linguísticos, especialmente em `Entry` e `Foreignism`:

```prisma
abbreviation String?
abbreviationMeaning String?
acronym String?
acronymMeaning String?
reduction String?
reductionMeaning String?
shortForm String?
fullForm String?
```

## 7.2 Explicação dos campos

### abbreviation

A forma abreviada da palavra.

Exemplo:

```txt
Dr.
```

### abbreviationMeaning

O significado da abreviatura.

Exemplo:

```txt
Doutor
```

### reduction

Forma reduzida ou encurtada da palavra.

Exemplo:

```txt
foto
```

### reductionMeaning

Significado ou explicação da redução.

Exemplo:

```txt
Redução de fotografia
```

### shortForm

Forma curta usada no dia-a-dia.

### fullForm

Forma completa ou original.

---

# 8. Mini blog estilo rede social

O sistema deve ter um mini blog para publicação de conteúdos institucionais, culturais e educativos.

## 8.1 Tipos de conteúdo

O blog deve permitir publicar:

- Artigos
- Imagens de eventos
- Vídeos
- Comunicados
- Conteúdos educativos
- Galerias

## 8.2 Funcionalidades principais

- Criar publicação
- Editar publicação
- Publicar
- Guardar como rascunho
- Arquivar
- Apagar
- Adicionar imagem de capa
- Adicionar vídeo
- Adicionar galeria de imagens
- Categorizar publicações
- Filtrar por categoria
- Pesquisar publicações
- Destacar publicações importantes

## 8.3 Estados do post

Criar enum `PostStatus`:

```prisma
DRAFT
PUBLISHED
ARCHIVED
```

## 8.4 Tipos de post

Criar enum `PostType`:

```prisma
ARTICLE
VIDEO
IMAGE
EVENT_COVERAGE
ANNOUNCEMENT
```

## 8.5 Campos recomendados para BlogPost

```prisma
model BlogPost {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  title String
  slug String @unique
  excerpt String?
  content String?
  coverImageUrl String?
  videoUrl String?
  galleryImageUrls String[]
  type PostType
  status PostStatus @default(DRAFT)
  category String?
  tags String[]
  isFeatured Boolean @default(false)
  authorId String @db.ObjectId
  publishedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("blog_posts")
}
```

## 8.6 Regras de permissão do blog

A gestão do blog é exclusiva do Admin.

### Admin

Pode:

- Criar publicações.
- Editar publicações.
- Publicar publicações.
- Arquivar publicações.
- Apagar publicações.
- Gerir categorias, tags, imagens, vídeos e destaques.

### Supervisor

Não pode gerir o blog.

### Operator

Não pode gerir o blog.

Regra directa:

> Blog é conteúdo institucional. Deve ficar apenas nas mãos do Admin.

---

# 9. Módulo de eventos

O sistema deve permitir criar e gerir eventos.

## 9.1 Estados temporais dos eventos

Os eventos devem ser filtrados em:

1. Próximos eventos
2. Eventos em andamento
3. Eventos passados

## 9.2 Como calcular o estado do evento

### Próximo evento

```ts
startDate > now
```

### Em andamento

```ts
startDate <= now && endDate >= now
```

### Passado

```ts
endDate < now
```

## 9.3 Campos obrigatórios do evento

Cada evento deve ter:

- Título
- Categoria
- Data de início
- Data de fim
- Localização
- Número de inscritos
- Estado de publicação
- Gestão de inscrições nativa

## 9.4 Gestão de Inscrições Nativa (Abolição do Google Forms)

O sistema possui um módulo interno para gerir as inscrições, eliminando a necessidade de ferramentas externas.

### Fluxo de Inscrição

1. O utilizador acede ao evento público.
2. Preenche o formulário nativo (Nome, Email, Telefone, Organização).
3. O sistema valida se ainda existem vagas (`maxRegistrations`) e se o e-mail já não está inscrito.
4. O estado inicial da inscrição é `PENDING`.
5. O Admin ou Supervisor analisa a inscrição.

## 9.5 Emissão de Passes e Convites Automatizados

Ao aprovar uma inscrição, o sistema realiza as seguintes acções:

1. Altera o estado para `APPROVED`.
2. Incrementa automaticamente o `registrationCount` do evento.
3. Envia um e-mail automático ao participante contendo:
   - Título e detalhes do evento.
   - **Passe de Entrada** (Código único de identificação).
   - Instruções de participação.

Em caso de rejeição, um e-mail de notificação também é enviado com o motivo.

## 9.6 Permissões dos eventos

A gestão de eventos é exclusiva do Admin.

### Admin

Pode:

- Criar eventos.
- Editar eventos.
- Publicar eventos.
- Cancelar eventos.
- Arquivar eventos.
- Apagar eventos.
- Gerir inscrições, aprovar participantes e emitir passes.

### Supervisor

Não pode gerir eventos.

### Operator

Não pode gerir eventos.

Regra directa:

> Eventos mexem com imagem pública da instituição. Devem ser geridos apenas pelo Admin.

---

## 9.7 Campos recomendados para Event

```prisma
model Event {
  id                 String      @id @default(uuid())
  title              String
  slug               String      @unique
  description        String?
  category           String
  coverImageUrl      String?
  startDate          DateTime
  endDate            DateTime
  location           String
  registrationCount  Int         @default(0)
  maxRegistrations   Int?
  status             EventStatus @default(DRAFT)
  createdById        String
  publishedAt        DateTime?
  cancelledAt        DateTime?
  cancellationReason String?
  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt
  
  registrations      EventRegistration[]

  @@map("events")
}

model EventRegistration {
  id              String             @id @default(uuid())
  eventId         String
  event           Event              @relation(fields: [eventId], references: [id])
  name            String
  email           String
  phone           String?
  organization    String?
  status          RegistrationStatus @default(PENDING)
  notes           String?
  attended        Boolean            @default(false)
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  @@unique([eventId, email])
  @@map("event_registrations")
}

```

## 9.8 Enum EventStatus

```prisma
enum EventStatus {
  DRAFT
  PUBLISHED
  CANCELLED
  ARCHIVED
}
```

---

# 10. Models adicionais recomendadas

## 10.1 AuditLog

```prisma
model AuditLog {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  actorId String? @db.ObjectId
  actorRole UserRole?
  action String
  entity String
  entityId String?
  oldValues Json?
  newValues Json?
  ipAddress String?
  userAgent String?
  status String
  failureReason String?
  metadata Json?
  createdAt DateTime @default(now())

  @@map("audit_logs")
}
```

## 10.2 RefreshToken

```prisma
model RefreshToken {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @db.ObjectId
  tokenHash String
  expiresAt DateTime
  revokedAt DateTime?
  replacedByTokenHash String?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  @@map("refresh_tokens")
}
```

## 10.3 MediaAsset

Para imagens, vídeos e ficheiros usados em blog, eventos, perfis e conteúdos linguísticos.

```prisma
model MediaAsset {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  url String
  filename String?
  mimeType String?
  size Int?
  storageProvider String?
  uploadedById String? @db.ObjectId
  entity String?
  entityId String?
  createdAt DateTime @default(now())

  @@map("media_assets")
}
```

---

# 11. Ajustes recomendados no User

Adicionar campos ao `User`:

```prisma
profilePhotoUrl String?
isActive Boolean @default(true)
emailVerifiedAt DateTime?
lastPasswordChangeAt DateTime?
```

## Motivo

Esses campos são necessários para:

- Foto de perfil
- Bloqueio ou activação de conta
- Confirmação de email
- Segurança em alteração de senha

---

# 12. Backend: módulos recomendados

A API deve ser organizada em módulos.

## Módulos principais

```txt
auth
users
entries
anthroponyms
toponyms
foreignisms
approval
audit-logs
blog
events
media
profile
```

## Responsabilidade de cada módulo

### auth

- Login
- Refresh token
- Logout
- Reset password
- Change password
- Email verification

### users

- Gestão de utilizadores pelo Admin
- Alteração de roles
- Activar/desactivar utilizadores

### profile

- Actualização dos dados do próprio utilizador
- Foto de perfil
- Alteração de email
- Alteração de senha

### entries, anthroponyms, toponyms, foreignisms

- CRUD dos conteúdos linguísticos
- Regras de ownership
- Submissão para aprovação

### approval

- Aprovar conteúdo
- Rejeitar conteúdo
- Pedir correcção
- Histórico de aprovação

### audit-logs

- Registo automático de acções
- Consulta de logs por Admin
- Filtros por utilizador, acção, entidade e data

### blog

- Mini rede social de conteúdos
- Artigos, vídeos, imagens e publicações de eventos
- Gestão exclusiva pelo Admin

### events

- Criação e gestão de eventos exclusiva pelo Admin
- Filtros por próximo, em andamento e passado
- Link com Google Forms

### media

- Upload de imagens e vídeos
- Integração com storage externo
- Associação do ficheiro com entidades do sistema

---

# 13. Endpoints principais

Regra geral: todos os dados registados no sistema devem ter CRUD completo.

Isto aplica-se a:

- Users
- Entries
- Anthroponyms
- Toponyms
- Foreignisms
- BlogPosts
- Events
- MediaAssets
- Categorias auxiliares, caso existam

Cada módulo deve permitir:

```txt
CREATE
READ LIST
READ ONE
UPDATE
DELETE
```

Além do CRUD normal, todos os conteúdos linguísticos devem ter acções próprias para marcar ou desmarcar:

```txt
isVocabulary = true / false
isForeignism = true / false
```

Estas acções devem gerar audit logs obrigatórios.

---

# 13. Endpoints principais

## 13.1 Auth

```txt
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/change-password
POST /auth/verify-email
```

## 13.2 Profile

```txt
GET /profile
PATCH /profile
PATCH /profile/email
PATCH /profile/password
PATCH /profile/photo
```

## 13.3 Users

```txt
GET /users
POST /users
GET /users/:id
PATCH /users/:id
PATCH /users/:id/role
PATCH /users/:id/activate
PATCH /users/:id/deactivate
DELETE /users/:id
```

## 13.4 Conteúdos linguísticos

Todos os conteúdos linguísticos devem ter CRUD completo e acções de aprovação.

Para `entries`:

```txt
GET /entries
POST /entries
GET /entries/:id
PATCH /entries/:id
DELETE /entries/:id
POST /entries/:id/submit
POST /entries/:id/approve
POST /entries/:id/reject
POST /entries/:id/request-correction
POST /entries/:id/mark-as-vocabulary
POST /entries/:id/unmark-as-vocabulary
POST /entries/:id/mark-as-foreignism
POST /entries/:id/unmark-as-foreignism
```

Repetir a mesma lógica para:

```txt
/anthroponyms
/toponyms
/foreignisms
```

Ou seja, cada um deve ter:

```txt
GET /resource
POST /resource
GET /resource/:id
PATCH /resource/:id
DELETE /resource/:id
POST /resource/:id/submit
POST /resource/:id/approve
POST /resource/:id/reject
POST /resource/:id/request-correction
POST /resource/:id/mark-as-vocabulary
POST /resource/:id/unmark-as-vocabulary
POST /resource/:id/mark-as-foreignism
POST /resource/:id/unmark-as-foreignism
```

## Regras das acções `isVocabulary` e `isForeignism`

### Marcar como vocabulário

```ts
isVocabulary = true
```

### Desmarcar como vocabulário

```ts
isVocabulary = false
```

### Marcar como estrangeirismo

```ts
isForeignism = true
```

### Desmarcar como estrangeirismo

```ts
isForeignism = false
```

## Permissões para essas acções

### Admin

Pode marcar e desmarcar qualquer conteúdo.

### Supervisor

Pode marcar e desmarcar conteúdos linguísticos que estejam sob sua gestão ou em revisão.

### Operator

Pode marcar e desmarcar apenas conteúdos criados por si, desde que ainda não estejam aprovados.

## Audit logs obrigatórios

Cada alteração deve criar audit log com acções como:

```txt
MARKED_AS_VOCABULARY
UNMARKED_AS_VOCABULARY
MARKED_AS_FOREIGNISM
UNMARKED_AS_FOREIGNISM
```

O log deve guardar:

```txt
oldValues
newValues
actorId
actorRole
entity
entityId
createdAt
```

## 13.5 Blog

A gestão do blog é exclusiva do Admin.

```txt
GET /blog-posts
POST /blog-posts
GET /blog-posts/:id
PATCH /blog-posts/:id
DELETE /blog-posts/:id
POST /blog-posts/:id/publish
POST /blog-posts/:id/archive
```

Permissão para escrita:

```txt
ADMIN only
```

Nota: a leitura pública dos posts pode existir no site público, mas criação, edição, publicação, arquivamento e eliminação são apenas do Admin.

## 13.6 Eventos

A gestão de eventos é exclusiva do Admin.

```txt
GET /events
GET /events?period=upcoming
GET /events?period=ongoing
GET /events?period=past
POST /events
GET /events/:id
PATCH /events/:id
DELETE /events/:id
POST /events/:id/publish
POST /events/:id/cancel
```

Permissão para escrita:

```txt
ADMIN only
```

Nota: a leitura pública dos eventos pode existir no site público, mas criação, edição, publicação, cancelamento e eliminação são apenas do Admin.

## 13.7 Audit logs

```txt
GET /audit-logs
GET /audit-logs?actorId=...
GET /audit-logs?action=...
GET /audit-logs?entity=...
GET /audit-logs?from=...&to=...
```

## 13.8 Estatísticas e dashboards

O sistema deve ter endpoints próprios de estatísticas para alimentar dashboards bonitas por tipo de utilizador.

A estatística não deve ser feita no frontend. O backend deve devolver os números já calculados.

### Endpoints principais

```txt
GET /stats/dashboard
GET /stats/dashboard/me
GET /stats/dashboard/users/:userId
GET /stats/content
GET /stats/users
GET /stats/events
GET /stats/blog
GET /stats/audit-logs
```

---

## 13.8.1 Dashboard global

Endpoint:

```txt
GET /stats/dashboard
```

Uso principal:

- Dashboard do Admin.
- Visão geral do sistema.

Filtros:

```txt
role
startDate
endDate
createdById
approvalStatus
isVocabulary
isForeignism
```

Exemplo:

```txt
GET /stats/dashboard?role=SUPERVISOR&startDate=2026-01-01&endDate=2026-12-31
```

Resposta recomendada:

```ts
{
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    supervisors: number;
    operators: number;
  };
  content: {
    total: number;
    entries: number;
    anthroponyms: number;
    toponyms: number;
    foreignisms: number;
    vocabulary: number;
    foreignismMarked: number;
    pendingApproval: number;
    approved: number;
    rejected: number;
    needsCorrection: number;
  };
  blog: {
    totalPosts: number;
    published: number;
    drafts: number;
    archived: number;
    featured: number;
  };
  events: {
    total: number;
    upcoming: number;
    ongoing: number;
    past: number;
    cancelled: number;
    totalRegistrations: number;
  };
  auditLogs: {
    total: number;
    successfulActions: number;
    failedActions: number;
  };
}
```

---

## 13.8.2 Dashboard do utilizador autenticado

Endpoint:

```txt
GET /stats/dashboard/me
```

Uso principal:

- Dashboard individual de qualquer utilizador autenticado.
- O resultado muda conforme o perfil do utilizador.

### Para Admin

Deve devolver visão global do sistema.

### Para Supervisor

Deve devolver:

```ts
{
  myContent: {
    totalCreated: number;
    approved: number;
    pendingApproval: number;
    rejected: number;
    needsCorrection: number;
  };
  reviewQueue: {
    pendingApproval: number;
    corrected: number;
    approvedByMe: number;
    rejectedByMe: number;
  };
  blog: {
    myPosts: number;
    published: number;
    drafts: number;
  };
  events: {
    myEvents: number;
    upcoming: number;
    ongoing: number;
    past: number;
  };
}
```

### Para Operator

Deve devolver:

```ts
{
  myContent: {
    totalCreated: number;
    drafts: number;
    pendingApproval: number;
    approved: number;
    rejected: number;
    needsCorrection: number;
  };
  myClassifications: {
    vocabulary: number;
    foreignisms: number;
  };
  recentActivity: {
    totalActions: number;
    lastActionAt: string | null;
  };
}
```

Filtros:

```txt
startDate
endDate
```

Exemplo:

```txt
GET /stats/dashboard/me?startDate=2026-01-01&endDate=2026-12-31
```

---

## 13.8.3 Dashboard de um utilizador específico

Endpoint:

```txt
GET /stats/dashboard/users/:userId
```

Uso principal:

- Admin consultar estatísticas de qualquer utilizador.
- Supervisor consultar estatísticas de Operators sob análise, se permitido.

Filtros:

```txt
startDate
endDate
role
```

Exemplo:

```txt
GET /stats/dashboard/users/USER_ID?startDate=2026-01-01&endDate=2026-12-31
```

Resposta recomendada:

```ts
{
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "SUPERVISOR" | "OPERATOR";
    profilePhotoUrl?: string;
    isActive: boolean;
    lastLogin?: string;
  };
  content: {
    totalCreated: number;
    entries: number;
    anthroponyms: number;
    toponyms: number;
    foreignisms: number;
    vocabulary: number;
    foreignismMarked: number;
    approved: number;
    pendingApproval: number;
    rejected: number;
    needsCorrection: number;
  };
  approvals: {
    approvedByUser: number;
    rejectedByUser: number;
    correctionRequestsByUser: number;
  };
  blog: {
    postsCreated: number;
    published: number;
    drafts: number;
  };
  events: {
    eventsCreated: number;
    upcoming: number;
    ongoing: number;
    past: number;
  };
  activity: {
    auditLogs: number;
    successfulActions: number;
    failedActions: number;
    lastActionAt: string | null;
  };
}
```

---

## 13.8.4 Estatísticas de conteúdos

Endpoint:

```txt
GET /stats/content
```

Filtros:

```txt
role
createdById
approvedById
startDate
endDate
approvalStatus
isVocabulary
isForeignism
contentType
```

Valores de `contentType`:

```txt
entry
anthroponym
toponym
foreignism
```

Exemplo:

```txt
GET /stats/content?role=OPERATOR&contentType=entry&approvalStatus=APPROVED
```

Resposta recomendada:

```ts
{
  total: number;
  byType: {
    entries: number;
    anthroponyms: number;
    toponyms: number;
    foreignisms: number;
  };
  byApprovalStatus: {
    draft: number;
    pendingApproval: number;
    approved: number;
    rejected: number;
    needsCorrection: number;
    archived: number;
  };
  classifications: {
    vocabulary: number;
    foreignisms: number;
  };
}
```

---

## 13.8.5 Estatísticas de utilizadores

Endpoint:

```txt
GET /stats/users
```

Filtros:

```txt
role
isActive
startDate
endDate
lastLoginStartDate
lastLoginEndDate
```

Exemplo:

```txt
GET /stats/users?role=OPERATOR&isActive=true
```

Resposta recomendada:

```ts
{
  total: number;
  active: number;
  inactive: number;
  byRole: {
    admins: number;
    supervisors: number;
    operators: number;
  };
  verifiedEmails: number;
  unverifiedEmails: number;
}
```

---

## 13.8.6 Estatísticas de eventos

Endpoint:

```txt
GET /stats/events
```

Filtros:

```txt
role
createdById
startDate
endDate
category
status
period
location
hasGoogleForm
```

Exemplo:

```txt
GET /stats/events?period=upcoming&category=formacao
```

Resposta recomendada:

```ts
{
  total: number;
  upcoming: number;
  ongoing: number;
  past: number;
  cancelled: number;
  totalRegistrations: number;
  byCategory: Array<{
    category: string;
    total: number;
  }>;
}
```

---

## 13.8.7 Estatísticas do blog

Endpoint:

```txt
GET /stats/blog
```

Filtros:

```txt
role
authorId
startDate
endDate
type
status
category
isFeatured
```

Exemplo:

```txt
GET /stats/blog?status=PUBLISHED&type=ARTICLE
```

Resposta recomendada:

```ts
{
  total: number;
  published: number;
  drafts: number;
  archived: number;
  featured: number;
  byType: {
    articles: number;
    videos: number;
    images: number;
    eventCoverage: number;
    announcements: number;
  };
}
```

---

## 13.8.8 Estatísticas de audit logs

Endpoint:

```txt
GET /stats/audit-logs
```

Filtros:

```txt
role
actorId
action
entity
status
startDate
endDate
```

Exemplo:

```txt
GET /stats/audit-logs?role=SUPERVISOR&entity=Entry
```

Resposta recomendada:

```ts
{
  total: number;
  successfulActions: number;
  failedActions: number;
  byAction: Array<{
    action: string;
    total: number;
  }>;
  byEntity: Array<{
    entity: string;
    total: number;
  }>;
}
```

---

## 13.8.9 Permissões das estatísticas

### Admin

Pode consultar todas as estatísticas e usar filtro por `role`, `userId`, `createdById` e `approvedById`.

### Supervisor

Pode consultar:

- Estatísticas próprias.
- Estatísticas dos conteúdos sob revisão.
- Estatísticas de Operators, se a regra de negócio permitir.
- Fila de aprovação.

### Operator

Pode consultar apenas:

- As próprias estatísticas.
- Os próprios conteúdos.
- As próprias actividades.

### Regra crítica

O frontend nunca deve esconder estatísticas sensíveis apenas pela interface. O backend deve bloquear pelo role.

---

## 13.8.10 Cards recomendados para dashboard

## Admin

```txt
Total de utilizadores
Utilizadores activos
Entries cadastradas
Topónimos cadastrados
Antropónimos cadastrados
Estrangeirismos cadastrados
Conteúdos pendentes
Conteúdos aprovados
Posts publicados
Eventos próximos
Total de inscrições
Acções auditadas
```

## Supervisor

```txt
Pendentes de aprovação
Aprovados por mim
Rejeitados por mim
Pedidos de correcção
Meus cadastros
Posts publicados por mim
Eventos criados por mim
```

## Operator

```txt
Meus cadastros
Rascunhos
Pendentes
Aprovados
Rejeitados
Precisa de correcção
Marcados como vocabulário
Marcados como estrangeirismo
```

---

## 13.8.11 Dados para gráficos

Além dos totais, os endpoints de estatísticas devem permitir devolver dados para gráficos.

### Conteúdos por mês

```ts
contentByMonth: Array<{
  month: string;
  total: number;
}>
```

### Conteúdos por tipo

```ts
contentByType: Array<{
  type: string;
  total: number;
}>
```

### Conteúdos por estado

```ts
contentByApprovalStatus: Array<{
  status: string;
  total: number;
}>
```

### Eventos por categoria

```ts
eventsByCategory: Array<{
  category: string;
  total: number;
}>
```

### Actividade por dia

```ts
activityByDay: Array<{
  date: string;
  total: number;
}>
```

Esses dados são ideais para gráficos de linhas, barras, doughnut e cards de tendência.


---

# 14. Filtros, pesquisa e paginação nas listagens

Todas as listagens do sistema devem aceitar filtros consistentes. Isto evita endpoints desorganizados e facilita a criação de tabelas no frontend.

## 14.1 Filtros globais obrigatórios

Todos os endpoints de listagem devem aceitar:

```txt
page
limit
search
startDate
endDate
sortBy
sortOrder
```

## 14.2 Explicação dos filtros globais

### page

Número da página actual.

Exemplo:

```txt
?page=1
```

### limit

Quantidade de registos por página.

Exemplo:

```txt
?limit=20
```

### search

Pesquisa textual.

Deve procurar nos campos principais da entidade.

Exemplo:

```txt
?search=kimbundu
```

### startDate

Data inicial do filtro.

Por padrão, deve filtrar usando `createdAt`, salvo quando o módulo tiver data mais importante.

Exemplo:

```txt
?startDate=2026-01-01
```

### endDate

Data final do filtro.

Exemplo:

```txt
?endDate=2026-12-31
```

### sortBy

Campo usado para ordenação.

Exemplo:

```txt
?sortBy=createdAt
```

### sortOrder

Direcção da ordenação.

Valores aceites:

```txt
asc
desc
```

Exemplo:

```txt
?sortOrder=desc
```

---

## 14.3 Resposta padrão paginada

Todas as listagens devem devolver o mesmo formato:

```ts
{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

---

## 14.4 Exemplo geral de endpoint filtrado

```txt
GET /entries?page=1&limit=20&search=ngola&startDate=2026-01-01&endDate=2026-12-31&sortBy=createdAt&sortOrder=desc
```

---

## 14.5 Filtros específicos por módulo

## Users

Endpoint:

```txt
GET /users
```

Filtros:

```txt
page
limit
search
startDate
endDate
sortBy
sortOrder
role
isActive
emailVerified
lastLoginStartDate
lastLoginEndDate
```

Pesquisa deve procurar em:

```txt
name
email
```

Exemplo:

```txt
GET /users?page=1&limit=20&search=joao&role=SUPERVISOR&isActive=true
```

---

## Entries

Endpoint:

```txt
GET /entries
```

Filtros:

```txt
page
limit
search
startDate
endDate
sortBy
sortOrder
grammaticalCategory
grammaticalSubcategory
grammaticalStatus
isVocabulary
isForeignism
approvalStatus
createdById
approvedById
editionStartDate
editionEndDate
insertionStartDate
insertionEndDate
```

Pesquisa deve procurar em:

```txt
entry
pronunciation
syllabicDivision
etymology
firstDefinition
secondDefinition
thirdDefinition
abbreviation
acronym
reduction
shortForm
fullForm
usageExample
```

Exemplo:

```txt
GET /entries?page=1&limit=20&search=palavra&approvalStatus=PENDING_APPROVAL&isVocabulary=true
```

---

## Anthroponyms

Endpoint:

```txt
GET /anthroponyms
```

Filtros:

```txt
page
limit
search
startDate
endDate
sortBy
sortOrder
gender
isVocabulary
isForeignism
approvalStatus
createdById
approvedById
hasHistoricalFigure
```

Pesquisa deve procurar em:

```txt
name
etymology
meaning
surname
surnameMeaning
historicalFigure
historicalFigurePseudonym
historicalFigureDomain
```

Exemplo:

```txt
GET /anthroponyms?page=1&limit=20&gender=MALE&hasHistoricalFigure=true
```

---

## Toponyms

Endpoint:

```txt
GET /toponyms
```

Filtros:

```txt
page
limit
search
startDate
endDate
sortBy
sortOrder
province
municipality
provinceId
toponymClasses
toponymSubclasses
status
isVocabulary
isForeignism
approvalStatus
createdById
approvedById
languageCode
hasImage
hasLocationImage
hasVideo
```

Pesquisa deve procurar em:

```txt
toponym
pronunciation
meaning
province
municipality
location
gentilic
locationImage
toponymHistory
toponymProvenance
commonUsage
graphicVariation
```

Exemplo:

```txt
GET /toponyms?page=1&limit=20&province=Luanda&municipality=Talatona&isForeignism=false
```

---

## Foreignisms

Endpoint:

```txt
GET /foreignisms
```

Filtros:

```txt
page
limit
search
startDate
endDate
sortBy
sortOrder
originalLanguage
originCountry
grammaticalCategory
field
status
isVocabulary
approvalStatus
createdById
approvedById
```

Pesquisa deve procurar em:

```txt
term
pronunciation
originalLanguage
originCountry
adaptedForm
originalForm
meaning
definition
usageExample
context
field
abbreviation
reduction
shortForm
fullForm
```

Exemplo:

```txt
GET /foreignisms?page=1&limit=20&originalLanguage=English&field=technology
```

---

## BlogPosts

Endpoint:

```txt
GET /blog-posts
```

Filtros:

```txt
page
limit
search
startDate
endDate
sortBy
sortOrder
type
status
category
tag
authorId
isFeatured
publishedStartDate
publishedEndDate
```

Pesquisa deve procurar em:

```txt
title
excerpt
content
category
tags
```

Exemplo:

```txt
GET /blog-posts?page=1&limit=10&type=ARTICLE&status=PUBLISHED&category=cultura
```

---

## Events

Endpoint:

```txt
GET /events
```

Filtros:

```txt
page
limit
search
startDate
endDate
sortBy
sortOrder
period
category
status
location
createdById
hasGoogleForm
minRegistrationCount
maxRegistrationCount
```

### Filtro `period`

Valores aceites:

```txt
upcoming
ongoing
past
```

Regras:

```ts
upcoming: startDate > now
ongoing: startDate <= now && endDate >= now
past: endDate < now
```

Pesquisa deve procurar em:

```txt
title
description
category
location
```

Exemplo:

```txt
GET /events?page=1&limit=12&period=upcoming&category=formacao&location=Luanda
```

---

## AuditLogs

Endpoint:

```txt
GET /audit-logs
```

Filtros:

```txt
page
limit
search
startDate
endDate
sortBy
sortOrder
actorId
actorRole
action
entity
entityId
status
ipAddress
```

Pesquisa deve procurar em:

```txt
action
entity
entityId
failureReason
ipAddress
userAgent
```

Exemplo:

```txt
GET /audit-logs?page=1&limit=50&actorRole=SUPERVISOR&entity=Entry&action=APPROVED
```

---

## MediaAssets

Endpoint:

```txt
GET /media-assets
```

Filtros:

```txt
page
limit
search
startDate
endDate
sortBy
sortOrder
mimeType
storageProvider
uploadedById
entity
entityId
```

Pesquisa deve procurar em:

```txt
filename
url
mimeType
storageProvider
entity
entityId
```

Exemplo:

```txt
GET /media-assets?page=1&limit=30&mimeType=image/png&entity=BlogPost
```

---

## 14.6 Regras técnicas para paginação

### Valores padrão

```ts
page = 1
limit = 20
sortBy = "createdAt"
sortOrder = "desc"
```

### Limite máximo

```ts
limit <= 100
```

Não permitir `limit` infinito. Isso destrói performance.

### Cálculo de paginação

```ts
skip = (page - 1) * limit
```

```ts
totalPages = Math.ceil(total / limit)
```

---

## 14.7 Regras técnicas para datas

Quando existirem `startDate` e `endDate`, aplicar:

```ts
createdAt: {
  gte: startDate,
  lte: endDate
}
```

Se vier apenas `startDate`:

```ts
createdAt: {
  gte: startDate
}
```

Se vier apenas `endDate`:

```ts
createdAt: {
  lte: endDate
}
```

Para eventos, `startDate` e `endDate` podem filtrar a data do evento, não apenas `createdAt`, porque nesse módulo a data principal é a data do evento.

---

## 14.8 Regras técnicas para search

A pesquisa deve ser case-insensitive.

Exemplo lógico:

```ts
OR: [
  { title: { contains: search, mode: "insensitive" } },
  { description: { contains: search, mode: "insensitive" } }
]
```

Com PostgreSQL e Prisma, `mode: "insensitive"` funciona melhor para pesquisas textuais simples.

Se a pesquisa começar a ficar pesada, a solução correcta é criar índices adequados no PostgreSQL, como índices por campo pesquisável ou pesquisa textual com `tsvector`.

---

## 14.9 Filtros booleanos

Todos os filtros booleanos devem aceitar string e converter para booleano no backend.

Exemplo:

```txt
?isVocabulary=true
?isForeignism=false
?isActive=true
```

No backend:

```ts
"true" -> true
"false" -> false
```

Nunca confiar directamente na query string.

---

## 14.10 Validação dos filtros

Todos os filtros devem ser validados com DTO/schema.

Exemplo de regras:

```txt
page deve ser número positivo
limit deve ser número positivo e no máximo 100
sortOrder deve ser asc ou desc
startDate deve ser data válida
endDate deve ser data válida
role deve pertencer ao enum UserRole
approvalStatus deve pertencer ao enum ApprovalStatus
```

---

## 14.11 Resumo directo dos filtros obrigatórios

Todas as listagens devem ter pelo menos:

```txt
page
limit
search
startDate
endDate
sortBy
sortOrder
```

E cada módulo deve acrescentar filtros específicos úteis para a sua natureza.

---

# 15. Regras de autorização

## 14.1 Regra Admin

```ts
if (user.role === "ADMIN") return true;
```

## 14.2 Regra Supervisor

```ts
if (user.role === "SUPERVISOR") {
  return ["create", "update", "approve", "reject", "requestCorrection"].includes(action);
}
```

## 14.3 Regra Operator

```ts
if (user.role === "OPERATOR") {
  return resource.createdById === user.id && resource.approvalStatus !== "APPROVED";
}
```

## 14.4 Regra para apagar conteúdo

```ts
Admin: pode apagar qualquer conteúdo.
Supervisor: pode apagar conteúdos conforme regra do sistema.
Operator: só pode apagar conteúdo próprio e não aprovado.
```

---

# 16. Painéis do sistema

## 15.1 Dashboard Admin

Mostrar:

- Total de utilizadores
- Utilizadores activos
- Conteúdos cadastrados
- Conteúdos pendentes
- Conteúdos aprovados
- Últimos audit logs
- Eventos activos
- Posts publicados

## 15.2 Dashboard Supervisor

Mostrar:

- Conteúdos pendentes de aprovação
- Conteúdos rejeitados
- Conteúdos que precisam de correcção
- Últimos conteúdos cadastrados
- Eventos criados
- Posts criados

## 15.3 Dashboard Operator

Mostrar:

- Meus cadastros
- Meus conteúdos pendentes
- Meus conteúdos aprovados
- Meus conteúdos rejeitados
- Conteúdos que precisam de correcção

---

# 17. Prioridade de implementação

## Fase 1 — Base obrigatória

1. Auth completo
2. User roles
3. Gestão de perfil
4. CRUD de Users para Admin
5. Audit logs
6. Regras de autorização

## Fase 2 — Conteúdos linguísticos

1. CRUD completo de Entry
2. CRUD completo de Anthroponym
3. CRUD completo de Toponym
4. CRUD completo de Foreignism
5. Campos de abreviatura e redução
6. Fluxo de aprovação
7. Acção para marcar/desmarcar `isVocabulary`
8. Acção para marcar/desmarcar `isForeignism`
9. Audit logs para todas as acções acima

## Fase 3 — Blog e eventos

1. Blog posts com gestão exclusiva pelo Admin
2. Upload de imagens e vídeos
3. Eventos com gestão exclusiva pelo Admin
4. Filtro de eventos
5. Link com Google Forms

## Fase 4 — Melhorias

1. Estatísticas avançadas
2. Histórico visual de alterações
3. Exportação de dados
4. Integração automática com Google Sheets para inscrições
5. Sistema de notificações internas

---

# 18. Stack técnica oficial

## Stack actualizada

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js |
| Framework | NestJS |
| Linguagem | TypeScript |
| ORM | Prisma |
| Base de dados | PostgreSQL |
| Auth | JWT + Passport + Argon2 |
| Validação | class-validator |
| Upload | Multer + Cloudinary/S3 |
| Email | Resend |

---

## 18.1 Decisões técnicas por camada

## Runtime — Node.js

O backend deve correr em Node.js, preferencialmente numa versão LTS recente.

Recomendação:

```txt
Node.js 22 LTS
```

## Framework — NestJS

NestJS é adequado porque organiza bem sistemas grandes por módulos, guards, interceptors, pipes e decorators.

Estrutura recomendada:

```txt
src/
  auth/
  users/
  profile/
  entries/
  anthroponyms/
  toponyms/
  foreignisms/
  approval/
  audit-logs/
  blog/
  events/
  media/
  stats/
  mail/
  common/
  prisma/
```

## Linguagem — TypeScript

Todo o backend deve ser fortemente tipado com TypeScript.

Regra recomendada:

```txt
strict = true
```

## ORM — Prisma

O Prisma deve ser usado para:

- Models
- Migrations
- Queries
- Relações
- Paginação
- Filtros
- Agregações para estatísticas

Como a base será PostgreSQL, o schema Prisma deve usar:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Base de dados — PostgreSQL

PostgreSQL é a escolha certa para este sistema porque tem:

- Relações fortes
- Índices bons
- Filtros avançados
- Agregações melhores
- Suporte sólido para auditoria e estatísticas
- Melhor consistência para permissões, approval workflow e dashboards

Opinião directa: PostgreSQL é melhor que MongoDB para este sistema. Tens users, roles, approvals, audit logs, estatísticas, blog, eventos e ownership. Isso pede banco relacional.

## Auth — JWT + Passport + Argon2

A autenticação deve usar:

```txt
JWT para access token
Refresh token persistido no banco
Passport para strategies e guards
Argon2 para hash de senhas e tokens sensíveis
```

### Estratégias recomendadas

```txt
JwtStrategy
LocalStrategy
RefreshTokenStrategy
```

### Guards recomendados

```txt
JwtAuthGuard
RolesGuard
OwnershipGuard
```

## Validação — class-validator

Usar DTOs com `class-validator` e `class-transformer`.

Exemplo:

```ts
export class ListEntriesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;
}
```

Regra obrigatória:

```txt
Nunca aceitar query, body ou params sem DTO validado.
```

## Upload — Multer + Cloudinary/S3

Multer deve receber os ficheiros temporariamente.

Cloudinary ou S3 devem guardar os ficheiros finais.

O banco deve guardar apenas:

```txt
url
filename
mimeType
size
storageProvider
uploadedById
entity
entityId
```

Não guardar binários no PostgreSQL para este caso.

## Email — Resend

Resend deve ser usado para:

- Reset password
- Verificação de email
- Convites de utilizador
- Notificações de aprovação/rejeição
- Confirmações administrativas

Templates recomendados:

```txt
password-reset
email-verification
user-invitation
content-approved
content-rejected
content-correction-requested
event-created
```

---

## 18.2 Pacotes principais recomendados

```bash
npm install @nestjs/passport passport passport-jwt passport-local
npm install @nestjs/jwt argon2
npm install class-validator class-transformer
npm install @prisma/client
npm install multer
npm install cloudinary
npm install resend
npm install helmet compression cookie-parser
npm install @nestjs/throttler
```

Dev dependencies:

```bash
npm install -D prisma
npm install -D @types/passport-jwt @types/passport-local @types/multer @types/cookie-parser
```

---

## 18.3 Variáveis de ambiente recomendadas

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

JWT_ACCESS_SECRET="change-me"
JWT_REFRESH_SECRET="change-me"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

APP_URL="https://example.com"
API_URL="https://api.example.com"

RESEND_API_KEY="re_xxxxxxxxx"
EMAIL_FROM="Sistema <noreply@example.com>"

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

S3_ENDPOINT=""
S3_REGION=""
S3_BUCKET=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
```

---

## 18.4 Ajustes necessários no schema Prisma

Como a base agora é PostgreSQL, o schema não deve usar:

```prisma
@db.ObjectId
@default(auto())
@map("_id")
```

Isto era específico do MongoDB.

Para PostgreSQL, usar:

```prisma
id String @id @default(uuid())
```

Recomendação para este sistema:

```prisma
id String @id @default(uuid())
```

É melhor para APIs públicas, logs, uploads e integrações.

---

## 18.5 Regras de arquitectura obrigatórias

## Guards

Usar guards para bloquear acesso por perfil.

```txt
ADMIN
SUPERVISOR
OPERATOR
```

## Interceptors

Criar interceptor ou serviço central para audit logs.

Não espalhar `auditLog.create()` manualmente em todos os controllers sem padrão. Isso vira bagunça.

## Pipes

Usar `ValidationPipe` global:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

## Rate limit

Usar rate limit principalmente em:

```txt
/auth/login
/auth/forgot-password
/auth/reset-password
```

## Segurança HTTP

Usar:

```txt
helmet
cors configurado
cookie-parser se refresh token for via cookie
compression
```

---

## 18.6 Estratégia recomendada para tokens

## Access token

Curto prazo.

```txt
15 minutos
```

## Refresh token

Prazo maior.

```txt
7 dias ou 30 dias
```

## Armazenamento

O refresh token deve ser guardado no banco apenas como hash.

```txt
Nunca guardar refresh token puro no banco.
```

## Rotação

Ao usar refresh token:

1. Validar token.
2. Comparar com hash.
3. Revogar token antigo.
4. Criar novo refresh token.
5. Guardar novo hash.
6. Gerar audit log.

---

## 18.7 Estratégia recomendada para uploads

Fluxo:

1. Frontend envia ficheiro via multipart/form-data.
2. NestJS recebe com Multer.
3. Service envia para Cloudinary/S3.
4. Service cria `MediaAsset`.
5. Entidade recebe a URL final.
6. Audit log é criado.

Não misturar upload com lógica pesada de cadastro quando não for necessário.

---

## 18.8 Estratégia recomendada para emails

Criar um módulo:

```txt
mail
```

Com métodos:

```txt
sendPasswordResetEmail
sendEmailVerification
sendUserInvitation
sendContentApprovedEmail
sendContentRejectedEmail
sendCorrectionRequestedEmail
```

O Resend deve ficar isolado dentro do `MailService`.

---

# 19. Decisão técnica recomendada

## O que deve ser obrigatório desde o início

- Roles bem definidos.
- Audit logs desde o primeiro dia.
- Refresh token com rotação.
- Conteúdos com `createdById`.
- Approval status em todos os conteúdos linguísticos.
- Upload separado do cadastro.
- Google Forms apenas como link na primeira versão.

## O que não deve ser complicado na primeira versão

- Não começar com integração automática profunda com Google Forms.
- Não criar permissões ultra-granulares no início.
- Não misturar blog, eventos e conteúdos linguísticos na mesma tabela.
- Não guardar ficheiros binários directamente no MongoDB.

---

# 20. Resumo directo

A estrutura correcta é:

- `User` para autenticação e perfis.
- `RefreshToken` para sessões seguras.
- `AuditLog` para rastrear tudo.
- `Entry`, `Anthroponym`, `Toponym` e `Foreignism` com aprovação e ownership.
- `BlogPost` para conteúdo estilo rede social.
- `Event` para gestão de eventos.
- `MediaAsset` para ficheiros.

A regra de ouro do sistema deve ser:

> Nenhuma acção importante acontece sem permissão, sem ownership e sem audit log.

---

# 21. Definições detalhadas dos Modelos Linguísticos

Para garantir a implementação correcta conforme os requisitos, seguem os campos detalhados para os modelos principais.

## 21.1 Entry (Dicionário)

```prisma
model Entry {
  id String @id @default(uuid())
  entry String
  pronunciation String?
  syllabicDivision String?
  etymology String?
  firstDefinition String
  secondDefinition String?
  thirdDefinition String?
  usageExample String?
  abbreviation String?
  acronym String?
  reduction String?
  shortForm String?
  fullForm String?
  grammaticalCategory String?
  grammaticalSubcategory String?
  grammaticalStatus String?
  isVocabulary Boolean @default(false)
  isForeignism Boolean @default(false)
  
  // Campos de Aprovação (Metadata)
  createdById String?
  updatedById String?
  approvedById String?
  approvalStatus ApprovalStatus @default(DRAFT)
  approvedAt DateTime?
  submittedAt DateTime?
  rejectedAt DateTime?
  rejectionReason String?
  correctionNotes String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("entries")
}
```

## 21.2 Toponym (Topónimos)

```prisma
model Toponym {
  id String @id @default(uuid())
  toponym String
  pronunciation String?
  meaning String?
  province String
  municipality String?
  location String?
  gentilic String?
  locationImage String?
  toponymHistory String?
  toponymProvenance String?
  commonUsage String?
  graphicVariation String?
  toponymClasses String[]
  toponymSubclasses String[]
  status String?
  languageCode String?
  isVocabulary Boolean @default(false)
  isForeignism Boolean @default(false)

  // Campos de Aprovação (Metadata)
  createdById String?
  updatedById String?
  approvedById String?
  approvalStatus ApprovalStatus @default(DRAFT)
  approvedAt DateTime?
  submittedAt DateTime?
  rejectedAt DateTime?
  rejectionReason String?
  correctionNotes String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("toponyms")
}
```

---

# 22. Especificação Técnica da API (REST)

Para garantir a consistência e a facilidade de integração com o frontend, a API segue os seguintes padrões técnicos:

## 22.1 Filtros Globais e Paginação

Todos os endpoints de listagem (`GET`) aceitam obrigatoriamente (com valores padrão) os seguintes parâmetros de consulta:

| Parâmetro | Descrição | Valor Padrão |
| :--- | :--- | :--- |
| **`page`** | O número da página (inteiro >= 1). | `1` |
| **`limit`** | Quantidade de itens por página (inteiro >= 1). | `20` |
| **`orderBy`** | Campo pelo qual os resultados serão ordenados. | `createdAt` |
| **`orderDirection`** | Direção da ordenação (`asc` ou `desc`). | `desc` |

**Cálculo Interno:**
- `skip = (page - 1) * limit`
- `take = limit`

## 22.2 Endpoints Consolidados (PATCH)

Para reduzir a redundância e melhorar a semântica, operações de mudança de estado foram consolidadas:

### Fluxo de Revisão e Aprovação
`PATCH /:resource/:id/review`
- **Corpo:** `{ "status": "APPROVED", "reason": "Opcional" }`
- **Utilização:** Centraliza as ações de *submeter*, *aprovar*, *rejeitar* e *solicitar correção*.

### Classificação Linguística
`PATCH /:resource/:id/vocabulary/:action`
`PATCH /:resource/:id/foreignism/:action`
- **Ações:** `mark` ou `unmark`.
- **Utilização:** Define se um termo pertence ao vocabulário ou se é um estrangeirismo.

### Gestão de Status (Blog e Eventos)
`PATCH /:resource/:id/status`
- **Corpo:** `{ "status": "PUBLISHED", "reason": "Opcional para cancelamentos" }`
- **Utilização:** Centraliza publicações, arquivamentos e cancelamentos.

## 22.3 Padrões de Pesquisa
Todos os módulos linguísticos suportam o parâmetro `search`, que realiza uma busca textual insensível a maiúsculas/minúsculas nos campos principais da entidade.
```

