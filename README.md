# MyCellar

App de gerenciamento de adega de vinhos. Veja [PLAN.md](./PLAN.md) para o plano completo (modelo de dados, fluxos, fases de implementação).

## Stack

React + Vite + TypeScript + Tailwind v4, Supabase (Postgres + Auth + Storage), react-i18next (pt-BR/en/es), PWA.

## Setup local

```bash
npm install
cp .env.example .env   # preencher com as credenciais do seu projeto Supabase
npm run dev
```

## Supabase

```bash
npx supabase login
npx supabase link --project-ref <seu-project-ref>
npx supabase db push          # aplica supabase/migrations/0001_init.sql
npx supabase gen types typescript --linked > src/types/database.types.ts
```

A chave `ANTHROPIC_API_KEY` (usada pela Edge Function `scan-label`, Fase 6) nunca vai no `.env` do Vite — configure via:

```bash
npx supabase secrets set ANTHROPIC_API_KEY=sk-...
```

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção (`tsc -b && vite build`)
- `npm run lint` — ESLint
- `npm run preview` — serve o build localmente
