import { useState, useEffect } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/store/api/userApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User,
  Mail,
  Trophy,
  Flame,
  Award,
  Calendar,
  Edit3,
  Save,
  X,
  Sparkles,
  Shield,
} from 'lucide-react';

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatarUrl || '');
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile({ displayName, bio, avatarUrl: avatarUrl || undefined }).unwrap();
      setEditing(false);
      setSaveMsg('Profile updated!');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch {
      alert('Failed to update profile');
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="container max-w-3xl py-8 space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {saveMsg && (
          <span className="text-sm text-green-600 font-medium">{saveMsg}</span>
        )}
      </div>

      {/* Avatar & Name Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Display Name</label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Avatar URL</label>
                    <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Tell us about yourself..."
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      <Save className="h-3.5 w-3.5 mr-1" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditing(false); setDisplayName(profile.displayName || ''); setBio(profile.bio || ''); setAvatarUrl(profile.avatarUrl || ''); }}>
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">{profile.displayName}</h2>
                    <button onClick={() => setEditing(true)} className="p-1.5 rounded-md hover:bg-accent transition-colors">
                      <Edit3 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-muted-foreground text-sm mt-0.5">@{profile.username}</p>
                  {profile.bio && (
                    <p className="text-sm mt-2">{profile.bio}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
            <p className="text-2xl font-bold">{(profile.totalXp ?? 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
            <p className="text-2xl font-bold">{profile.currentStreak ?? 0}</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold">{profile.longestStreak ?? 0}</p>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold capitalize">{(profile.subscriptionTier ?? 'free').toLowerCase()}</p>
            <p className="text-xs text-muted-foreground">Plan</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{profile.email}</p>
              <p className="text-xs text-muted-foreground">Email address</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium capitalize">{(profile.role ?? 'student').toLowerCase()}</p>
              <p className="text-xs text-muted-foreground">Account role</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{memberSince}</p>
              <p className="text-xs text-muted-foreground">Member since</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
