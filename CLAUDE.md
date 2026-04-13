# AI Learning Platform — Frontend

## Product Vision
Build the most advanced AI-powered learning platform that surpasses Coursera, Udemy, and DeepLearning.AI. AI-native adaptive learning — not video courses with AI bolted on.

## Core Requirements (UI Perspective)
1. **Course Catalog**: Search, filter by difficulty/category/tags. Course cards with ratings, enrollment counts.
2. **Course Detail**: Full module/topic/concept tree view. Enroll button.
3. **Course Player**: Content viewer (text, video, code) + AI tutor chat side panel. Progress tracking per concept.
4. **AI Tutor Chat**: Real-time WebSocket chat with GPT-4o. Context-aware, Socratic method.
5. **Adaptive Assessments**: Quiz UI with multiple question types (MCQ, code, matching). Real-time feedback.
6. **Gamification**: XP bar, streak counter, badge grid, leaderboard table.
7. **Dashboard**: Student progress overview, weak areas, recommended next steps.
8. **Auth**: Keycloak login/register. Role-based UI (student vs instructor vs admin).

## Project Overview
React SPA implementing all of the above.

## Tech Stack
- **React 19**, **TypeScript 5.7**, **Vite 6**
- **Tailwind CSS 3.4** + **shadcn/ui** (Radix primitives)
- **Redux Toolkit 2.5** + **RTK Query** (API layer)
- **React Router 7**, **Recharts** (charts), **Lucide** (icons)
- **react-markdown** (content rendering)

## Commands
```bash
npm install            # install dependencies
npm run dev            # dev server (localhost:5173, proxies /api → :8080)
npm run build          # tsc + vite build
npm run preview        # preview production build
npm run lint           # eslint
```

## Deployment
- **Vercel**: auto-deploys from GitHub
- URL: `https://ai-learning-platform-ui-pi.vercel.app`
- Set `VITE_API_URL` env var in Vercel to the Railway backend URL

## Project Structure
```
src/
├── components/
│   ├── ai-tutor/          # AITutorPanel — GPT-4o Socratic chat panel
│   ├── assessment/        # QuizView, QuestionCard
│   ├── course/            # CourseCard, CourseTree, ContentViewer
│   ├── gamification/      # XPBar, StreakCounter, BadgeDisplay, LeaderboardTable
│   ├── layout/            # AppLayout, Navbar (with auth state + logout)
│   └── ui/                # shadcn primitives (button, card, input, progress, scroll-area, tabs)
├── lib/
│   └── utils.ts           # cn() helper, getDifficultyColor(), formatDuration()
├── pages/
│   ├── HomePage.tsx        # Landing page
│   ├── CourseCatalogPage.tsx  # Browse courses
│   ├── CourseDetailPage.tsx   # Single course with module tree + enroll/continue button
│   ├── CoursePlayerPage.tsx   # 3-column: CourseTree | ContentViewer | AITutorPanel
│   ├── LoginPage.tsx          # Login + Register form with validation
│   ├── DashboardPage.tsx      # Student dashboard
│   └── LeaderboardPage.tsx    # XP leaderboard
├── store/
│   ├── api/               # RTK Query API slices
│   │   ├── courseApi.ts       # courses, course tree, course progress
│   │   ├── authApi.ts         # login, register mutations
│   │   ├── authTypes.ts       # AuthResponse interface
│   │   ├── aiTutorApi.ts      # POST /api/tutor/chat
│   │   ├── assessmentApi.ts   # questions, submit answers
│   │   ├── dashboardApi.ts    # dashboard data
│   │   ├── enrollmentApi.ts   # enroll, unenroll, enrollment status
│   │   └── gamificationApi.ts # XP, badges, leaderboard
│   ├── slices/
│   │   ├── authSlice.ts       # Auth state (token, user info, setCredentials/logout)
│   │   └── uiSlice.ts        # UI state (theme, sidebar, active concept)
│   ├── hooks.ts           # Typed useAppSelector / useAppDispatch
│   └── store.ts           # Redux store with all API middlewares
├── types/                 # TypeScript interfaces (Course, User, Module, etc.)
├── App.tsx                # Router setup + auth restoration from localStorage
├── main.tsx               # Entry point
├── index.css              # Tailwind directives + custom CSS
└── vite-env.d.ts          # Vite type declarations
```

