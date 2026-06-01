# Back-office

Painel administrativo em Next.js para gestao da plataforma linguistica,
incluindo autenticacao, dashboard, gestao de utilizadores, auditoria, eventos,
conteudos e modulos VONALP.

## Requisitos

- Node.js 20 ou superior
- pnpm
- API em execucao

## Configuracao

Copie o ficheiro de exemplo:

```bash
cp .env.example .env
```

Ajuste a URL da API:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## Instalar

```bash
pnpm install
```

## Desenvolvimento

```bash
pnpm dev
```

Para escolher uma porta:

```bash
pnpm dev -- -p 3001
```

## Build

```bash
pnpm build
pnpm start
```

## Qualidade

```bash
pnpm lint
```
