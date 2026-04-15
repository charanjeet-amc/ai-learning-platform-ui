import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setTheme } from './store/slices/uiSlice';
import { setCredentials } from './store/slices/authSlice';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CoursePlayerPage from './pages/CoursePlayerPage';
import DashboardPage from './pages/DashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LearningHistoryPage from './pages/LearningHistoryPage';
import LoginPage from './pages/LoginPage';
import InstructorDashboardPage from './pages/InstructorDashboardPage';
import CourseEditorPage from './pages/CourseEditorPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import RequireAuth from './components/auth/RequireAuth';

export default function App() {
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Initialize theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) dispatch(setTheme(saved));
  }, [dispatch]);

  // Restore auth state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    const token = localStorage.getItem('auth_token');
    if (stored && token) {
      try {
        const user = JSON.parse(stored);
        dispatch(setCredentials({
          token,
          userId: user.userId,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl ?? undefined,
          roles: user.roles ?? [],
        }));
      } catch { /* ignore corrupt data */ }
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CourseCatalogPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/courses/:courseId/learn" element={<RequireAuth><CoursePlayerPage /></RequireAuth>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/history" element={<RequireAuth><LearningHistoryPage /></RequireAuth>} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/instructor" element={<RequireAuth><InstructorDashboardPage /></RequireAuth>} />
        <Route path="/instructor/courses/:courseId/edit" element={<RequireAuth><CourseEditorPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
      </Route>
    </Routes>
  );
}
