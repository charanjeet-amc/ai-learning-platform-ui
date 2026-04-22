import { useGetDashboardQuery } from '@/store/api/dashboardApi';
import { useGetMyCertificatesQuery, useGenerateCertificateMutation } from '@/store/api/certificateApi';
import { useGetMyBadgesQuery } from '@/store/api/gamificationApi';
import { useGetReviewQueueQuery } from '@/store/api/assessmentApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import XPBar from '@/components/gamification/XPBar';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import StreakTracker from '@/components/gamification/StreakTracker';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Brain,
  Flame,
  Trophy,
  AlertTriangle,
  ArrowRight,
  Download,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, getMasteryColor } from '@/lib/utils';

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useGetDashboardQuery();
  const { data: badges } = useGetMyBadgesQuery();
  const { data: reviewQueue } = useGetReviewQueueQuery();
  const { data: certificates } = useGetMyCertificatesQuery();
  const [generateCertificate] = useGenerateCertificateMutation();

  const apiBase = import.meta.env.VITE_API_URL ?? '';
  const certMap = new Map(certificates?.map((c) => [c.courseId, c]) ?? []);

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
    { label: 'Concepts Mastered', value: dashboard.weakAreas.filter(a => a.status === 'MASTERED').length, icon: Brain, color: 'text-green-500' },
    { label: 'Courses Enrolled', value: dashboard.enrolledCourses.length, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Rank', value: dashboard.rank > 0 ? `#${dashboard.rank}` : 'N/A', icon: Trophy, color: 'text-purple-500' },
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
                    </div>
                    <div className="w-24">
                      <Progress value={(area.masteryLevel ?? 0) * 100} className="h-1.5" />
                    </div>
                    <span className={cn('text-xs font-medium', getMasteryColor(area.masteryLevel ?? 0))}>
                      {Math.round((area.masteryLevel ?? 0) * 100)}%
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
              {dashboard.enrolledCourses.map((course) => {
                const cert = certMap.get(course.courseId);
                return (
                  <div key={course.courseId} className="rounded-lg border p-4 hover:shadow-md transition-all">
                    <Link to={`/courses/${course.courseId}/learn`} className="block group">
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
                          <span className="font-medium">{Math.round(course.progressPercent ?? 0)}%</span>
                        </div>
                        <Progress value={course.progressPercent ?? 0} className="h-1.5" />
                      </div>
                    </Link>
                    {(course.progressPercent ?? 0) >= 100 && (
                      <div className="mt-3 pt-3 border-t flex gap-2">
                        {cert ? (
                          <>
                            <Link to={`/certificates/${cert.verificationCode}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full text-xs border-yellow-500/60 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950">
                                <Award className="h-3 w-3 mr-1" /> View Certificate
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs px-2"
                              onClick={() => window.open(`${apiBase}/api/public/certificates/${cert.verificationCode}/download`, '_blank')}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs border-yellow-500/60 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                            onClick={() => generateCertificate(course.courseId)}
                          >
                            <Award className="h-3 w-3 mr-1" /> Get Certificate
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates */}
      {certificates && certificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-5 w-5 text-yellow-500" />
              My Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="rounded-lg border border-yellow-500/30 bg-gradient-to-br from-indigo-950/40 to-purple-950/20 p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <Award className="h-8 w-8 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{cert.courseTitle}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/certificates/${cert.verificationCode}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs border-yellow-500/40 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => window.open(`${apiBase}/api/public/certificates/${cert.verificationCode}/download`, '_blank')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* XP Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            How XP Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Experience Points (XP) measure your learning activity. Earn XP to level up, climb the leaderboard, and unlock badges.
          </p>
          <div>
            <h4 className="text-sm font-semibold mb-2">Earning XP</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm rounded-lg border p-3">
                <span>Correct quiz answer (first time)</span>
                <span className="font-bold text-yellow-600">+10 XP</span>
              </div>
              <div className="flex items-center justify-between text-sm rounded-lg border p-3">
                <span>Master a concept (≥85% mastery)</span>
                <span className="font-bold text-yellow-600">+50 XP</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Levels</h4>
            <p className="text-sm text-muted-foreground">
              Each level requires progressively more XP. Level 1 needs 500 XP, Level 2 needs 1,000 XP, and so on. Your level is shown in the XP bar above.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Leaderboard</h4>
            <p className="text-sm text-muted-foreground">
              Your total XP determines your rank on the <a href="/leaderboard" className="text-primary hover:underline">leaderboard</a>. Compete with other learners and track your standing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
