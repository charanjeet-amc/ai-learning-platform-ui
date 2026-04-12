import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setTheme } from './store/slices/uiSlice';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CoursePlayerPage from './pages/CoursePlayerPage';
import DashboardPage from './pages/DashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';

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

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CourseCatalogPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/courses/:courseId/learn" element={<CoursePlayerPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Route>
    </Routes>
  );
}
