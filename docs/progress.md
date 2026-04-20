# Frontend Progress Log

## 2026-04-17
- AI-powered evaluation UI: score badge (green ≥0.7, yellow ≥0.4, red <0.4) + detailed feedback display
- SUBJECTIVE answer textarea, CODING answer textarea with monospace styling
- SCENARIO_BASED question rendering (radio buttons like MCQ)
- Fixed: `query` field for AI tutor requests (was sending `message`)
- Fixed: score/feedback display for non-MCQ answers

## 2026-04-16
- Admin course approval UI (`AdminCourseReviewPage.tsx`): approve/reject with feedback
- AI Tutor panel hidden during active quiz, re-shown after submission
- Course status badges on instructor dashboard (DRAFT, PENDING_APPROVAL, PUBLISHED, CHANGES_REQUESTED)
- Fixed: course status color mapping, publish button visibility

## 2026-04-15
- Instructor onboarding pages: `InstructorRegisterPage.tsx`, application form
- Instructor dashboard: course list + create/edit form
- Admin instructor review page: approve/reject with notes
- Fixed: role-based navigation links, ProtectedRoute role checking

## 2026-04-14
- Dashboard page: XP display, badge icons, weak areas list, review queue
- Gamification components: leaderboard table, streak counter
- Learning history integration
- Fixed: null safety on dashboard arrays (`?? []`), XP display (`?? 0`)

## 2026-04-13
- Project setup: React 19, Vite 6, Tailwind 3.4, shadcn/ui, Redux Toolkit
- Course catalog with search/filter (category, difficulty, duration range)
- Course detail page with enrollment
- Course player: 3-column layout (tree, content, AI tutor)
- AI tutor chat panel (Socratic method)
- MCQ quiz view with answer submission
- Auth: login, register, JWT persistence in localStorage
- Fixed: CORS issues with Vite dev server, auth state restoration on refresh

## See also
- [conventions.md](conventions.md) — Coding standards
- [components.md](components.md) — Component reference