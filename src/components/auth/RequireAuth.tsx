import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
