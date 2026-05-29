# API

Backend da plataforma de gestao linguistica, cultural e documental, construido
com NestJS, Prisma e PostgreSQL.

## Funcionalidades

- Gestao linguistica de entradas, antroponimos, toponimos, estrangeirismos e
  neologismos.
- Autenticacao e controlo de acesso por papeis.
- Fluxo de aprovacao de conteudos.
- Gestao de eventos e inscricoes.
- Blog, media, documentos e conteudos institucionais.
- Auditoria de operacoes.
- Integracao com storage S3 compativel, email e servicos de IA/OCR.

## Requisitos

- Node.js 20 ou superior
- npm
- Docker, opcional para PostgreSQL local

## Configuracao

Copie o ficheiro de exemplo:

```bash
cp .env.example .env
```

Actualize `DATABASE_URL`, segredos JWT e chaves de servicos externos.

## Base de dados

Subir PostgreSQL local:

```bash
docker compose up -d
```

Aplicar migracoes e dados iniciais:

```bash
npx prisma migrate dev
npx prisma db seed
```

## Instalar

```bash
npm install
```

## Desenvolvimento

```bash
npm run start:dev
```

## Build

```bash
npm run build
npm run start:prod
```

## Testes

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## Ficheiros uteis

- `prisma/schema.prisma`: esquema da base de dados.
- `prisma/migrations`: historico de migracoes.
- `prisma/seed.ts`: dados iniciais.
- `docs/`: documentacao funcional e tecnica.

## Notas

- Nunca envie `.env` para o GitHub.
- Use `.env.example` como referencia para novas instalacoes.
- Guarde credenciais reais fora do repositorio.
