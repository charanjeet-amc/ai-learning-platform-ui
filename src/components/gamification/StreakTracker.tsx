import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakTracker({ currentStreak, longestStreak }: StreakTrackerProps) {
  // Show last 7 days - mock active days
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay(); // 0 = Sunday

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className={cn('h-5 w-5', currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground')} />
          <span className="font-bold text-lg">{currentStreak} day streak</span>
        </div>
        <span className="text-xs text-muted-foreground">Best: {longestStreak} days</span>
      </div>
      <div className="flex justify-between gap-1">
        {days.map((day, i) => {
          // Simple logic: if currentStreak covers this day
          const dayIndex = i + 1; // Mon=1
          const isActive = currentStreak >= (7 - i);
          const isToday = dayIndex === (today === 0 ? 7 : today);
          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                  isActive && 'bg-orange-500 text-white',
                  !isActive && isToday && 'border-2 border-orange-500/50',
                  !isActive && !isToday && 'bg-muted text-muted-foreground'
                )}
              >
                {isActive ? <Flame className="h-4 w-4" /> : day.charAt(0)}
              </div>
              <span className="text-[10px] text-muted-foreground">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
