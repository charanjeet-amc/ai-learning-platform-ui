import { useGetDashboardQuery } from '@/store/api/dashboardApi';
import { useGetMyBadgesQuery } from '@/store/api/gamificationApi';
import { useGetReviewQueueQuery } from '@/store/api/assessmentApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import XPBar from '@/components/gamification/XPBar';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import StreakTracker from '@/components/gamification/StreakTracker';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Brain,
  Clock,
  Flame,
  Trophy,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, getMasteryColor } from '@/lib/utils';

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useGetDashboardQuery();
  const { data: badges } = useGetMyBadgesQuery();
  const { data: reviewQueue } = useGetReviewQueueQuery();

  if (isLoading || !dashboard) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total XP', value: dashboard.totalXp.toLocaleString(), icon: Sparkles, color: 'text-yellow-500' },
    { label: 'Concepts Mastered', value: dashboard.totalConceptsMastered, icon: Brain, color: 'text-green-500' },
    { label: 'Courses Enrolled', value: dashboard.totalCoursesEnrolled, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Learning Hours', value: dashboard.totalLearningHours, icon: Clock, color: 'text-purple-500' },
  ];

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your learning progress and achievements</p>
      </div>

      {/* XP Bar */}
      <XPBar currentXP={dashboard.totalXp} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-5 w-5 text-orange-500" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreakTracker
              currentStreak={dashboard.currentStreak}
              longestStreak={dashboard.longestStreak}
            />
          </CardContent>
        </Card>

        {/* Weak Areas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Concepts to Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.weakAreas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No weak areas detected. Keep up the great work!
              </p>
            ) : (
              <div className="space-y-3">
                {dashboard.weakAreas.slice(0, 5).map((area) => (
                  <div key={area.conceptId} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{area.conceptTitle}</p>
                      <p className="text-xs text-muted-foreground">{area.courseName}</p>
                    </div>
                    <div className="w-24">
                      <Progress value={area.weaknessScore * 100} className="h-1.5" />
                    </div>
                    <span className={cn('text-xs font-medium', getMasteryColor(1 - area.weaknessScore))}>
                      {Math.round(area.weaknessScore * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Spaced Repetition Review Queue */}
      {reviewQueue && reviewQueue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RotateCcw className="h-5 w-5 text-indigo-500" />
              Due for Review
              <span className="ml-auto text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                {reviewQueue.length} concept{reviewQueue.length !== 1 ? 's' : ''}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewQueue.slice(0, 5).map((item) => (
                <div key={item.conceptId} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.conceptTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      Mastery: {Math.round(item.masteryLevel * 100)}%
                    </p>
                  </div>
                  <div className="w-24">
                    <Progress value={item.masteryLevel * 100} className="h-1.5" />
                  </div>
                  <span className={cn('text-xs font-medium', getMasteryColor(item.masteryLevel))}>
                    Review
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrolled Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5 text-blue-500" />
            My Courses
          </CardTitle>
          <Link to="/courses">
            <Button variant="ghost" size="sm">
              Browse More <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {dashboard.enrolledCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-3">You haven't enrolled in any courses yet.</p>
              <Link to="/courses">
                <Button>Explore Courses</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard.enrolledCourses.map((course) => (
                <Link
                  key={course.courseId}
                  to={`/courses/${course.courseId}/learn`}
                  className="block group"
                >
                  <div className="rounded-lg border p-4 hover:shadow-md transition-all">
                    <div className="aspect-video rounded-md bg-muted mb-3 overflow-hidden">
                      {course.thumbnailUrl ? (
                        <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <BookOpen className="h-8 w-8 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                      {course.courseTitle}
                    </h4>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(course.progress)}%</span>
                      </div>
                      <Progress value={course.progress} className="h-1.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges */}
      {badges && badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeDisplay badges={badges} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
