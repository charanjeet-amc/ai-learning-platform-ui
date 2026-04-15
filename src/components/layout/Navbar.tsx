import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setTheme } from '@/store/slices/uiSlice';
import { logout } from '@/store/slices/authSlice';
import { userApi } from '@/store/api/userApi';
import {
  BookOpen,
  LayoutDashboard,
  Trophy,
  Sun,
  Moon,
  GraduationCap,
  Sparkles,
  User,
  LogOut,
  History,
  PenTool,
  Settings,
  ClipboardCheck,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const publicNavItems = [
  { label: 'Courses', href: '/courses', icon: BookOpen },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
];

const authNavItems = [
  { label: 'Courses', href: '/courses', icon: BookOpen },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'History', href: '/history', icon: History },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);
  const { isAuthenticated, displayName, roles } = useAppSelector((s) => s.auth);
  const isInstructor = roles?.includes('INSTRUCTOR') || roles?.includes('ADMIN');
  const isPendingInstructor = roles?.includes('PENDING_INSTRUCTOR');
  const isAdmin = roles?.includes('ADMIN');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline">
            AI<span className="text-primary">Learn</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {(isAuthenticated ? authNavItems : publicNavItems).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Instructor Link */}
        {isInstructor && (
          <Link
            to="/instructor"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              location.pathname.startsWith('/instructor')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <PenTool className="h-4 w-4" />
            <span className="hidden md:inline">Instructor</span>
          </Link>
        )}

        {/* Pending instructor - Apply link */}
        {isPendingInstructor && (
          <Link
            to="/instructor/apply"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              location.pathname === '/instructor/apply'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden md:inline">Apply</span>
          </Link>
        )}

        {/* Admin - Review Applications */}
        {isAdmin && (
          <Link
            to="/admin/instructors"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              location.pathname.startsWith('/admin')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Admin</span>
          </Link>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* AI Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Sparkles className="h-3 w-3" />
            GPT-4o Powered
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* User */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1">
              <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-sm hover:bg-secondary/80 transition-colors" title="My Profile">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{displayName}</span>
              </Link>
              <Link to="/settings" className="p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors" aria-label="Settings" title="Settings">
                <Settings className="h-4 w-4" />
              </Link>
              <button
                onClick={() => {
                  dispatch(logout());
                  dispatch(userApi.util.resetApiState());
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('auth_user');
                  navigate('/');
                }}
                className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
