import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { useOauth2GoogleMutation, useOauth2GithubMutation } from '@/store/api/authApi';
import { Loader2 } from 'lucide-react';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');
  const processed = useRef(false);

  const [googleExchange] = useOauth2GoogleMutation();
  const [githubExchange] = useOauth2GithubMutation();

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get('code');
    const provider = searchParams.get('state'); // we pass provider name in state param
    const from = sessionStorage.getItem('oauth_from') || '/dashboard';

    if (!code || !provider) {
      setError('Missing authorization code');
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback`;

    const exchangeCode = provider === 'google' ? googleExchange : githubExchange;

    exchangeCode({ code, redirectUri })
      .unwrap()
      .then((result) => {
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
        sessionStorage.removeItem('oauth_from');
        navigate(from, { replace: true });
      })
      .catch(() => {
        setError('OAuth login failed. Please try again.');
      });
  }, [searchParams, dispatch, navigate, googleExchange, githubExchange]);

  if (error) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-4">
        <p className="text-red-500">{error}</p>
        <a href="/login" className="text-primary hover:underline">Back to login</a>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Signing you in...
      </div>
    </div>
  );
}
