# MED Project

Monorepo da plataforma de gestão linguística, cultural e documental. O projecto está dividido em três aplicações:

- `api`: backend NestJS com Prisma, PostgreSQL, autenticação, RBAC, auditoria, gestão de conteúdos, eventos, media e módulos linguísticos.
- `back-office`: painel administrativo Next.js para operadores, supervisores e administradores.
- `public-platform`: portal público Next.js com conteúdos institucionais, artigos, eventos, dicionário e áreas públicas.

## Stack

- Node.js 20 ou superior
- NestJS
- Prisma
- PostgreSQL
- Next.js
- React
- TypeScript
- pnpm

## Requisitos

- Node.js 20 ou superior
- pnpm 9
- Docker, para subir o PostgreSQL localmente

## Configuração inicial

### 1. Configurar as variáveis de ambiente

Copie os ficheiros de exemplo:

```bash
cp api/.env.example api/.env
cp back-office/.env.example back-office/.env
cp public-platform/.env.example public-platform/.env
```

Os valores de `api/.env.example` permitem executar o projecto localmente com PostgreSQL e sem os serviços opcionais de R2, Resend e IA. Os respectivos módulos só precisam das credenciais quando essas funcionalidades forem utilizadas.

### 2. Subir PostgreSQL

```bash
cd api
docker compose up -d
```

O PostgreSQL ficará disponível em `localhost:5439`.

### 3. Instalar dependências

```bash
cd api
pnpm install

cd ../back-office
pnpm install

cd ../public-platform
pnpm install
```

### 4. Preparar a base de dados

```bash
cd api
pnpm prisma migrate dev
pnpm prisma db seed
```

Para preparar directamente uma base completa de demonstração:

```bash
pnpm db:setup:demo
```

Para repovoar completamente os dados de demonstração:

```bash
pnpm db:seed:demo
```

### Credenciais de demonstração

| Perfil | Email | Password |
|---|---|---|
| Admin | admin@linguistic.com | admin123 |
| Supervisor | supervisor@linguistic.com | demo123 |
| Operador | operator@linguistic.com | operator123 |
| Operador 2 | operator2@linguistic.com | demo123 |

## Desenvolvimento

Execute cada aplicação num terminal separado.

### API

```bash
cd api
pnpm start:dev
```

API: `http://localhost:4000`

Documentação Swagger: `http://localhost:4000/api/docs`

Documentação Scalar: `http://localhost:4000/api/reference`

### Back-office

```bash
cd back-office
pnpm dev
```

Back-office: `http://localhost:3000`

### Portal público

```bash
cd public-platform
pnpm dev -- -p 3002
```

Portal público: `http://localhost:3002`

## Verificação local

Antes de considerar o projecto pronto:

### API

```bash
cd api
pnpm lint
pnpm typecheck
pnpm prisma:validate
pnpm test -- --runInBand
pnpm build
```

### Back-office

```bash
cd back-office
pnpm lint
pnpm typecheck
pnpm build
```

### Portal público

```bash
cd public-platform
pnpm lint
pnpm typecheck
pnpm build
```

## Scripts principais

API:

```bash
pnpm start:dev
pnpm build
pnpm test
pnpm test:e2e
pnpm lint
pnpm typecheck
pnpm prisma:validate
pnpm db:setup:demo
```

Back-office:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
```

Portal público:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
```

## Antes de enviar para o GitHub

- Não versionar `.env`, `.next`, `dist`, `node_modules`, logs ou ficheiros de cache.
- Confirmar que os ficheiros `.env.example` contêm apenas valores de exemplo.
- Remover repositórios Git internos de `api`, `back-office` e `public-platform` caso queira publicar tudo como um único repositório.
- Definir a licença do projecto, se aplicável.

## Documentação adicional

- [API](./api/README.md)
- [Back-office](./back-office/README.md)
- [Portal público](./public-platform/README.md)
