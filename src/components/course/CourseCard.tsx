import { Link } from 'react-router-dom';
import type { Course } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Star, Users } from 'lucide-react';
import { cn, getDifficultyColor, formatDuration } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  progress?: number;
}

export default function CourseCard({ course, progress }: CourseCardProps) {
  return (
    <Link to={`/courses/${course.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <BookOpen className="h-12 w-12 text-primary/40" />
            </div>
          )}
          <span
            className={cn(
              'absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium',
              getDifficultyColor(course.difficulty)
            )}
          >
            {course.difficulty}
          </span>
        </div>

        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            {course.category && (
              <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {course.category}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {course.shortDescription || course.description}
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              {course.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course.enrollmentCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(course.estimatedHours * 60)}
            </span>
          </div>
        </CardContent>

        {progress !== undefined && (
          <CardFooter className="px-4 pb-4 pt-0">
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
