# Multi-Funnel Architecture Overview

## Goals
- Allow multiple pipelines (ex.: Vendas, Pós-vendas) with independent stages and colors.
- Provide smooth switching across funnels without losing filters or creating layout shifts.
- Support lead CRUD, drag & drop, and rich side panel interactions with tasks/timeline.
- Extend metrics and settings to be pipeline-aware.

## Data Model Changes

| Entity   | Changes |
|----------|---------|
| `Pipeline` | Add `color` (`String`), optional `archived` flag (`Boolean @default(false)`). Keep `createdAt`. |
| `Stage` | Already related via `pipelineId`. Ensure we store `position` per pipeline. |
| `Lead` | No schema change, but we now rely on `pipelineId` more heavily. |
| `Activity` | No change. |

### Prisma
```prisma
model Pipeline {
  id        String   @id @default(cuid())
  name      String
  color     String   @default("#16A34A") // hex string stored in DB
  archived  Boolean  @default(false)
  stages    Stage[]
  leads     Lead[]
  createdAt DateTime @default(now())
}
```

Add index:
```prisma
@@unique([name])
@@index([archived])
```

### Seed/Fixtures
- Update seed to create two default pipelines (Vendas, Pós-vendas) with sample stages/colors.

## API Surface

### Pipelines (`/api/pipelines`)
- `GET /api/pipelines` → list all active pipelines with stages count, color, createdAt.
- `POST /api/pipelines` → create pipeline with name, color, stages[]. Returns pipeline with stages.
- `PATCH /api/pipelines/{id}` → update name/color, reorder/add/remove stages.
- `DELETE /api/pipelines/{id}` → soft delete (set `archived = true`) unless cascade needed.
- `POST /api/pipelines/{id}/duplicate` → clone pipeline and its stages (not leads).

### Stages (`/api/stages`)
- Extend existing routes to accept `pipelineId` query param for filtering.
- Add sorting endpoint? (Optional) `POST /api/stages/reorder` with pipelineId, stageOrder[] updated in transaction.

### Leads (`/api/leads`)
- Accept `pipelineId` and `stageId` filters. Already partially supported; ensure `resolvePipeline` uses `pipelineId` query or default active pipeline.
- Drag & drop: `PATCH /api/leads/{id}` already exists; keep stage update and ensure `pipelineId` passed when moving across pipelines.
- `GET /api/leads` should include pipeline data when `pipelineId` is provided.

### Metrics (`/api/metrics/overview`)
- Accept `pipelineId` and date range (`from`, `to`). Returns:
  ```ts
  type MetricsOverview = {
    leadsPerStage: Array<{ stageId: string; stageName: string; count: number; valueCents: number }>;
    conversionRatePct: number;
    avgTimeDays: number;
    totalValueByStage: Array<{ stageId: string; valueCents: number }>;
  }
  ```

### Settings/CRUD
- Use same pipeline endpoints. For inline edits, `PATCH` with partial updates.

## Client State Management

- Continue using TanStack Query for server state.
- Add lightweight Zustand store (or context) for UI state: `activePipelineId`, `globalSearch`, `kanbanViewOptions`. Example store in `src/stores/pipelines-store.ts`.
- Persist `activePipelineId` to `localStorage` under key `appseed:pipeline` and sync with URL param `?pipelineId=` on dashboards.
- Provide `useActivePipeline` hook returning { pipeline, isLoading, setActive }.

## Routing Overview

```
src/app/(authenticated)
  dashboard/page.tsx      // Kanban board
  metrics/page.tsx        // Metrics overview
  settings/page.tsx       // Tabs: Pipelines (active), Users (coming soon), Preferences (placeholder)
```

Add nested `@modal` route if needed for `LeadDrawer` (optional). For now we use client component with sheet.

## Component Architecture

### Shared
- `PipelineProvider` (client) brings together store + React Query pipeline data.
- `PipelineSwitcher` (dropdown) uses `useActivePipeline`, lists pipelines with badge color and quick actions (edit/duplicate/delete).
- `NewPipelineDialog` with controlled form (React Hook Form + Zod). Fields: name, color, stages (dynamic list). On submit, call `POST /api/pipelines` and set active pipeline.