## Auth System
- **No Keycloak** — uses self-issued HMAC-SHA256 JWT from backend
- `authApi.ts`: `login` and `register` RTK Query mutations hitting `/api/public/auth/login` and `/api/public/auth/register`
- `authSlice.ts`: stores token, userId, username, email, displayName, avatarUrl, roles
- `LoginPage.tsx`: combined login/register form with validation + error handling (401, 409)
- Auth token attached to all API calls via `prepareHeaders` in `courseApi.ts` baseQuery
- Auth state persisted to `localStorage` (`auth_token`, `auth_user` keys)
- Auth restored from localStorage on app startup in `App.tsx`
- Navbar shows "Sign In" when logged out, username + logout icon when logged in
- **Test users**: testuser1/testpass123, testuser2/testpass123

## API Layer
- All API calls go through **RTK Query** slices in `src/store/api/`
- Base URL: `VITE_API_URL` env var (or proxied `/api` in dev via Vite)
- JWT token attached via `prepareHeaders` in base query

## Path Alias
- `@/` → `src/` (configured in both `tsconfig.json` and `vite.config.ts`)

## TypeScript Config
- `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- `noUncheckedIndexedAccess: true` — array/object index access returns `T | undefined`
- Target: ES2020, Module: ESNext, JSX: react-jsx

## Styling Conventions
- Tailwind utility classes for all styling
- `cn()` helper from `lib/utils.ts` for conditional class merging
- shadcn/ui components in `components/ui/` — Radix primitives with Tailwind
- Dark mode support via Tailwind `dark:` variants

## Environment Variables
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g., `https://ai-learning-platform-be-production.up.railway.app`) |

## Conventions
- Functional components only, no class components
- Page components in `pages/`, reusable components in `components/`
- State management: Redux Toolkit for global state, RTK Query for server state
- Use `useAppSelector` and `useAppDispatch` typed hooks from `store/hooks.ts`
- File naming: PascalCase for components (`CourseCard.tsx`), camelCase for utilities (`courseApi.ts`)
- Lucide icons imported individually: `import { BookOpen } from 'lucide-react'`

## Current Status (April 13, 2026)
- **LIVE** on Vercel — all pages working
- Backend API connected via `VITE_API_URL` env var on Vercel
- CORS configured on Railway backend to allow Vercel domain

### Working Features (All Verified E2E)
1. **Course catalog** — browse all published courses at `/courses`
2. **Course detail** — `/courses/:id` shows modules/topics/concepts tree, enroll/continue button
3. **Auth** — Register + Login at `/login`, JWT stored in localStorage, logout in navbar
4. **Enrollment** — enroll from course detail, enrollment status persisted
5. **Course player** — 3-column layout at `/courses/:id/learn`:
   - LHS: CourseTree (modules → topics → concepts, expandable)
   - Center: ContentViewer (concept header + learning unit content as Markdown)
   - RHS: AITutorPanel (GPT-4o Socratic chat with quick prompts)
6. **AI Tutor** — real-time chat, context-aware, session tracking

### Important Frontend-Backend Field Mappings
- `AITutorRequest`: `query` (not `message`), requires `courseId` + `conceptId`
- `AITutorResponse`: `message` (not `response`), includes `sessionId`
- `Course`: `estimatedDurationMinutes`, `createdByName`, `industryVertical`
- `DifficultyLevel`: BEGINNER | EASY | MEDIUM | HARD | ADVANCED (no INTERMEDIATE/EXPERT)
- `LearningUnit`: `contentType` (not `type`)
- Seed content stored as `{"body": "..."}` — ContentViewer checks `body`, `markdown`, `text` keys
- Always use `?? []` when accessing `.learningUnits`, `.modules`, `.topics`, `.concepts` (may be undefined)

### Bugs Fixed (April 13, 2026)
1. Course detail blank → switched from `/courses/:id` to `/courses/:id/tree` API
2. "Enroll Now" didn't work → full auth system built (was Keycloak-dependent)
3. Course player blank on concept click → `learningUnits` missing from API (backend fix)
4. AI Tutor error → field name mismatches with backend, null sessionId crash

## Features Not Yet Implemented
- Quiz/assessment UI (QuizView component exists but untested end-to-end)
- Dashboard data display (page exists but may need API fixes)
- Leaderboard data display
- Instructor course creation UI
- Admin dashboard pages
- Mobile-responsive polish
- User profile editing
- Course search filters (difficulty, category)
