# AI Learning Platform — Frontend

## Product Vision
Build the most advanced AI-powered learning platform that surpasses Coursera, Udemy, and DeepLearning.AI. AI-native adaptive learning — not video courses with AI bolted on.

## Core Requirements (UI Perspective)
1. **Course Catalog**: Search, filter by category/difficulty/duration. Course cards with ratings, enrollment counts.
2. **Course Detail**: Full module/topic/concept tree view. Enroll button.
3. **Course Player**: Content viewer (text, video, code) + AI tutor chat side panel. Progress tracking per concept.
4. **AI Tutor Chat**: Real-time WebSocket chat with GPT-4o. Context-aware, Socratic method.
5. **Adaptive Assessments**: Quiz UI with multiple question types (MCQ, code, matching). Real-time feedback.
6. **Gamification**: XP bar, streak counter, badge grid, leaderboard table.
7. **Dashboard**: Student progress overview, weak areas, recommended next steps.
8. **Auth**: Self-issued JWT login/register. Role-based UI (student vs pending-instructor vs instructor vs admin).
9. **Instructor Onboarding**: Register as instructor → fill application (profile, links, experience, YouTube, expertise) → admin reviews → approve/reject.
10. **Admin Review**: Admin dashboard to review instructor applications with status filters, detail view, approve/reject with notes.

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
│   ├── auth/              # RequireAuth
│   ├── course/            # CourseCard, CourseTree, ContentViewer
│   ├── gamification/      # XPBar, StreakCounter, BadgeDisplay, LeaderboardTable
│   ├── layout/            # AppLayout, Navbar (role-based: public/auth/pending/instructor/admin)
│   └── ui/                # shadcn primitives (button, card, input, progress, scroll-area, tabs)
├── lib/
│   └── utils.ts           # cn() helper, getDifficultyColor(), formatDuration()
├── pages/
│   ├── HomePage.tsx             # Landing page with "Join as Instructor" CTA
│   ├── CourseCatalogPage.tsx     # Browse + filter courses (category, difficulty, duration)
│   ├── CourseDetailPage.tsx      # Single course with module tree + enroll/continue
│   ├── CoursePlayerPage.tsx      # 3-column: CourseTree | ContentViewer | AITutorPanel
│   ├── LoginPage.tsx            # Login + Register form with validation
│   ├── DashboardPage.tsx        # Student dashboard
│   ├── LeaderboardPage.tsx      # XP leaderboard
│   ├── LearningHistoryPage.tsx   # Per-course progress + activity feed
│   ├── ProfilePage.tsx          # View/edit profile
│   ├── SettingsPage.tsx         # Change password, delete account
│   ├── InstructorRegisterPage.tsx    # 3-step guide, benefits, registration form
│   ├── InstructorApplyPage.tsx       # Full application form (links, experience, YouTube, expertise)
│   ├── InstructorDashboardPage.tsx   # Course list, create/import
│   ├── CourseEditorPage.tsx          # Tree editing, Markdown preview, Cloudinary upload
│   ├── AdminInstructorReviewPage.tsx # Status filters, application list, detail view, approve/reject
│   └── OAuthCallbackPage.tsx        # OAuth2 callback handler
├── store/
│   ├── api/               # RTK Query API slices
│   │   ├── courseApi.ts            # courses, course tree, course progress, filter, categories
│   │   ├── authApi.ts             # login, register, registerInstructor mutations
│   │   ├── authTypes.ts           # AuthResponse interface
│   │   ├── aiTutorApi.ts          # POST /api/tutor/chat
│   │   ├── assessmentApi.ts       # questions, submit answers
│   │   ├── dashboardApi.ts        # dashboard data
│   │   ├── enrollmentApi.ts       # enroll, unenroll, enrollment status
│   │   ├── gamificationApi.ts     # XP, badges, leaderboard
│   │   ├── instructorApi.ts       # instructor course management
│   │   ├── instructorApplicationApi.ts  # submit/view application, admin list/detail/approve/reject
│   │   ├── learningHistoryApi.ts  # learning history
│   │   ├── learningPathApi.ts     # learning paths
│   │   └── userApi.ts             # profile, settings
│   ├── slices/
│   │   ├── authSlice.ts       # Auth state (token, user info, roles, setCredentials/logout, localStorage)
│   │   └── uiSlice.ts         # UI state (theme, sidebar, active concept)
│   ├── hooks.ts           # Typed useAppSelector / useAppDispatch
│   └── store.ts           # Redux store with all API middlewares (13 APIs registered)
├── types/                 # TypeScript interfaces (Course, User, Module, etc.)
├── App.tsx                # Router setup + auth restoration from localStorage
├── main.tsx               # Entry point
├── index.css              # Tailwind directives + custom CSS
└── vite-env.d.ts          # Vite type declarations
```

## Auth System
- **No Keycloak** — uses self-issued HMAC-SHA256 JWT from backend
- `authApi.ts`: `login`, `register`, and `registerInstructor` RTK Query mutations
  - `/api/public/auth/login`, `/api/public/auth/register`, `/api/public/auth/register-instructor`
- `authSlice.ts`: stores token, userId, username, email, displayName, avatarUrl, roles
- `LoginPage.tsx`: combined login/register form with validation + error handling (401, 409)
- Auth token attached to all API calls via `prepareHeaders` in `courseApi.ts` baseQuery
- Auth state persisted to `localStorage` (`auth_token`, `auth_user` keys)
- Auth restored from localStorage on app startup in `App.tsx`
- Navbar shows role-based links:
  - Unauthenticated: Courses, Leaderboard, "Sign In"
  - Authenticated: + Dashboard, History, profile, settings
  - PENDING_INSTRUCTOR: + "Apply" link (→ /instructor/apply)
  - INSTRUCTOR/ADMIN: + "Instructor" link (→ /instructor)
  - ADMIN: + "Admin" link (→ /admin/instructors)
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

## Current Status (Updated April 15, 2026)
- **LIVE** on Vercel — all pages working
- Backend API connected via `VITE_API_URL` env var on Vercel
- CORS configured on Railway backend to allow Vercel domain

### Working Features (All Verified E2E)
**Core Learning:**
1. **Course catalog** — `/courses` with text search + filter sidebar (category checkboxes, difficulty dropdown, duration range)
2. **Course detail** — `/courses/:id` with module/topic/concept tree, enroll/continue, null-safe (tags, rating, enrollmentCount)
3. **Course player** — 3-column layout at `/courses/:id/learn`:
   - LHS: CourseTree (modules → topics → concepts, expandable)
   - Center: ContentViewer (concept header + learning unit content as Markdown + GFM tables via remark-gfm)
   - RHS: AITutorPanel (GPT-4o Socratic chat with quick prompts, remark-gfm)
4. **Quiz/Assessment** — "Quiz" tab in course player, QuizView with MCQ/T-F/short answer, XP on correct
5. **AI Tutor** — context-aware Socratic chat, hint escalation, session tracking

**Auth & Navigation:**
6. **Auth** — Register + Login at `/login`, JWT + localStorage persistence, post-login redirect to origin
7. **RequireAuth** — Route guard wrapping /dashboard, /history, /instructor, /learn, /profile, /settings, /instructor/apply, /admin/instructors
8. **Navbar** — Role-based: public (Courses, Leaderboard) vs auth (+ Dashboard, History); "Apply" for PENDING_INSTRUCTOR; "Instructor" for INSTRUCTOR/ADMIN; "Admin" for ADMIN

**User Features:**
9. **Dashboard** — `/dashboard` with XP, enrolled courses, weak areas, review queue, badges
10. **Learning History** — `/history` with per-course progress, recent activity feed, timezone-correct timestamps
11. **Leaderboard** — `/leaderboard` with real XP data, rank icons (trophy/medal/award for top 3)
12. **Profile** — `/profile` with view/edit display name, bio, avatar; stats grid (XP, streaks, plan); account details
13. **Settings** — `/settings` with change password form, delete account danger zone

**Instructor & Admin:**
14. **Instructor Registration** — `/instructor/register` with 3-step visual guide, benefits section, creates PENDING_INSTRUCTOR user
15. **Instructor Application** — `/instructor/apply` with full form: personal info (headline, bio, photo, CV), professional links (LinkedIn, GitHub, website), teaching experience (years, institution, description), online presence (YouTube URL/subscribers, other platforms), expertise & motivation
16. **Admin Instructor Review** — `/admin/instructors` with PENDING/APPROVED/REJECTED status filter tabs, application list with avatars, detail view with all profile sections, approve/reject with notes modal
17. **Instructor Dashboard** — `/instructor` with course list, create course modal, import course (DOCX)
18. **Course Editor** — `/instructor/courses/:id/edit` with full tree editing, Markdown preview, save feedback (Saving.../Saved!), media upload (Cloudinary)
19. **Homepage CTA** — "Join as Instructor" button in CTA section linking to /instructor/register

### Important Frontend-Backend Field Mappings
- `AITutorRequest`: `query` (not `message`), requires `courseId` + `conceptId`
- `AITutorResponse`: `message` (not `response`), includes `sessionId`
- `Course`: `estimatedDurationMinutes`, `createdByName`, `industryVertical`
- `DifficultyLevel`: BEGINNER | EASY | MEDIUM | HARD | ADVANCED (no INTERMEDIATE/EXPERT)
- `LearningUnit`: `contentType` (not `type`)
- Seed content stored as `{"body": "..."}` — ContentViewer checks `body`, `markdown`, `text` keys
- Always use `?? []` when accessing `.learningUnits`, `.modules`, `.topics`, `.concepts` (may be undefined)
- Always use `?? 0` for `.rating`, `.enrollmentCount` (may be null)

### Bugs Fixed (April 13, 2026)
1. Course detail blank → switched from `/courses/:id` to `/courses/:id/tree` API
2. "Enroll Now" didn't work → full auth system built (was Keycloak-dependent)
3. Course player blank on concept click → `learningUnits` missing from API (backend fix)
4. AI Tutor error → field name mismatches with backend, null sessionId crash

### Bugs Fixed (April 14, 2026)
5. Markdown tables not rendering → installed remark-gfm, added to ContentViewer, CourseEditor, AITutor
6. No save feedback on editor → added saveStatus state machine (idle→saving→saved)
7. Auth lost on page refresh → added localStorage persistence in authSlice (loadAuthState/saveAuthState)
8. NaNh duration → formatDuration handles null/undefined, returns "—"
9. Blank course detail → `course.tags` null; added `(course.tags ?? [])`, `(course.rating ?? 0)`, `(course.enrollmentCount ?? 0)`
10. Nav items visible before login → split publicNavItems/authNavItems conditional on isAuthenticated
11. No route protection → created RequireAuth component, LoginPage reads state.from for redirect

### Files Added/Modified (April 14)
- `pages/ProfilePage.tsx` — NEW: profile view/edit with avatar, stats grid, account details
- `pages/SettingsPage.tsx` — NEW: change password + delete account
- `store/api/userApi.ts` — NEW: RTK Query for profile/settings endpoints
- `components/auth/RequireAuth.tsx` — NEW: auth guard with redirect
- `components/layout/Navbar.tsx` — conditional nav items, profile/settings/instructor links
- `components/course/ContentViewer.tsx` — remark-gfm
- `components/ai-tutor/AITutorPanel.tsx` — remark-gfm
- `pages/CourseEditorPage.tsx` — remark-gfm, save feedback
- `pages/CourseDetailPage.tsx` — null safety for rating, enrollmentCount, tags
- `pages/CourseCard.tsx` — null safety
- `lib/utils.ts` — formatDuration handles null
- `store/slices/authSlice.ts` — localStorage persistence
- `pages/LoginPage.tsx` — redirect to state.from after login
- `App.tsx` — RequireAuth wrappers, /profile and /settings routes
- `store/store.ts` — registered userApi reducer + middleware

### Files Added/Modified (April 15)
- `pages/CourseCatalogPage.tsx` — MODIFIED: added sidebar with category/difficulty/duration filters, uses useFilterCoursesQuery + useGetCategoriesQuery
- `pages/HomePage.tsx` — MODIFIED: added "Join as Instructor" CTA button linking to /instructor/register
- `pages/InstructorRegisterPage.tsx` — NEW: 3-step visual guide (Create Account → Complete Profile → Get Approved), benefits section, registration form calling registerInstructor mutation
- `pages/InstructorApplyPage.tsx` — NEW: comprehensive application form (Personal Info, Professional Links, Teaching Experience, Online Presence, Expertise & Motivation), guards for auth/role, status display
- `pages/AdminInstructorReviewPage.tsx` — NEW: PENDING/APPROVED/REJECTED filter tabs, application summary list with avatars/expertise/tenure, detail view with profile cards, approve/reject with modal
- `store/api/authApi.ts` — MODIFIED: added registerInstructor mutation + useRegisterInstructorMutation hook
- `store/api/instructorApplicationApi.ts` — NEW: full RTK Query API (getMyApplication, submitApplication, listApplications, getApplicationDetail, approveApplication, rejectApplication)
- `store/store.ts` — MODIFIED: registered instructorApplicationApi reducer + middleware
- `components/layout/Navbar.tsx` — MODIFIED: "Apply" link for PENDING_INSTRUCTOR, "Admin" link for ADMIN, imported ClipboardCheck + Shield icons
- `App.tsx` — MODIFIED: added routes /instructor/register, /instructor/apply, /admin/instructors with imports

## Routes (App.tsx)
```
/                          → HomePage
/courses                   → CourseCatalogPage
/courses/:courseId          → CourseDetailPage
/courses/:courseId/learn    → RequireAuth > CoursePlayerPage
/login                     → LoginPage
/auth/callback             → OAuthCallbackPage
/dashboard                 → RequireAuth > DashboardPage
/history                   → RequireAuth > LearningHistoryPage
/leaderboard               → LeaderboardPage
/instructor                → RequireAuth > InstructorDashboardPage
/instructor/register       → InstructorRegisterPage
/instructor/apply          → RequireAuth > InstructorApplyPage
/instructor/courses/:id/edit → RequireAuth > CourseEditorPage
/admin/instructors         → RequireAuth > AdminInstructorReviewPage
/profile                   → RequireAuth > ProfilePage
/settings                  → RequireAuth > SettingsPage
```

## Features Not Yet Implemented
- XP-based levels/tier progression UI
- AI Tutor WebSocket streaming (currently HTTP POST)
- Mobile-responsive fine-tuning (basic responsiveness works)