### Dashboard
- `KanbanBoard`
  - Accepts `pipelineId` & `stages` with aggregated totals.
  - Uses `@hello-pangea/dnd` for drag & drop. Provide skeleton placeholders when switching pipeline (`isFetching` state from React Query).
  - Column header shows `stage.name`, `leads.length`, `totalValue`.
- `LeadCard`
  - Already exists; extend to show pipeline color badge, due badges.
- `LeadEmptyState`
  - CTA button triggers `NewLeadDialog` (existing) with stage preselected.

### Lead Drawer (Side Panel)
- Convert existing `LeadDetailClient` into `LeadDrawer` (Radix `Sheet` or custom). Hold timeline, tasks (existing ActivityDialog) and new quick task form.
- Provide stage select inside drawer to move lead. Use `useMutation` to PATCH stage/pipeline.

### Metrics
- `MetricsHeader` with pipeline filter (shared store) + date range (react-day-picker or native input). On change, refetch metrics.
- `MetricsKpis` cards showing counts, totals, conversion, average time. Use pipeline color accent.
- `MetricsChart` simple Recharts (existing) but feed new dataset.
- Empty state when API returns zero data.

### Settings > Pipelines
- Layout with Tabs (Pipelines, Users, Preferences). Only first tab active, others disabled.
- List view shows pipeline name, color swatch, stage count, created date, action menu.
- Actions:
  - `Editar` → open `NewPipelineDialog` prefilled (we can reuse same component with prop `pipelineId`).
  - `Duplicar` → confirm + call duplicate endpoint.
  - `Excluir` → confirm + call delete (soft archive).
- Provide table skeleton while loading.

## UX & Persistence

- Load active pipeline from
  1. `URLSearchParams` (`?pipelineId=`)
  2. `localStorage`
  3. First pipeline from API (fallback)

- When switching pipeline:
  - Keep search text and owner filter; re-run query with new `pipelineId`.
  - Show `KanbanSkeleton` while data fetching; no layout shift.

- Drag & drop: optimistic update via React Query `setQueryData` by pipeline key.

## Localization Keys

Add under `crm` namespace (for `pipeline`, `settings`, etc.). Example keys:
```
crm.pipelineSwitcher.title
crm.pipelineSwitcher.create
crm.pipelineSwitcher.edit
crm.pipelineSwitcher.duplicate
crm.pipelineSwitcher.delete
crm.pipelineSwitcher.empty
crm.settings.tabs.pipelines
crm.settings.tabs.users
crm.settings.tabs.preferences
crm.pipelineModal.title
crm.pipelineModal.nameLabel
crm.pipelineModal.colorLabel
crm.pipelineModal.stagesLabel
crm.pipelineModal.addStage
crm.pipelineModal.stagePlaceholder
crm.pipelineModal.create
crm.pipelineModal.save
crm.pipelineModal.cancel
crm.pipelineModal.nameRequired
crm.pipelineModal.stageNameRequired
crm.pipelineModal.deleteStageConfirm
crm.pipelineEmpty
crm.kanban.emptyLeads
crm.metrics.empty
crm.errors.generic
```

## Loading & Error States

- Use `Skeleton` components for Kanban columns, pipeline list, metrics cards.
- Display toast on errors with i18n strings.
- Buttons that trigger network actions show spinner (`isPending`).

## Responsiveness

- Mobile: `KanbanBoard` uses horizontal scroll (cards full width). Side drawer becomes full-screen sheet.
- Desktop: default 4 columns; allow horizontal scroll for >4 stages.

## Next Steps

1. Implement Prisma migration (`color`, `archived`) & update seed.
2. Create `/api/pipelines` endpoints & React Query hooks (`usePipelines`, `useActivePipeline`).
3. Build UI components (switcher, modal) and integrate into dashboard header.
4. Update Kanban, metrics, settings to use pipeline-aware data + new empty states.
5. Polish accessibility, i18n, animations.
