# Frontend Coding Conventions

Coding standards and patterns for `ai-learning-platform-ui` (React 19 / TypeScript 5.7 / Vite 6).

## Component Conventions
- **Functional components only** — no class components
- **PascalCase** for component names and file names (`CourseCard.tsx`)
- **camelCase** for variables, functions, custom hooks
- Use `@/` absolute imports everywhere (configured in `tsconfig.json` paths and `vite.config.ts`)
- No CSS modules or styled-components — Tailwind utility classes only
- `cn()` from `@/lib/utils` for conditional class merging:
  ```tsx
  className={cn('base-class', condition && 'conditional-class', { 'dynamic': someValue })}
  ```

## TypeScript
- Strict mode: `strict: true`, `noUnusedLocals: true`, `noUncheckedIndexedAccess: true`
- `noUncheckedIndexedAccess`: array access returns `T | undefined` — always check or use `!`
- Null safety patterns:
  ```tsx
  course.tags ?? []              // arrays that may be null/undefined
  course.rating ?? 0             // numbers that may be null
  course.modules ?? []           // nested arrays on API responses
  course.topics ?? []
  course.concepts ?? []
  course.learningUnits ?? []
  ```
- Shared types in `src/types/index.ts` — reuse across API slices and components
- Avoid `any` — use `unknown` with narrowing or proper typed generics

## RTK Query Patterns
- One API slice per domain in `src/store/api/`
- **Every new API slice must be registered in `store.ts`**:
  ```ts
  // 1. Add reducer
  [myApi.reducerPath]: myApi.reducer,
  // 2. Add middleware
  .concat(myApi.middleware)
  ```
- Base URL from `VITE_API_URL` env var (or proxied `/api` via Vite in dev)
- JWT attached via `prepareHeaders` in the base query (reads `state.auth.token`)
- Use `skip` option to prevent queries from firing before required data is available:
  ```tsx
  useGetQuestionsQuery(conceptId, { skip: !conceptId })
  ```
- Cache invalidation: use `invalidatesTags` on mutations and `providesTags` on queries

## State Management
- `useAppSelector` and `useAppDispatch` from `src/store/hooks.ts` — never raw hooks
- Global auth state: `authSlice` (token, user, roles) — persisted to localStorage
- UI state: `uiSlice` (theme, activeConcept for course player)
- Server state: RTK Query (all API data)

## Naming
| Thing | Convention | Example |
|---|---|---|
| Components/pages | PascalCase | `CourseCard.tsx` |
| Hooks | `use*` prefix | `useAppSelector` |
| API slices | `*Api` suffix | `courseApi.ts` |
| Types/interfaces | PascalCase | `CourseResponse` |
| Enum values | UPPER_SNAKE_CASE | `BEGINNER`, `IN_PROGRESS` |
| Utils | camelCase | `cn()`, `formatDuration()` |

## Styling Conventions
- Tailwind CSS 3.4 — utility classes for everything
- shadcn/ui in `src/components/ui/` — Radix primitives with Tailwind
- Dark mode via `dark:` Tailwind variants
- Score badge coloring (used in quiz feedback, mastery display):
  - `≥ 0.7` → green (`text-green-500`, `bg-green-50`)
  - `≥ 0.4` → yellow (`text-yellow-500`, `bg-yellow-50`)
  - `< 0.4` → red (`text-red-500`, `bg-red-50`)
- Mastery progress color: use `getMasteryColor(level)` from `@/lib/utils`

## Key Field Mapping Gotchas (Backend ↔ Frontend)
| Correct | Wrong | Why |
|---|---|---|
| `request.query` | `request.message` | AI Tutor request field |
| `response.message` | `response.response` | AI Tutor response field |
| `estimatedDurationMinutes` | `estimatedHours` | BE DTO uses minutes |
| `createdByName` | `instructorName` | BE DTO uses `createdByName` |
| `contentType` | `type` | LearningUnit DTO renames entity field |

## Course Player Specifics (`CoursePlayerPage.tsx`)
- Active concept ID stored in Redux `uiSlice` (`setActiveConcept` action)
- `?review=conceptId` query param navigates directly to a concept's quiz (used by review queue links)
- AI Tutor panel is hidden when `activeTab === 'quiz'` (anti-cheat)
- `onComplete` after quiz: calls `handleNext()`; if no next node (`isAtEnd`), falls back to `setActiveTab('learn')`
- `QuizView` accepts `conceptId` prop to enable "Generate AI Questions" button
- `EnrollmentService.updateProgress` uses `Propagation.REQUIRES_NEW` on BE — do not expect it to roll back with the surrounding quiz submission transaction

## Deployment
```bash
vercel deploy --prod    # deploy to production
```
Prod URL: `https://ai-learning-platform-ui-pi.vercel.app`

## Dev Proxy
Vite proxies `/api` → `http://localhost:8080` in development. In production, `VITE_API_URL` is the full Railway URL.

## See also
- [components.md](components.md) — Component hierarchy and details
- [progress.md](progress.md) — Development timeline
