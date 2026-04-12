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
- **keycloak-js 26** (authentication)
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
│   ├── ai-tutor/          # ChatPanel, ChatMessage, SuggestedQuestions
│   ├── assessment/        # QuizPanel, QuestionCard, ResultsSummary
│   ├── course/            # CourseCard, CourseGrid, ModuleAccordion, ConceptCard, LearningUnitViewer
│   ├── gamification/      # XPBar, StreakCounter, BadgeGrid, LeaderboardTable
│   ├── layout/            # AppLayout, Sidebar, TopNav, MobileNav
│   └── ui/                # shadcn primitives (button, card, input, progress, scroll-area, tabs)
├── lib/
│   ├── keycloak.ts        # Keycloak instance & init config
│   └── utils.ts           # cn() helper (clsx + tailwind-merge)
├── pages/
│   ├── HomePage.tsx        # Landing page
│   ├── CourseCatalogPage.tsx  # Browse courses
│   ├── CourseDetailPage.tsx   # Single course view with module tree
│   ├── CoursePlayerPage.tsx   # Learning experience (content + AI tutor)
│   ├── DashboardPage.tsx      # Student dashboard with progress
│   └── LeaderboardPage.tsx    # XP leaderboard
├── store/
│   ├── api/               # RTK Query API slices
│   │   ├── courseApi.ts       # GET /api/courses, GET /api/courses/:id
│   │   ├── aiTutorApi.ts      # POST /api/ai-tutor/*
│   │   ├── assessmentApi.ts   # Assessment endpoints
│   │   ├── dashboardApi.ts    # Dashboard data
│   │   ├── enrollmentApi.ts   # Enrollment endpoints
│   │   └── gamificationApi.ts # XP, badges, leaderboard
│   ├── slices/
│   │   ├── authSlice.ts       # Auth state (Keycloak token, user info)
│   │   └── uiSlice.ts        # UI state (sidebar, modals)
│   ├── hooks.ts           # Typed useAppSelector / useAppDispatch
│   └── store.ts           # Redux store config with RTK Query middleware
├── types/                 # TypeScript interfaces (Course, User, Module, etc.)
├── App.tsx                # Router & layout setup
├── main.tsx               # Entry point
├── index.css              # Tailwind directives + custom CSS
└── vite-env.d.ts          # Vite type declarations
```

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
| `VITE_KEYCLOAK_URL` | Keycloak server URL |
| `VITE_KEYCLOAK_REALM` | Keycloak realm name |
| `VITE_KEYCLOAK_CLIENT_ID` | Keycloak client ID |

## Conventions
- Functional components only, no class components
- Page components in `pages/`, reusable components in `components/`
- State management: Redux Toolkit for global state, RTK Query for server state
- Use `useAppSelector` and `useAppDispatch` typed hooks from `store/hooks.ts`
- File naming: PascalCase for components (`CourseCard.tsx`), camelCase for utilities (`courseApi.ts`)
- Lucide icons imported individually: `import { BookOpen } from 'lucide-react'`

## Current Status (April 2026)
- **LIVE** on Vercel — deploys automatically from GitHub
- Backend API connected via `VITE_API_URL` env var on Vercel
- CORS configured on Railway backend to allow Vercel domain
- **No courses displaying yet** — backend seed data not loaded (seed endpoint 500 error)
- **No auth working** — Keycloak not deployed, login flow non-functional

## Features Not Yet Implemented
- User registration/login UI (needs Keycloak)
- Instructor course creation UI
- Admin dashboard pages
- Real-time WebSocket notification integration
- Course content beyond seed data
- Mobile-responsive polish
