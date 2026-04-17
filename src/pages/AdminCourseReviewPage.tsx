import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import {
  useGetAdminCoursesQuery,
  useApproveCourseMutation,
  useRejectCourseMutation,
  useUnpublishCourseMutation,
  useDeleteAdminCourseMutation,
} from '@/store/api/adminCourseApi';
import type { Course, CourseStatus } from '@/types';
import {
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  BookOpen,
  Users,
  Star,
  Clock,
  AlertCircle,
  Shield,
  MessageSquare,
  Pencil,
} from 'lucide-react';

const STATUS_FILTERS: { label: string; value: CourseStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending Approval', value: 'PENDING_APPROVAL' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Changes Requested', value: 'CHANGES_REQUESTED' },
];

function StatusBadge({ status }: { status?: CourseStatus }) {
  const config: Record<string, { bg: string; icon: typeof CheckCircle; label: string }> = {
    PUBLISHED: { bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Published' },
    PENDING_APPROVAL: { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock, label: 'Pending' },
    CHANGES_REQUESTED: { bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle, label: 'Changes Req.' },
    DRAFT: { bg: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: BookOpen, label: 'Draft' },
  };
  const entry = config[status ?? 'DRAFT'] ?? config.DRAFT!;
  const Icon = entry.icon;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 ${entry.bg}`}>
      <Icon className="h-3 w-3" /> {entry.label}
    </span>
  );
}

export default function AdminCourseReviewPage() {
  const navigate = useNavigate();
  const { roles } = useAppSelector((s) => s.auth);
  const isAdmin = roles?.includes('ADMIN');

  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'ALL'>('PENDING_APPROVAL');
  const [rejectingCourseId, setRejectingCourseId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const queryStatus = statusFilter === 'ALL' ? undefined : statusFilter;
  const { data: courses, isLoading, refetch } = useGetAdminCoursesQuery(queryStatus, { skip: !isAdmin });

  const [approveCourse] = useApproveCourseMutation();
  const [rejectCourse] = useRejectCourseMutation();
  const [unpublishCourse] = useUnpublishCourseMutation();
  const [deleteAdminCourse] = useDeleteAdminCourseMutation();

  if (!isAdmin) {
    return (
      <div className="container py-16 text-center">
        <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
      </div>
    );
  }

  const handleApprove = async (course: Course) => {
    if (!confirm(`Approve "${course.title}" for publishing?`)) return;
    try {
      await approveCourse(course.id).unwrap();
      refetch();
    } catch {
      alert('Failed to approve course');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingCourseId || !rejectFeedback.trim()) return;
    try {
      await rejectCourse({ courseId: rejectingCourseId, feedback: rejectFeedback }).unwrap();
      setRejectingCourseId(null);
      setRejectFeedback('');
      refetch();
    } catch {
      alert('Failed to reject course');
    }
  };

  const handleUnpublish = async (course: Course) => {
    if (!confirm(`Unpublish "${course.title}"?`)) return;
    try {
      await unpublishCourse(course.id).unwrap();
      refetch();
    } catch {
      alert('Failed to unpublish course');
    }
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    try {
      await deleteAdminCourse(course.id).unwrap();
      refetch();
    } catch {
      alert('Failed to delete course');
    }
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Course Review</h1>
          <p className="text-muted-foreground mt-1">Manage and approve course publications</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {courses?.length ?? 0} course{(courses?.length ?? 0) !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {f.label}
            {f.value === 'PENDING_APPROVAL' && courses && statusFilter !== 'PENDING_APPROVAL' && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/20 text-xs">
                {courses.filter(c => c.status === 'PENDING_APPROVAL').length || ''}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Course List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl border bg-muted animate-pulse" />
          ))}
        </div>
      ) : !courses?.length ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            {statusFilter === 'PENDING_APPROVAL' ? 'No courses pending approval.' : 'No courses match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="hidden sm:flex h-20 w-32 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 items-center justify-center flex-shrink-0 overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="h-8 w-8 text-primary/40" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg truncate">{course.title}</h3>
                    <StatusBadge status={course.status} />
                  </div>
                  <p className="text-sm text-primary/70 mb-1">by {course.createdByName}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {course.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {course.enrollmentCount ?? 0} enrolled
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" /> {course.rating?.toFixed(1) ?? '0.0'}
                    </span>
                    <span className="capitalize">{(course.difficulty ?? 'BEGINNER').toLowerCase()}</span>
                    <span>{course.modules?.length ?? 0} modules</span>
                  </div>

                  {/* Admin feedback display */}
                  {course.adminFeedback && (
                    <div className="flex items-start gap-2 mt-2 p-2 rounded-md bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400 text-xs">
                      <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span>Previous feedback: {course.adminFeedback}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {course.status === 'PENDING_APPROVAL' && (
                    <>
                      <button
                        onClick={() => handleApprove(course)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => { setRejectingCourseId(course.id); setRejectFeedback(''); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </>
                  )}
                  {course.status === 'PUBLISHED' && (
                    <button
                      onClick={() => handleUnpublish(course)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border hover:bg-accent transition-colors"
                    >
                      <EyeOff className="h-3.5 w-3.5" /> Unpublish
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border hover:bg-accent transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border hover:bg-accent transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </button>
                  <button
                    onClick={() => handleDelete(course)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-destructive rounded-md border border-destructive/30 hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Feedback Modal */}
      {rejectingCourseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setRejectingCourseId(null)}>
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">Reject Course</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Provide feedback explaining why the course needs changes. The instructor will see this feedback.
            </p>
            <textarea
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              placeholder="e.g. Content needs more detailed explanations in Module 2. Please add quiz questions for each topic."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setRejectingCourseId(null)} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectFeedback.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                Send Feedback & Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
