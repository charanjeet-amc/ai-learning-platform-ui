import { useParams, Link } from 'react-router-dom';
import { useGetCourseQuery, useGetCourseProgressQuery } from '@/store/api/courseApi';
import { useEnrollMutation, useIsEnrolledQuery } from '@/store/api/enrollmentApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Clock,
  Star,
  Users,
  GraduationCap,
  Play,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { cn, getDifficultyColor, formatDuration } from '@/lib/utils';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, isLoading } = useGetCourseQuery(courseId!);
  const { data: isEnrolled } = useIsEnrolledQuery(courseId!);
  const { data: progress } = useGetCourseProgressQuery(courseId!, { skip: !isEnrolled });
  const [enroll, { isLoading: enrolling }] = useEnrollMutation();

  if (isLoading || !course) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {course.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {course.category}
                </span>
              )}
              <span className={cn('text-xs px-2 py-0.5 rounded-full', getDifficultyColor(course.difficulty))}>
                {course.difficulty}
              </span>
            </div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground mt-3 text-lg">{course.description}</p>

            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                {course.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {course.enrollmentCount.toLocaleString()} enrolled
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatDuration(course.estimatedHours * 60)}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                {course.instructorName}
              </span>
            </div>
          </div>

          {/* Modules */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            <div className="space-y-3">
              {course.modules.map((module, index) => (
                <Card key={module.id}>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      {module.title}
                      <span className="ml-auto text-xs text-muted-foreground font-normal">
                        {module.topics.length} topics · {formatDuration(module.estimatedMinutes)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  {module.learningObjectives.length > 0 && (
                    <CardContent className="pt-0 pb-4">
                      <ul className="space-y-1">
                        {module.learningObjectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-4">
              {/* Thumbnail */}
              <div className="aspect-video rounded-lg bg-muted overflow-hidden">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <BookOpen className="h-16 w-16 text-primary/30" />
                  </div>
                )}
              </div>

              {/* Progress */}
              {isEnrolled && progress && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{Math.round(progress.overallProgress)}%</span>
                  </div>
                  <Progress value={progress.overallProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {progress.masteredConcepts}/{progress.totalConcepts} concepts mastered
                  </p>
                </div>
              )}

              {/* Action Button */}
              {isEnrolled ? (
                <Link to={`/courses/${courseId}/learn`} className="block">
                  <Button className="w-full" size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    Continue Learning
                  </Button>
                </Link>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => enroll(courseId!)}
                  disabled={enrolling}
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Enroll Now — Free
                </Button>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <p className="text-lg font-bold">{course.modules.length}</p>
                  <p className="text-xs text-muted-foreground">Modules</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <p className="text-lg font-bold">
                    {course.modules.reduce((s, m) => s + m.topics.length, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Topics</p>
                </div>
              </div>

              {/* Tags */}
              {course.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {course.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {tag}
                    </span>
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
