# Frontend Components Overview

Component hierarchy, key props, and patterns for the AI Learning Platform frontend (React 19 / TypeScript 5.7).

## Page Components (`src/pages/`)

### `CourseCatalogPage.tsx`
- Course search/filter with `search`, `category`, `difficulty`, `minDuration`, `maxDuration` params
- Uses `useGetCoursesQuery()` or `useFilterCoursesQuery()` from RTK Query
- Renders grid of `CourseCard` components

### `CourseDetailPage.tsx`
- Course info header + module/topic tree
- Enrollment button (calls `useEnrollMutation()`)
- Displays `estimatedDurationMinutes` (NOT hours), `createdByName` (NOT instructorName)

### `CoursePlayerPage.tsx`
- 3-column layout: course tree (left), content area (center), AI tutor (right)
- Uses `useGetCourseTreeQuery()` for full module→topic→concept→learningUnit hierarchy
- AI tutor panel **hidden during active quiz** (re-appears after submission)
- Tracks current concept selection for content display and assessment loading

### `QuizView.tsx`
- Handles all 4 question types: MCQ, CODING, SUBJECTIVE, SCENARIO_BASED
- MCQ: radio buttons for options
- CODING: textarea with monospace font
- SUBJECTIVE: textarea
- SCENARIO_BASED: radio buttons (like MCQ but business scenarios)
- Shows score badge (green ≥0.7, yellow ≥0.4, red <0.4) + AI feedback for evaluated answers
- Calls `useSubmitAnswerMutation()`

### `AITutorPanel.tsx`
- Socratic AI chat with session persistence
- Sends `{ courseId, conceptId, query, sessionId }` — field is `query`, NOT `message`
- Response field is `message` — displays as AI response
- 4-level hint escalation (managed server-side)

### `DashboardPage.tsx`
- XP total, badges, rank, weak areas, review queue
- Uses `useGetDashboardQuery()`

### `InstructorDashboardPage.tsx`
- Lists instructor's courses with status badges (DRAFT, PENDING_APPROVAL, PUBLISHED, CHANGES_REQUESTED)
- Create/edit course form
- Publish button (DRAFT → PENDING_APPROVAL)

### `AdminInstructorReviewPage.tsx`
- Lists PENDING instructor applications
- Approve/reject with notes

### `AdminCourseReviewPage.tsx`
- Lists PENDING_APPROVAL courses
- Approve (→ PUBLISHED) or reject (→ CHANGES_REQUESTED) with feedback

### Auth Pages
- `LoginPage.tsx`: Username/email + password login
- `RegisterPage.tsx`: Student registration
- `InstructorRegisterPage.tsx`: Instructor registration (creates PENDING_INSTRUCTOR)
- `ProfilePage.tsx`: View/edit profile, change password, delete account

## Shared Components (`src/components/`)
- `CourseCard.tsx`: Card with thumbnail, title, category, difficulty, duration
- `Navbar.tsx`: Navigation with role-based links, auth state
- `ProtectedRoute.tsx`: Route guard checking auth + required roles
- `ui/`: shadcn/ui primitives (Button, Card, Input, Badge, Dialog, etc.)

## State Management
- **Redux Toolkit** store at `src/store/store.ts`
- **RTK Query** API slices at `src/store/api/`:
  - `courseApi.ts`, `authApi.ts`, `assessmentApi.ts`, `aiTutorApi.ts`
  - `gamificationApi.ts`, `dashboardApi.ts`, `enrollmentApi.ts`
  - `instructorApi.ts`, `adminApi.ts`, `userApi.ts`, `learningPathApi.ts`
- Each API slice must be registered in store.ts: `reducer` in `[api.reducerPath]` + `middleware`
- Auth slice: `src/store/authSlice.ts` — persists to `localStorage`
- Typed hooks: `useAppSelector`, `useAppDispatch`

## See also
- [conventions.md](conventions.md) — Coding standards
- [progress.md](progress.md) — Development timeline