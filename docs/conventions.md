# Frontend Coding Conventions

Coding standards and patterns for the AI Learning Platform frontend (React 19 / TypeScript 5.7 / Vite 6).

## Project Structure
```
src/
├── components/       # Reusable components
│   └── ui/          # shadcn/ui primitives (Button, Card, Input, etc.)
├── pages/           # Route page components
├── store/           # Redux store
│   ├── api/         # RTK Query API slices (one per domain)
│   ├── authSlice.ts # Auth state (persisted to localStorage)
│   └── store.ts     # Store config (reducer + middleware registration)
├── types/           # Shared TypeScript types/interfaces
├── lib/             # Utility functions (cn(), etc.)
└── App.tsx          # Routing + auth restoration
```

## Component Conventions
- **Functional components only** — no class components
- **PascalCase** for component names and files (e.g., `CourseCard.tsx`)
- **camelCase** for variables, functions, hooks
- Use `@/` absolute imports (configured in tsconfig `paths`)
- Tailwind CSS for all styling — no CSS modules or styled-components
- `cn()` utility (from `@/lib/utils`) for conditional class merging

## RTK Query Patterns
- One API slice per domain in `src/store/api/` (e.g., `courseApi.ts`, `assessmentApi.ts`)
- **Critical**: Every new API slice must be registered in `store.ts`:
  1. Add `[api.reducerPath]: api.reducer` to reducers
  2. Add `api.middleware` to middleware chain via `.concat()`
- Use `prepareHeaders` to attach JWT: reads token from `state.auth.token`
- Base URL from `VITE_API_URL` env var

## Auth & State
- Auth state in Redux (`authSlice.ts`), persisted to `localStorage`
- On app load, `App.tsx` restores auth from `localStorage`
- `ProtectedRoute` component wraps role-gated routes
- JWT attached via RTK Query `prepareHeaders` (not axios interceptors)

## TypeScript
- Strict mode enabled
- Null safety: use `?? []` for array defaults, `?? 0` for numeric defaults, `?? ''` for strings
- Define shared types in `src/types/` — reuse across API slices and components
- Avoid `any` — use proper types or `unknown` with narrowing

## Styling
- **Tailwind CSS 3.4** — utility-first, no custom CSS files
- **shadcn/ui** for UI primitives — installed in `src/components/ui/`
- `cn()` from `@/lib/utils` for conditional classes: `cn('base-class', condition && 'conditional-class')`
- Dark mode not currently implemented

## Naming
- **Components/files**: PascalCase (`CourseCard.tsx`)
- **Hooks**: `use*` prefix (`useAppSelector`)
- **API slices**: `*Api` suffix (`courseApi`)
- **Types/interfaces**: PascalCase (`CourseResponse`, `LoginRequest`)
- **Enums**: UPPER_SNAKE_CASE values

## Key Field Mapping Gotchas (Backend ↔ Frontend)
| What | Correct | Wrong |
|------|---------|-------|
| AI tutor request field | `query` | `message` |
| AI tutor response field | `message` | `response` |
| Course duration | `estimatedDurationMinutes` | `estimatedHours` |
| Course author | `createdByName` | `instructorName` |
| Learning unit type | `contentType` | `type` |

## Environment
- `VITE_API_URL`: Backend base URL (no trailing slash)
  - Dev: `http://localhost:8080`
  - Prod: `https://ai-learning-platform-be-production.up.railway.app`

## Deployment
- Vercel: `npx vercel --prod` from repo root
- Prod URL: `https://ai-learning-platform-ui-pi.vercel.app`

## See also
- [components.md](components.md) — Component hierarchy and details
- [progress.md](progress.md) — Development timeline