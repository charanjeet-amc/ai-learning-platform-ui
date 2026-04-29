# Frontend Progress Log

## 2026-04-25
- "Generate AI Questions" button added to quiz completion screen (`QuizView.tsx`):
  - Calls `generateAIQuestions(conceptId)`, replaces local question state with fresh GPT-4o batch
  - Context description added above button explaining it creates personalized questions
  - AI questions are user-scoped (not shared with other users)
- "Continue Learning" button fixed:
  - Was calling `handleNext()` which silently did nothing on the last concept
  - Now: if `isAtEnd` is true, falls back to `setActiveTab('learn')`
- Review queue items in `DashboardPage` converted to clickable links:
  - Navigate to `/courses/{courseId}/learn?review={conceptId}`
  - `CoursePlayerPage` reads `?review=` param and jumps directly to concept quiz

## 2026-04-24
- `ReviewItem` type: added `courseId` field (required for review navigation links)
- Dashboard certificate date fixed: `cert.completedAt ?? cert.issuedAt` (was always showing today)

## 2026-04-17
- AI-powered evaluation UI: score badge (green ≥ 0.7, yellow ≥ 0.4, red < 0.4) + AI feedback callout
- SUBJECTIVE textarea, CODING textarea with monospace + starter code block
- SCENARIO_BASED: amber scenario context box + radio options
- Fixed: `query` field for AI tutor requests (was sending `message`)

## 2026-04-16
- Admin course approval UI (`AdminCourseReviewPage.tsx`): approve/reject with feedback
- AI Tutor panel hidden during active quiz (anti-cheat); re-shown after answer submission
- Course status badges on instructor dashboard (DRAFT, PENDING_APPROVAL, PUBLISHED, CHANGES_REQUESTED)

## 2026-04-15
- Instructor onboarding: `InstructorRegisterPage.tsx`, full application form
- Instructor dashboard: course list + create/edit form
- Admin instructor review page: approve/reject with notes
- Role-based navigation (PENDING_INSTRUCTOR "Apply" link, INSTRUCTOR/ADMIN "Instructor" link)

## 2026-04-14
- Dashboard: XP display, badge icons, weak areas, review queue, enrolled courses
- Gamification: leaderboard table, streak counter
- Null safety for dashboard arrays (`?? []`), XP display (`?? 0`)
- Auth persistence to localStorage (survives page refresh)

## 2026-04-13
- Project setup: React 19, Vite 6, Tailwind 3.4, shadcn/ui, Redux Toolkit
- Course catalog with search/filter (category, difficulty, duration range)
- Course detail page with enrollment
- Course player: 3-column layout (tree, content, AI tutor)
- AI tutor chat panel (Socratic method, session tracking)
- MCQ quiz view with answer submission
- Auth: login, register, JWT persistence in localStorage

## See also
- [conventions.md](conventions.md) — Coding standards
- [components.md](components.md) — Component reference
