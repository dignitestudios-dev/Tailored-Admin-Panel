# Copilot Instructions for Tailored Admin Panel

## Build, lint, and test commands

| Task | Command |
| --- | --- |
| Install dependencies | `npm ci` |
| Run dev server | `npm run dev` |
| Create production build | `npm run build` |
| Start production server | `npm run start` |
| Lint project | `npm run lint` |
| Lint a single file | `npx eslint app\dashboard\users\page.tsx` |
| Type-check | `npx tsc --noEmit` |

There is currently **no automated test script** in `package.json`, and no configured Jest/Vitest/Playwright/Cypress test suite in this repository.

## High-level architecture

- This is a **Next.js App Router** admin panel using React 19 + TypeScript + Tailwind v4 + shadcn/ui primitives.
- `app\layout.tsx` is the global composition point. It mounts:
  - `ProgressBar` (`components\progress-bar.tsx`) for route transition progress
  - `ConnectionStatus` (`components\connection-status.tsx`) for offline dialog and reconnect toast
  - Redux `Provider` via `components\providers.tsx`
  - `SidebarConfigProvider` via `contexts\sidebar-context.tsx`
- Route-level shells:
  - `app\auth\layout.tsx` wraps auth pages in `PublicRoute` (redirects authenticated users to `/dashboard`)
  - `app\dashboard\layout.tsx` wraps dashboard pages in `ProtectedRoute` (redirects unauthenticated users to `/auth/login`) and composes sidebar/header/content layout
- Auth state is currently client-side and Redux-based:
  - Store in `lib\store.ts`
  - Slice in `lib\slices\authSlice.ts` (dummy user + `isAuthenticated` flag)
  - `dispatch(login())` and `dispatch(logout())` drive route guards and sidebar user info
- API layer exists but is not wired into the login form flow:
  - `lib\api\axios.ts` defines shared `API` client, request/response interceptors, and `authToken` localStorage handling
  - `lib\api\auth.api.ts` contains auth endpoints
  - `app\auth\login\page.tsx` currently dispatches Redux login directly (no API call)
- Users page is currently local-data driven:
  - `app\dashboard\users\data.json` seeds initial state
  - `app\dashboard\users\page.tsx` manages users in component state
  - Table filters/pagination in `app\dashboard\users\components\data-table.tsx` are UI-level (no backend query yet)

## Key conventions for this codebase

- Use the `@/` alias (configured in `tsconfig.json`) for internal imports.
- Most route components are explicitly client components (`"use client"`). Keep this when using hooks, router APIs, Redux, or browser APIs like `localStorage`.
- Sidebar behavior is split into two layers:
  - **App-level config** (`contexts\sidebar-context.tsx`) for variant/collapsible/side settings
  - **UI runtime state** (`components\ui\sidebar.tsx`) for expanded/collapsed state, responsive behavior, and persistence cookie (`sidebar_state`)
- Keyboard shortcuts are already built in:
  - `Ctrl/Cmd + B` toggles sidebar (`components\ui\sidebar.tsx`)
  - `Ctrl/Cmd + K` toggles header quick-search state (`components\site-header.tsx`)
- Navigation structure is centrally defined in `components\app-sidebar.tsx` (`data.navGroups`). Add new dashboard links there.
- Theme tokens and design system variables live in `app\globals.css`; use existing CSS variables and `cn()` (`lib\utils.ts`) instead of ad-hoc class merging patterns.
- `README.md` references shadcn chart usage; existing chart pages/components use `recharts` and shadcn card/table wrappers as the established pattern.
- A themed Sonner wrapper exists in `components\ui\sonner.tsx`. If adding toast-heavy flows, mount `<Toaster />` in a root layout.
