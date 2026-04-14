import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import {
  useGetMyCoursesQuery,
  useCreateCourseMutation,
  usePublishCourseMutation,
  useUnpublishCourseMutation,
  useDeleteCourseMutation,
  useImportCourseMutation,
} from '@/store/api/instructorApi';
import {
  Plus,
  Upload,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  BookOpen,
  Users,
  Star,
  FileUp,
  GraduationCap,
} from 'lucide-react';

export default function InstructorDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, roles, displayName } = useAppSelector((s) => s.auth);
  const isInstructor = roles.includes('INSTRUCTOR') || roles.includes('ADMIN');

  const { data: courses, isLoading, refetch } = useGetMyCoursesQuery(undefined, { skip: !isInstructor });
  const [createCourse] = useCreateCourseMutation();
  const [publishCourse] = usePublishCourseMutation();
  const [unpublishCourse] = useUnpublishCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();
  const [importCourse, { isLoading: isImporting }] = useImportCourseMutation();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('BEGINNER');

  const [importTitle, setImportTitle] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importDifficulty, setImportDifficulty] = useState('BEGINNER');

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Sign in to access Instructor Studio</h2>
        <p className="text-muted-foreground mb-6">Create and manage your courses</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (!isInstructor) {
    return (
      <div className="container py-16 text-center">
        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Instructor Access Required</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          You need instructor privileges to access this area. You can upgrade your account from the Dashboard.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const handleCreateCourse = async () => {
    if (!newTitle.trim()) return;
    try {
      const course = await createCourse({
        title: newTitle,
        description: newDescription,
        difficulty: newDifficulty,
      }).unwrap();
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      navigate(`/instructor/courses/${course.id}/edit`);
    } catch {
      alert('Failed to create course');
    }
  };

  const handleImportCourse = async () => {
    if (!importTitle.trim() || !importFile) return;
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('title', importTitle);
      formData.append('difficulty', importDifficulty);
      const course = await importCourse(formData).unwrap();
      setShowImportModal(false);
      setImportTitle('');
      setImportFile(null);
      navigate(`/instructor/courses/${course.id}/edit`);
    } catch {
      alert('Failed to import course. Make sure the file is a valid PDF or DOCX.');
    }
  };

  const handleDelete = async (courseId: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteCourse(courseId).unwrap();
      refetch();
    } catch {
      alert('Failed to delete course');
    }
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Instructor Studio</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {displayName}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-accent transition-colors"
          >
            <FileUp className="h-4 w-4" />
            Import PDF / DOCX
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Course
          </button>
        </div>
      </div>

      {/* Stats */}
      {courses && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <BookOpen className="h-4 w-4" /> Total Courses
            </div>
            <p className="text-2xl font-bold">{courses.length}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Eye className="h-4 w-4" /> Published
            </div>
            <p className="text-2xl font-bold">{courses.filter(c => c.published).length}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Users className="h-4 w-4" /> Total Enrollments
            </div>
            <p className="text-2xl font-bold">{courses.reduce((sum, c) => sum + (c.enrollmentCount ?? 0), 0)}</p>
          </div>
        </div>
      )}

      {/* Course List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl border bg-muted animate-pulse" />
          ))}
        </div>
      ) : !courses?.length ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-6">Create your first course or import from a document</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 border rounded-lg hover:bg-accent"
            >
              <FileUp className="h-4 w-4 inline mr-2" />
              Import Document
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Create Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="h-10 w-10 text-primary/40" />
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${
                    course.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {course.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {course.description || 'No description'}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {course.enrollmentCount ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" /> {course.rating?.toFixed(1) ?? '0.0'}
                  </span>
                  <span className="capitalize">{(course.difficulty ?? 'BEGINNER').toLowerCase()}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t">
                  <button
                    onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  {course.published ? (
                    <button
                      onClick={async () => { await unpublishCourse(course.id).unwrap(); refetch(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
                    >
                      <EyeOff className="h-3.5 w-3.5" /> Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={async () => { await publishCourse(course.id).unwrap(); refetch(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary rounded-md hover:bg-primary/10 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" /> Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(course.id, course.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-destructive rounded-md hover:bg-destructive/10 transition-colors ml-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Create New Course</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Introduction to Machine Learning"
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description of the course..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleCreateCourse}
                disabled={!newTitle.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Course Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowImportModal(false)}>
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Import from Document</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a PDF or DOCX file. Headings will be parsed into course structure automatically.
              Inline images will be uploaded to cloud storage.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course Title *</label>
                <input
                  type="text"
                  value={importTitle}
                  onChange={(e) => setImportTitle(e.target.value)}
                  placeholder="Title for the imported course"
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Document File *</label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {importFile ? (
                    <div>
                      <FileUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">{importFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(importFile.size / 1024 / 1024).toFixed(1)} MB</p>
                      <button
                        onClick={() => setImportFile(null)}
                        className="text-xs text-destructive mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to select or drag & drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOCX (max 100 MB)</p>
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        className="hidden"
                        onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={importDifficulty}
                  onChange={(e) => setImportDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowImportModal(false)} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleImportCourse}
                disabled={!importTitle.trim() || !importFile || isImporting}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
              >
                {isImporting ? 'Importing...' : 'Import Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
