# Portal Público

Aplicação pública em Next.js para apresentação institucional, artigos, eventos,
dicionário, documentos, mídia e conteúdos ligados à plataforma linguística.

## Requisitos

- Node.js 20 ou superior
- pnpm

## Instalar

```bash
pnpm install
```

## Configuração

Copie o ficheiro de exemplo:

```bash
cp .env.example .env
```

Ajuste a origem dos conteúdos institucionais, se necessário:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## Desenvolvimento

```bash
pnpm dev
```

Para escolher uma porta:

```bash
pnpm dev -- -p 3002
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
