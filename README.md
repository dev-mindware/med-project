# MED Project

Monorepo da plataforma de gestao linguistica, cultural e documental. O projecto
esta dividido em tres aplicacoes:

- `api`: backend NestJS com Prisma, PostgreSQL, autenticacao, RBAC, auditoria,
  gestao de conteudos, eventos, media e modulos linguisticos.
- `back-office`: painel administrativo Next.js para operadores, supervisores e
  administradores.
- `public-platform`: portal publico Next.js com conteudos institucionais,
  artigos, eventos, dicionario e areas publicas.

## Stack

- Node.js
- NestJS
- Prisma
- PostgreSQL
- Next.js
- React
- TypeScript
- pnpm nos frontends
- npm na API

## Estrutura

```text
med-project/
  api/              Backend NestJS + Prisma
  back-office/      Painel administrativo Next.js
  public-platform/  Portal publico Next.js
```

## Requisitos

- Node.js 20 ou superior
- npm
- pnpm
- Docker, opcional para subir o PostgreSQL local

## Configuracao inicial

1. Copie os ficheiros de exemplo de ambiente:

```bash
cp api/.env.example api/.env
cp back-office/.env.example back-office/.env
cp public-platform/.env.example public-platform/.env
```

2. Ajuste as variaveis em `api/.env`, `back-office/.env` e `public-platform/.env`.

3. Suba a base de dados local, se for usar Docker:

```bash
cd api
docker compose up -d
```

4. Instale as dependencias:

```bash
cd api
npm install

cd ../back-office
pnpm install

cd ../public-platform
pnpm install
```

5. Prepare a base de dados:

```bash
cd api
npx prisma migrate dev
npx prisma db seed
```

## Desenvolvimento

Em terminais separados:

```bash
cd api
npm run start:dev
```

```bash
cd back-office
pnpm dev
```

```bash
cd public-platform
pnpm dev
```

Se executar mais de uma aplicacao Next.js ao mesmo tempo, use portas diferentes:

```bash
pnpm dev -- -p 3001
pnpm dev -- -p 3002
```

## Scripts principais

API:

```bash
npm run start:dev
npm run build
npm run test
npm run test:e2e
```

Back-office:

```bash
pnpm dev
pnpm build
pnpm lint
```

Portal publico:

```bash
pnpm dev
pnpm build
pnpm lint
```

## Antes de enviar para o GitHub

- Nao versionar `.env`, `.next`, `dist`, `node_modules`, logs ou ficheiros de
  cache.
- Confirmar que os ficheiros `.env.example` contem apenas valores de exemplo.
- Remover repositorios Git internos de `api`, `back-office` e
  `public-platform` caso queira publicar tudo como um unico repositorio.
- Definir a licenca do projecto, se aplicavel.

## Documentacao adicional

- [API](./api/README.md)
- [Back-office](./back-office/README.md)
- [Portal publico](./public-platform/README.md)
