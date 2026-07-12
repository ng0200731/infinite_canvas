# AGENTS.md - build rules for the Infinite Canvas AI Agent

Guidance for any AI or human working in this repo. Follow these exactly.

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript strict** (no `any`)
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives) for styling
- **`@xyflow/react` v12** for the canvas
- **Zustand** for client canvas/UI state and **TanStack Query v5** for server state
- **Supabase** (`@supabase/ssr` server + `@supabase/supabase-js` browser) for auth, Postgres, and Storage
- **Xiangsu AI** server-only REST client for image generation
- **Zod** for validation at every boundary and **Vitest** for pure-logic tests
- Package manager: **pnpm**

## Non-Negotiable Rules

1. **TypeScript only, `strict`, no `any`.** If a type is genuinely unknown, use `unknown` and narrow it.
2. **Validate at every boundary** with Zod: env vars (`lib/env.ts`), API request bodies, and external API responses.
3. **Tailwind only.** No inline CSS and no CSS modules except `app/globals.css` for theme tokens. Use shadcn/ui primitives; compose, do not fork them.
4. **Reusable components, no duplication.** If code or UI is about to be written twice, extract it.
5. **Keep secrets server-side.** API keys (`XIANGSU_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) live only in Route Handlers, Server Components, or Server Actions. Never expose them in client code and never prefix them with `NEXT_PUBLIC_`.
6. **Separate business logic from UI.** Pure logic for serialization, validation, and store adapters lives in `lib/`, fully typed and unit-testable. Components stay presentational with thin hooks.
7. **Typed interfaces everywhere.** Define explicit interfaces/types for props, store shapes, and node data.
8. **Always render states:** loading, empty, and error. Use optimistic updates for mutations where appropriate.
9. **Accessibility:** rely on Radix primitives; keep keyboard operability and focus management intact.

## Project Layout

```text
app/            # App Router routes (route groups: (auth), (app))
  api/          # server-only route handlers (e.g. generate)
components/
  ui/           # shadcn primitives
  canvas/       # React Flow editor + nodes + palette
  projects/     # dashboard / project UI
lib/
  supabase/     # clients + middleware helpers
  store/        # CanvasStore interface + Supabase/Local impls + selector
  nodes/        # node registry, serialization, validation
  zustand/      # client state
  hooks/        # React Query hooks
  env.ts utils.ts
supabase/migrations/   # SQL schema (RLS)
docs/           # PRD, setup, API references
middleware.ts   # auth session refresh + route protection
```

## Conventions

- Import alias: `@/*` points to the repo root.
- Server vs client: mark interactive components with `"use client"`. Keep data fetching in Server Components where possible; use Server Actions or Route Handlers for mutations.
- Node system: every node type is defined once in the registry (`lib/nodes/`) with `{ type, label, defaultData, Component, inputs, outputs, serialize, validate }`.
- Persistence: never import a concrete store implementation directly outside `lib/store/index.ts`. Depend on the `CanvasStore` interface so Supabase/Local can swap by env.

## Commands

```bash
pnpm dev      # start dev server (works with zero env keys in local/demo mode)
pnpm build    # production build
pnpm lint     # eslint
pnpm format   # prettier --write .
pnpm test     # vitest
```

## Out Of Scope For The MVP

History/versioning, sharing and permissions, agent/loop/condition nodes, graph-pipeline execution, and deployment. Do not add these unless explicitly asked.
