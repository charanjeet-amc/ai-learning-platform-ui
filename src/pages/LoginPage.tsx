import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { useLoginMutation, useRegisterMutation } from '@/store/api/authApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';

function getOAuthUrl(provider: 'google' | 'github') {
  const redirectUri = `${window.location.origin}/auth/callback`;
  if (provider === 'google') {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: 'google',
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'user:email',
    state: 'github',
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/dashboard';
  const dispatch = useAppDispatch();

  const handleOAuth = (provider: 'google' | 'github') => {
    sessionStorage.setItem('oauth_from', from);
    window.location.href = getOAuthUrl(provider);
  };

  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const isLoading = loginLoading || registerLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let result;
      if (isRegister) {
        result = await register({ username, email, password, displayName }).unwrap();
      } else {
        result = await login({ username, password }).unwrap();
      }

      dispatch(
        setCredentials({
          token: result.token,
          userId: result.userId,
          username: result.username,
          email: result.email,
          displayName: result.displayName,
          avatarUrl: result.avatarUrl ?? undefined,
          roles: result.roles,
        })
      );

      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('auth_user', JSON.stringify(result));

      navigate(from, { replace: true });
    } catch (err: unknown) {
      const apiErr = err as { status?: number };
      if (apiErr.status === 401) {
        setError('Invalid username or password');
      } else if (apiErr.status === 409) {
        setError('Username or email already taken');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl">
              <GraduationCap className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isRegister
              ? 'Start your AI-powered learning journey'
              : 'Sign in to continue learning'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="username">
                Username
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoComplete="username"
              />
            </div>

            {isRegister && (
              <>
                <div>
                  <label className="text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="displayName">
                    Display Name
                  </label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? 'Min 6 characters' : 'Enter password'}
                required
                minLength={isRegister ? 6 : undefined}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isRegister ? 'Create Account' : 'Sign In'}
            </Button>

            {/* OAuth2 divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-3">
              {GOOGLE_CLIENT_ID && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuth('google')}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>
              )}
              {GITHUB_CLIENT_ID && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuth('github')}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {isRegister ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(false); setError(''); }}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(true); setError(''); }}
                    className="text-primary font-medium hover:underline"
                  >
                    Create one
                  </button>
                </>
              )}
            </div>
          </form>

          <div className="mt-6 pt-4 border-t text-center">
            <Link to="/courses" className="text-sm text-muted-foreground hover:text-foreground">
              ← Browse courses without signing in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
