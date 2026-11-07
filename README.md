# VitePlus Full-Stack Monorepo Template (`vp-fullstack`)

A modern TypeScript full-stack monorepo template built with VitePlus (`vp`), featuring a React 19 frontend, Hono API, shared Zod contracts, Drizzle ORM + Supabase, and Tailwind CSS v4 + shadcn/ui.

> Credits & Attribution:
This template is built upon and inspired by [`sichengchen/vp-full-stack-template`](https://github.com/sichengchen/vp-full-stack-template)

## What Is Included

- **VitePlus (`vp`)**: Unified toolchain for installs, dev servers, checks, builds, tests, and scripts (`vpx`)
- **pnpm workspaces**: Pinned versions centrally managed in `pnpm-workspace.yaml` `catalog:`
- **Frontend (`apps/web`)**:
  - React 19 + Vite
  - TanStack Router for code-first routing
  - TanStack Query for server state management
  - Zustand for client state persistence
  - Tailwind CSS v4 + shadcn/ui
  - Toast notifications via `sonner`
  - Resilient Hono RPC client with automatic Bearer token injection and 401 token refresh
- **Shared UI (`packages/ui`)**:
  - Reusable components (`Button`, `Card`, `Input`, `Badge`, `Checkbox`, `Label`, `Toaster`)
  - Tailwind CSS v4 `@source` scanning across packages
  - Compatible with `shadcn` CLI (`components.json`)
- **Backend API (`apps/api`)**:
  - Hono served by `@hono/node-server` (and `@hono/vite-dev-server` in dev)
  - Modular feature architecture (`apps/api/src/modules/<entity>`)
  - Auth middleware (`requireAuth`) via `@supabase/server` with seamless non-production dev token fallback (`DEV_TOKEN_SECRET_123`)
  - Global `onError` handler for structured JSON error responses
  - Fast TypeScript dev runtime with `vpx --watch`
  - Automatic in-memory fallback for immediate zero-config local development
- **Database & Supabase (`packages/db`)**:
  - Drizzle ORM with PostgreSQL (`postgres` driver)
  - Supabase client integration (`@supabase/supabase-js`, `@supabase/server`)
- **Shared Contracts (`packages/shared`)**:
  - Shared Zod schemas, validation, and DTO types between the API and web app
- **CI/CD & Automation**:
  - GitHub Actions workflow (`.github/workflows/ci.yml`) using `voidzero-dev/setup-vp`
- **Code Generation & Template Setup**:
  - `scripts/init-template.mjs`: Rewrites `@template` across the codebase to your chosen scope
  - `scripts/add-entity.ts`: Scaffolds a complete CRUD entity (contracts, Drizzle table, Hono service & routes)

---

## First-Time Setup

After cloning this template:

```sh
# 1. Initialize the package scope and project name
vp run -w template:init -- --scope @my-app --name my-fullstack-app

# 2. Install workspace dependencies
vp install

# 3. Copy environment variables
cp .env.example .env

# 4. Start development servers
vp run dev
```

- Open the frontend at `http://localhost:5173`.
- The API runs at `http://localhost:3000`, and Vite automatically proxies `/api` requests during development.

---

## Commands

```sh
# Start both apps/web and apps/api in parallel
vp run dev

# Run static checks (Oxfmt formatting, Oxlint, and tsgolint type checks)
vp check

# Run tests across packages
vp test
vp run -r test

# Build all workspace packages and apps
vp run -r build

# Run check, test, and build in one command
vp run ready

# Add a new full-stack CRUD entity (e.g. "users", "projects")
vp run -w entity:add users

# Preview the entity generation without modifying files
vp run -w entity:add users -- --dry-run

# Drizzle database migration commands
vp run db:push
vp run db:studio
```

---

## Workspace Layout

```txt
apps/
  api/        Hono API organized by feature modules (modules/<entity>/)
  web/        React app with TanStack Router, TanStack Query, Zustand, Tailwind v4
packages/
  ui/         Shared Tailwind CSS v4 + shadcn/ui components (@template/ui)
  db/         Drizzle ORM schema modules & Supabase client helpers (@template/db)
  shared/     Zod API contracts and DTO types (@template/shared)
scripts/
  init-template.mjs   Rewrites @template to your package scope
  add-entity.ts       Scaffolds a new domain entity across the monorepo
```

---

## Adding a Domain Entity

Use `entity:add` to generate a vertical slice in seconds:

```sh
vp run -w entity:add projects
```

This creates and wires:

- `packages/shared/src/projects/projects.contracts.ts` & `index.ts`
- `packages/db/src/schema/projects.ts`
- `apps/api/src/modules/projects/projects.service.ts`
- `apps/api/src/modules/projects/projects.routes.ts`
- Barrels in `@template/shared` and `@template/db`
- Mounts `/api/projects` in `apps/api/src/app.ts`

---

## Adding shadcn/ui Components

Components reside in `packages/ui/src/components/`. You can copy or add components with the shadcn CLI:

```sh
vp dlx shadcn@latest add dialog -c packages/ui
```

Then import them in `apps/web`:

```tsx
import { Dialog, DialogContent, DialogTrigger } from "@template/ui/components/dialog";
```
