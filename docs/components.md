# Frontend Components

Component hierarchy, key props, and patterns for `ai-learning-platform-ui` (React 19 / TypeScript 5.7).

## Page Components (`src/pages/`)

### `CoursePlayerPage.tsx`
3-column layout: sidebar (course tree) | content | AI tutor panel.
- Fetches full course tree via `useGetCourseTreeQuery`
- Active concept tracked in Redux `uiSlice` (`setActiveConcept`)
- `?review=conceptId` query param: navigates directly to concept quiz on load
- **AI Tutor panel hidden when `activeTab === 'quiz'`** (anti-cheat)
- `onComplete` after quiz: `handleNext()` navigates to next concept; if last concept (`isAtEnd`), switches to `'learn'` tab
- Passes `conceptId` to `QuizView` for AI question generation

### `QuizView.tsx` (`src/components/assessment/`)
Handles all 4 question types with type-specific rendering.
- Props: `questions`, `conceptId?`, `onComplete?`
- Local state: `questions` (can be replaced by AI-generated batch), `currentIndex`, `result`, `results`
- **MCQ / SCENARIO_BASED**: option buttons with color feedback on submission
- **CODING**: dark code block (starter code) + monospace textarea
- **SUBJECTIVE**: plain textarea
- **SCENARIO_BASED**: amber scenario context block + option buttons
- Score badge: green ≥ 0.7, yellow ≥ 0.4, red < 0.4 (AI-evaluated questions only)
- Completion screen: shows score/XP + "Generate AI Questions" panel + "Continue Learning" button
- "Generate AI Questions": calls `useGenerateAIQuestionsMutation(conceptId)`, replaces question state with fresh batch

### `AITutorPanel.tsx` (`src/components/ai-tutor/`)
Socratic GPT-4o chat, context-aware, session-persistent.
- Sends `{ courseId, conceptId, query, sessionId }` — field is **`query`**, NOT `message`
- Response field is **`message`** (not `response`)
- Hidden in `CoursePlayerPage` when quiz tab is active

### `DashboardPage.tsx`
- XP bar, stats grid, streak, weak areas, review queue, enrolled courses, certificates, badges
- Review queue items: clickable links → `/courses/{courseId}/learn?review={conceptId}`
- "Get Certificate" button shown when `progressPercent >= 100` and no cert yet
- Certificate date: `cert.completedAt ?? cert.issuedAt` (not just `issuedAt`)

### `ContentViewer.tsx` (`src/components/course/`)
Renders learning unit content.
- Checks content JSONB for `body`, `markdown`, `text` keys (in that order)
- Uses `react-markdown` + `remark-gfm` for tables and rich markdown
- Supports TEXT, VIDEO, CODE_EXERCISE, DIAGRAM content types

### `Navbar.tsx` (`src/components/layout/`)
Role-based navigation:
| Role | Additional Links |
|---|---|
| Unauthenticated | Courses, Leaderboard, Sign In |
| STUDENT | + Dashboard, History, profile/settings |
| PENDING_INSTRUCTOR | + Apply link |
| INSTRUCTOR / ADMIN | + Instructor dashboard |
| ADMIN | + Admin dashboard |

### `XPBar.tsx` (`src/components/gamification/`)
- Shows current level, XP within level, progress to next level
- Level formula: Level N requires `N * 500` cumulative XP

### `BadgeDisplay.tsx` (`src/components/gamification/`)
- Grid of earned badges with icon, name, category, earned date

### `StreakTracker.tsx` (`src/components/gamification/`)
- Current streak + longest streak display

### `CourseCard.tsx` (`src/components/course/`)
- Thumbnail, title, category, difficulty badge, duration, rating, enrollment count
- Null-safe: `rating ?? 0`, `enrollmentCount ?? 0`, `tags ?? []`

### `RequireAuth.tsx` (`src/components/auth/`)
- Route guard: redirects to `/login` with `state.from` if not authenticated
- Optional `roles` prop for role-gated routes

---

## State Management

### Redux Store (`src/store/store.ts`)
All API slices registered:
- `courseApi`, `authApi`, `aiTutorApi`, `assessmentApi`, `dashboardApi`
- `enrollmentApi`, `gamificationApi`, `instructorApi`, `instructorApplicationApi`
- `adminCourseApi`, `learningHistoryApi`, `learningPathApi`, `userApi`, `certificateApi`

### RTK Query API Slices (`src/store/api/`)
| File | Endpoints |
|---|---|
| `courseApi.ts` | courses, tree, progress, filter, categories; defines `baseQuery` used by all |
| `authApi.ts` | login, register, registerInstructor |
| `aiTutorApi.ts` | POST /api/tutor/chat |
| `assessmentApi.ts` | questions, submitAnswer, reviewQueue, generateAIQuestions |
| `dashboardApi.ts` | GET /api/dashboard |
| `enrollmentApi.ts` | enroll, unenroll, status |
| `gamificationApi.ts` | badges, leaderboard, XP events |
| `certificateApi.ts` | generateCertificate, getMyCertificates |
| `learningPathApi.ts` | learning path, next concept |
| `learningHistoryApi.ts` | learning history |
| `userApi.ts` | profile CRUD, password change, delete account |
| `instructorApi.ts` | instructor course CRUD, import, upload |
| `instructorApplicationApi.ts` | application submit/view, admin list/approve/reject |
| `adminCourseApi.ts` | pending courses, approve, reject, unpublish |

### Redux Slices (`src/store/slices/`)
- **`authSlice`**: token, userId, username, email, displayName, avatarUrl, roles — persisted to `localStorage`
- **`uiSlice`**: theme, activeConcept ID (used by CoursePlayerPage + AITutorPanel)

---

## Shared UI Primitives (`src/components/ui/`)
shadcn/ui components (Radix + Tailwind): `Button`, `Card`, `Input`, `Progress`, `Tabs`, `Badge`, `Dialog`, `Select`, `Textarea`, `ScrollArea`, `Tooltip`, `Separator`

## Utility Functions (`src/lib/utils.ts`)
- `cn(...classes)` — conditional Tailwind class merging (clsx + tailwind-merge)
- `getMasteryColor(level: number)` — returns Tailwind color class for mastery level
- `getDifficultyColor(difficulty: DifficultyLevel)` — color by difficulty
- `formatDuration(minutes?: number)` — null-safe duration string

## See also
- [conventions.md](conventions.md) — Coding standards
- [progress.md](progress.md) — Development timeline
