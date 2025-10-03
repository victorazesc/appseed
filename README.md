# Sales Funnel MVP

Funil de vendas completo construído com Next.js 14 (App Router), Prisma e Postgres. O MVP inclui captura pública de leads, Kanban drag-and-drop por etapas, timeline de atividades, métricas básicas e integração opcional com Auth.js (Google OAuth) e Resend para envio de e-mails.

## 📦 Stack

- Next.js 14 + TypeScript
- Tailwind CSS + componentes estilo shadcn/ui
- TanStack Query para data fetching e cache
- Prisma ORM + PostgreSQL (Neon/Supabase)
- Auth.js (NextAuth v5) com Google OAuth (opcional)
- Resend (stub automático quando não configurado)

## 🚀 Funcionalidades

- **Dashboard (/)**: Kanban com drag & drop entre etapas, filtros por responsável, busca por nome/email e modal para criar leads.
- **Lead detail (/leads/[id])**: edição inline de dados, timeline de atividades, criação de tarefas/notes/emails e marcação de tarefas concluídas.
- **Métricas (/metrics)**: visão geral de leads por etapa, taxa de conversão até "Fechamento" e tempo médio no funil, com filtro de período e gráfico.
- **Landing pública (/landing)**: formulário de captura que cria leads diretamente na etapa "Lead Novo".
- **Cron (/api/cron/due)**: endpoint para lembrar tarefas vencidas enviando e-mail (ou log/console quando Resend não está configurado).
- **Auth toggle**: defina `AUTH_DISABLED=true` para pular login em ambientes de demo.

## 🔧 Pré-requisitos

- Node.js 18+
- Banco Postgres disponível (Neon recomendado)

## ⚙️ Configuração

1. Copie o arquivo `.env` de exemplo:

   ```bash
   cp .env .env.local
   ```

2. Preencha as variáveis:

   ```env
   DATABASE_URL=postgres://user:password@host/db?sslmode=require
   AUTH_GOOGLE_ID=
   AUTH_GOOGLE_SECRET=
   AUTH_SECRET="gera_um_random"
   AUTH_DISABLED="false"
   RESEND_API_KEY=
   RESEND_FROM_EMAIL="AppSeed CRM <no-reply@appseed.dev>"
   ```

   - Use `AUTH_DISABLED="true"` para liberar o app sem OAuth.
   - `AUTH_SECRET` pode ser gerado com `openssl rand -base64 32`.
   - Sem `RESEND_API_KEY`, o app faz log com prefixo `[resend:stub]` e retorna sucesso simulado.

3. Instale dependências:

   ```bash
   npm install
   ```

## 🗃️ Banco de dados

Execute as migrações e popular os seeds com pipeline, etapas, leads e atividades de exemplo:

```bash
npm run db:migrate
npm run db:seed
```

Scripts úteis:

- `npm run db:push` – sincroniza schema sem gerar migração.
- `npm run db:migrate` – aplica migrações em produção.
- `npm run db:seed` – roda `prisma/seed.ts` (idempotente para ambiente de desenvolvimento/reset).

## 🧪 Qualidade

- `npm run lint`
- `npm run typecheck`
- `npm run verify` (lint + typecheck)

## 🖥️ Desenvolvimento local

```bash
npm run dev
```

A aplicação estará em `http://localhost:3000`.

## ⏰ Cron de tarefas

Configure um job (ex.: Vercel Cron) para chamar `POST /api/cron/due` com a frequência desejada (ex.: a cada 15 minutos). O endpoint busca atividades `task` com `dueAt <= now()` e envia email via Resend ou loga o lembrete.

## 🔐 Autenticação

- Com Google OAuth habilitado (`AUTH_DISABLED=false` + credenciais preenchidas), o app exige login em `/signin`.
- Com `AUTH_DISABLED=true` ou sem credenciais configuradas, o app assume um usuário demo e libera o acesso automaticamente.

## 📤 Deploy

- **Frontend:** Vercel (Next.js App Router).
- **Banco:** Neon (ou qualquer Postgres compatível).
- Defina as variáveis de ambiente em produção conforme seção de configuração.
- Configure uma rota cron em Vercel para `/api/cron/due`.

## 📨 Emails

- Atividades do tipo "email" disparam Resend quando `RESEND_API_KEY` + `RESEND_FROM_EMAIL` estão configurados.
- Sem essas variáveis, o app apenas loga com `[resend:stub]` e considera o envio como sucesso.

## ✅ Aceite rápido

- Leads criados na landing aparecem no Kanban na etapa "Lead Novo".
- Drag & drop move o lead e persiste no banco.
- Timeline exibe atividades; tarefas podem ser concluídas gerando uma nota.
- Métricas refletem os dados do período selecionado.
- Com `AUTH_DISABLED=true` o login é pulado; com Resend ausente o envio é simulado.
