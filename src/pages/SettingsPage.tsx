import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChangePasswordMutation, useDeleteAccountMutation, useGetProfileQuery } from '@/store/api/userApi';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Trash2, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [changePassword, { isLoading: changingPw }] = useChangePasswordMutation();
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation();
  const { data: profile } = useGetProfileQuery();
  const hasPassword = profile?.hasPassword ?? true;

  // Password form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete form
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPw.length < 6) {
      setPwMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    try {
      await changePassword({ currentPassword: currentPw, newPassword: newPw }).unwrap();
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch {
      setPwMsg({ type: 'error', text: 'Failed to change password. Check your current password.' });
    }
  };

  const handleDelete = async () => {
    if (hasPassword) {
      if (!deletePw) { setDeleteMsg('Enter your password to confirm'); return; }
    } else {
      if (deleteConfirmText !== 'DELETE') { setDeleteMsg('Type DELETE to confirm'); return; }
    }
    try {
      await deleteAccount(hasPassword ? { password: deletePw } : {}).unwrap();
      dispatch(logout());
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      navigate('/login');
    } catch {
      setDeleteMsg(hasPassword ? 'Incorrect password or failed to delete account.' : 'Failed to delete account.');
    }
  };

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Change Password */}
      {hasPassword ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4" /> Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Current Password</label>
                <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">New Password</label>
                <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Confirm New Password</label>
                <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required />
              </div>
              {pwMsg && (
                <p className={`text-sm ${pwMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {pwMsg.text}
                </p>
              )}
              <Button type="submit" disabled={changingPw}>
                {changingPw ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4" /> Password
            </CardTitle>
            <CardDescription>You signed in with a social provider (Google/GitHub). No password is set for this account.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Delete Account */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-red-600">
            <AlertTriangle className="h-4 w-4" /> Danger Zone
          </CardTitle>
          <CardDescription>Permanently delete your account and all associated data</CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete My Account
            </Button>
          ) : (
            <div className="space-y-3 p-4 rounded-md border border-red-200 bg-red-50/50">
              <p className="text-sm font-medium text-red-700">
                {hasPassword
                  ? 'This action cannot be undone. Enter your password to confirm.'
                  : 'This action cannot be undone. Type DELETE to confirm.'}
              </p>
              {hasPassword ? (
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={deletePw}
                  onChange={(e) => setDeletePw(e.target.value)}
                />
              ) : (
                <Input
                  type="text"
                  placeholder='Type "DELETE" to confirm'
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
              )}
              {deleteMsg && <p className="text-sm text-red-600">{deleteMsg}</p>}
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Permanently Delete Account'}
                </Button>
                <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeletePw(''); setDeleteConfirmText(''); setDeleteMsg(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
