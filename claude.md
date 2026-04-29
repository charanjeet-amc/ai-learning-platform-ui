# AI Learning Platform — Frontend

## Product Vision
AI-native adaptive learning platform. Surpass Coursera/Udemy/DeepLearning.AI — not video courses with AI bolted on.

## Tech Stack
- **React 19**, **TypeScript 5.7** (strict + noUnusedLocals + noUncheckedIndexedAccess), **Vite 6**
- **Tailwind CSS 3.4** + **shadcn/ui** (Radix primitives in `src/components/ui/`)
- **Redux Toolkit 2.5** + **RTK Query** (15 API slices)
- **React Router 7**, **Recharts**, **Lucide** icons, **react-markdown** + remark-gfm

## Commands
```bash
npm run dev       # localhost:5173 (proxies /api → :8080)
npm run build     # tsc + vite build
vercel deploy --prod  # deploy to production
```
Live URL: `https://ai-learning-platform-ui-pi.vercel.app`

## Source Layout
```
src/
├── components/
│   ├── ai-tutor/     AITutorPanel — Socratic GPT-4o chat (hidden during quiz)
│   ├── assessment/   QuizView — MCQ/CODING/SUBJECTIVE/SCENARIO_BASED + AI feedback
│   ├── auth/         RequireAuth route guard
│   ├── course/       CourseCard, CourseTree, ContentViewer
│   ├── gamification/ XPBar, BadgeDisplay, StreakTracker, LeaderboardTable
│   ├── layout/       AppLayout, Navbar (role-based)
│   └── ui/           shadcn primitives (Button, Card, Input, Progress, Tabs, etc.)
├── lib/
│   └── utils.ts      cn(), getMasteryColor(), getDifficultyColor(), formatDuration()
├── pages/            Route-level page components (PascalCase)
├── store/
│   ├── api/          RTK Query slices — one per domain
│   ├── slices/       authSlice (token+user+roles in localStorage), uiSlice (theme, activeConcept)
│   ├── hooks.ts      useAppSelector, useAppDispatch
│   └── store.ts      Redux store — ALL api slices must be registered here
├── types/            TypeScript interfaces (shared with BE DTO shapes)
├── App.tsx           Router setup + auth restoration from localStorage
└── main.tsx          Entry point
```

## Routes
```
/                           → HomePage
/courses                    → CourseCatalogPage
/courses/:courseId          → CourseDetailPage
/courses/:courseId/learn    → RequireAuth → CoursePlayerPage
/login                      → LoginPage
/dashboard                  → RequireAuth → DashboardPage
/history                    → RequireAuth → LearningHistoryPage
/leaderboard                → LeaderboardPage
/profile                    → RequireAuth → ProfilePage
/settings                   → RequireAuth → SettingsPage
/certificates/:code         → CertificatePage (public)
/instructor                 → RequireAuth → InstructorDashboardPage
/instructor/register        → InstructorRegisterPage
/instructor/apply           → RequireAuth → InstructorApplyPage
/instructor/courses/:id/edit → RequireAuth → CourseEditorPage
/admin/instructors          → RequireAuth → AdminInstructorReviewPage
/admin/courses/:id/review   → RequireAuth → AdminCourseReviewPage
```

## Auth
- No Keycloak — self-issued HMAC-SHA256 JWT from backend
- Token stored in `localStorage` (`auth_token`, `auth_user`) via `authSlice`
- Token attached to all API calls via `prepareHeaders` in the RTK Query base query
- Roles drive Navbar visibility and `RequireAuth` guards
- Test users: `testuser1`/`testpass123`, `testuser2`/`testpass123`

## Conventions
See `docs/conventions.md` for full details. Key rules:
- Functional components only; PascalCase files
- `useAppSelector`/`useAppDispatch` typed hooks — never raw `useSelector`/`useDispatch`
- `cn()` from `@/lib/utils` for conditional Tailwind classes
- **Null safety**: always `?? []` on `.learningUnits`, `.modules`, `.topics`, `.concepts`; always `?? 0` on `.rating`, `.enrollmentCount`
- New API slices must be registered in `store.ts` (reducer + middleware)
- Score badge coloring: green ≥ 0.7, yellow ≥ 0.4, red < 0.4

## Environment
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL — must match `CORS_ORIGINS` in BE env |

## Features Not Yet Implemented
- XP-based level/tier progression UI
- AI Tutor WebSocket streaming (currently HTTP POST)
- Stripe payment flow
- Pre-assessment diagnostic fast-track

---

## Shared Context — API Contracts & Cross-Layer Rules

> Full endpoint reference: backend `docs/api-contracts.md`

### Critical Field Mappings (BE → FE)
| Backend DTO field | Frontend field | Pitfall |
|---|---|---|
| `AITutorRequest.query` | `request.query` | NEVER `message` |
| `AITutorResponse.message` | `response.message` | NEVER `response` |
| `LearningUnit` entity `.type` → DTO `contentType` | `contentType` | entity field name differs |
| `Course.estimatedDurationMinutes` | `estimatedDurationMinutes` | NEVER `estimatedHours` |
| `Course.createdBy.displayName` → `createdByName` | `createdByName` | NOT `instructorName` |
| `AnswerResultResponse.score` | `result.score` | float 0.0–1.0 |
| `AnswerResultResponse.feedback` | `result.feedback` | AI feedback string |
| `UserProgressResponse.courseId` | `ReviewItem.courseId` | required for review-queue navigation links |

### Cross-Cutting Rules
1. **XP awarded server-side only** — FE displays, never computes
2. **AI Tutor hidden during quiz** — enforced in `CoursePlayerPage`; prevents answer copying
3. **Learning graph order**: Course → Module → Topic → Concept → LearningUnit (canonical everywhere)
4. `nextConceptId` = AI recommendation (may skip mastered); `steps` = all concepts (stable progress %)
5. **Content JSONB format**: `{"body": "..."}` — `ContentViewer` checks `body`, `markdown`, `text` keys
6. **`VITE_API_URL` must match `CORS_ORIGINS` on BE** for every environment
7. **Enum or field rename = breaking change** — update BE + FE types + docs in one commit
8. **AI questions are user-scoped** — `generateAIQuestions` result is private to the requesting user; others only see the shared question pool
