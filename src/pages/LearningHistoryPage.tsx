import { useGetLearningHistoryQuery } from '@/store/api/learningHistoryApi';
import type { CourseHistoryEntry, RecentActivityEntry } from '@/store/api/learningHistoryApi';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  HelpCircle,
  Sparkles,
  Target,
  Trophy,
  GraduationCap,
} from 'lucide-react';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getActivityIcon(type: RecentActivityEntry['type']) {
  switch (type) {
    case 'ENROLLMENT':
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    case 'QUIZ_ATTEMPT':
      return <HelpCircle className="h-4 w-4 text-purple-500" />;
    case 'CONCEPT_MASTERED':
      return <Brain className="h-4 w-4 text-green-500" />;
    case 'COURSE_COMPLETED':
      return <Trophy className="h-4 w-4 text-yellow-500" />;
  }
}

function CourseHistoryCard({ course }: { course: CourseHistoryEntry }) {
  const progress = course.progressPercent ?? 0;

  return (
    <Link to={`/courses/${course.courseId}/learn`} className="block group">
      <Card className="hover:shadow-md transition-all">
        <CardContent className="p-5">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <BookOpen className="h-6 w-6 text-primary/30" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                  {course.courseTitle}
                </h3>
                {course.completed && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Enrolled {formatDate(course.enrolledAt)}
                </span>
                {course.completed && course.completedAt && (
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-yellow-500" />
                    Completed {formatDate(course.completedAt)}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">
                    {course.conceptsMastered}/{course.conceptsTotal} concepts mastered
                  </span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>{course.conceptsInProgress} in progress</span>
                <span>{course.questionsAttempted} questions attempted</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function LearningHistoryPage() {
  const { data: history, isLoading } = useGetLearningHistoryQuery();

  if (isLoading || !history) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  const accuracy =
    history.totalQuestionsAnswered > 0
      ? Math.round((history.totalCorrectAnswers / history.totalQuestionsAnswered) * 100)
      : 0;

  const stats = [
    { label: 'Total XP', value: history.totalXp.toLocaleString(), icon: Sparkles, color: 'text-yellow-500' },
    { label: 'Courses Enrolled', value: history.totalCoursesEnrolled, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Courses Completed', value: history.totalCoursesCompleted, icon: GraduationCap, color: 'text-green-500' },
    { label: 'Concepts Mastered', value: history.totalConceptsMastered, icon: Brain, color: 'text-purple-500' },
    { label: 'Questions Answered', value: history.totalQuestionsAnswered, icon: Target, color: 'text-indigo-500' },
    { label: 'Accuracy', value: `${accuracy}%`, icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  return (
    <div className="container py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Learning History</h1>
        <p className="text-muted-foreground mt-1">Track your progress across all courses</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('p-2 rounded-lg bg-muted', stat.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Course History */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-semibold">Course Progress</h2>
          {history.courses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No courses enrolled yet.</p>
                <Link to="/courses" className="text-primary text-sm hover:underline mt-2 block">
                  Browse Courses
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {history.courses.map((course) => (
                <CourseHistoryCard key={course.courseId} course={course} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Card>
            <CardContent className="p-4">
              {history.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No activity yet. Start learning!
                </p>
              ) : (
                <div className="space-y-3">
                  {history.recentActivity.slice(0, 30).map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
