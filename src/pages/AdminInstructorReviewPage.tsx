import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  useListApplicationsQuery,
  useGetApplicationDetailQuery,
  useApproveApplicationMutation,
  useRejectApplicationMutation,
} from '@/store/api/instructorApplicationApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ArrowLeft,
  User,
  Briefcase,
  Globe,
  Youtube,
  GraduationCap,
  Loader2,
  ExternalLink,
} from 'lucide-react';

type StatusFilter = 'PENDING' | 'APPROVED' | 'REJECTED';

export default function AdminInstructorReviewPage() {
  const { roles } = useAppSelector((s) => s.auth);
  const isAdmin = roles.includes('ADMIN');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: applications = [], isLoading } = useListApplicationsQuery(statusFilter, {
    skip: !isAdmin,
  });
  const { data: detail } = useGetApplicationDetailQuery(selectedId!, {
    skip: !selectedId,
  });
  const [approve, { isLoading: approving }] = useApproveApplicationMutation();
  const [reject, { isLoading: rejecting }] = useRejectApplicationMutation();

  if (!isAdmin) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    );
  }

  const handleApprove = async (id: string) => {
    try {
      await approve({ id }).unwrap();
      setSelectedId(null);
    } catch {
      alert('Failed to approve application');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reject({ id, notes: rejectNotes || undefined }).unwrap();
      setShowRejectModal(false);
      setRejectNotes('');
      setSelectedId(null);
    } catch {
      alert('Failed to reject application');
    }
  };

  // Detail view
  if (selectedId && detail) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </button>

        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {detail.avatarUrl ? (
              <img src={detail.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{detail.displayName}</h1>
              <p className="text-muted-foreground">{detail.email}</p>
              {detail.headline && <p className="text-sm mt-1">{detail.headline}</p>}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            detail.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' :
            detail.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
            'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
          }`}>
            {detail.status}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Professional Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" /> Professional Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {detail.linkedinUrl && (
                <a href={detail.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  LinkedIn <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {detail.githubUrl && (
                <a href={detail.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  GitHub <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {detail.websiteUrl && (
                <a href={detail.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  Website <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {detail.cvUrl && (
                <a href={detail.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  CV / Resume <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {!detail.linkedinUrl && !detail.githubUrl && !detail.websiteUrl && !detail.cvUrl && (
                <p className="text-muted-foreground">No links provided</p>
              )}
            </CardContent>
          </Card>

          {/* Teaching Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Teaching Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {detail.yearsTeaching != null && (
                <p><span className="font-medium">Years Teaching:</span> {detail.yearsTeaching}</p>
              )}
              {detail.currentInstitution && (
                <p><span className="font-medium">Current Institution:</span> {detail.currentInstitution}</p>
              )}
              {detail.teachingDescription && (
                <p className="text-muted-foreground">{detail.teachingDescription}</p>
              )}
            </CardContent>
          </Card>

          {/* Online Presence */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Youtube className="h-4 w-4" /> Online Presence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {detail.youtubeChannelUrl && (
                <a href={detail.youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  YouTube Channel <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {detail.youtubeSubscribers != null && (
                <p><span className="font-medium">Subscribers:</span> {detail.youtubeSubscribers.toLocaleString()}</p>
              )}
              {detail.otherPlatforms && (
                <p className="text-muted-foreground">{detail.otherPlatforms}</p>
              )}
              {!detail.youtubeChannelUrl && !detail.otherPlatforms && (
                <p className="text-muted-foreground">No online presence provided</p>
              )}
            </CardContent>
          </Card>

          {/* Expertise & Motivation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Expertise & Motivation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {detail.expertise && (
                <div>
                  <p className="font-medium mb-1">Areas of Expertise:</p>
                  <p className="text-muted-foreground">{detail.expertise}</p>
                </div>
              )}
              {detail.whyTeach && (
                <div>
                  <p className="font-medium mb-1">Why They Want to Teach:</p>
                  <p className="text-muted-foreground">{detail.whyTeach}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {detail.bio && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-base">Bio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{detail.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        {detail.status === 'PENDING' && (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleApprove(detail.id)}
              disabled={approving}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Approve as Instructor
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowRejectModal(true)}
              disabled={rejecting}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )}

        {/* Reject modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowRejectModal(false)}>
            <div className="bg-background rounded-xl shadow-xl w-full max-w-md p-6 m-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">Reject Application</h2>
              <div>
                <label className="text-sm font-medium">Reason / Notes (optional)</label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Provide feedback to the applicant..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(detail.id)}
                  disabled={rejecting}
                >
                  {rejecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Confirm Reject
                </Button>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          Applied: {detail.createdAt ? new Date(detail.createdAt).toLocaleDateString() : 'Unknown'}
          {detail.reviewedAt && ` · Reviewed: ${new Date(detail.reviewedAt).toLocaleDateString()}`}
        </p>
      </div>
    );
  }

  // List view
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Instructor Applications</h1>
        <p className="text-muted-foreground mt-1">Review and manage instructor applications</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['PENDING', 'APPROVED', 'REJECTED'] as StatusFilter[]).map((status) => (
          <Button
            key={status}
            size="sm"
            variant={statusFilter === status ? 'default' : 'outline'}
            onClick={() => setStatusFilter(status)}
            className="gap-2"
          >
            {status === 'PENDING' && <Clock className="h-3.5 w-3.5" />}
            {status === 'APPROVED' && <CheckCircle className="h-3.5 w-3.5" />}
            {status === 'REJECTED' && <XCircle className="h-3.5 w-3.5" />}
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl border bg-muted animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            No {statusFilter.toLowerCase()} applications
          </h3>
          <p className="text-muted-foreground">
            {statusFilter === 'PENDING'
              ? 'All applications have been reviewed!'
              : `No ${statusFilter.toLowerCase()} applications found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {app.avatarUrl ? (
                    <img src={app.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{app.displayName}</p>
                    <p className="text-sm text-muted-foreground">{app.email}</p>
                    {app.headline && (
                      <p className="text-xs text-muted-foreground mt-0.5">{app.headline}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs text-muted-foreground hidden sm:block">
                    {app.expertise && <p className="line-clamp-1 max-w-[200px]">{app.expertise}</p>}
                    {app.yearsTeaching != null && <p>{app.yearsTeaching} yrs teaching</p>}
                    {app.createdAt && <p>{new Date(app.createdAt).toLocaleDateString()}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedId(app.id)}
                    className="gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
