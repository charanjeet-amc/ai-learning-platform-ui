import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { useRegisterInstructorMutation } from '@/store/api/authApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, Loader2, Users, CheckCircle, Clock } from 'lucide-react';

export default function InstructorRegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerInstructor, { isLoading }] = useRegisterInstructorMutation();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await registerInstructor({ username, email, password, displayName }).unwrap();

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

      navigate('/instructor/apply', { replace: true });
    } catch (err: unknown) {
      const apiErr = err as { status?: number };
      if (apiErr.status === 409) {
        setError('Username or email already taken');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        {/* Info section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Join as an Instructor</h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Share your expertise with thousands of learners on our AI-powered platform.
            Create courses with knowledge graph architecture and Socratic methodology.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="font-medium text-sm">Create Account</p>
              <p className="text-xs text-muted-foreground">Register with your details</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <p className="font-medium text-sm">Complete Profile</p>
              <p className="text-xs text-muted-foreground">Fill in your teaching experience</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <p className="font-medium text-sm">Get Approved</p>
              <p className="text-xs text-muted-foreground">Admin reviews and approves</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>Reach thousands of learners</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span>AI-powered course tools</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>Quick approval process</span>
          </div>
        </div>

        {/* Registration form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Your Instructor Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium" htmlFor="displayName">Full Name *</label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Dr. John Doe"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="username">Username *</label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="email">Email *</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@university.edu"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="password">Password *</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Register as Instructor
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
