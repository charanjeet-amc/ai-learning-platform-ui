import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';

interface XPBarProps {
  currentXP: number;
  className?: string;
}

function getLevel(xp: number): { level: number; currentLevelXP: number; nextLevelXP: number } {
  // XP thresholds: level N requires N * 500 XP from previous level
  let level = 1;
  let accumulated = 0;
  while (accumulated + level * 500 <= xp) {
    accumulated += level * 500;
    level++;
  }
  return {
    level,
    currentLevelXP: xp - accumulated,
    nextLevelXP: level * 500,
  };
}

export default function XPBar({ currentXP, className }: XPBarProps) {
  const { level, currentLevelXP, nextLevelXP } = getLevel(currentXP);
  const progress = (currentLevelXP / nextLevelXP) * 100;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-bold">Level {level}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {currentLevelXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
        </span>
      </div>
      <Progress value={progress} className="h-2.5" />
      <p className="text-xs text-muted-foreground mt-1">
        Total: {currentXP.toLocaleString()} XP
      </p>
    </div>
  );
}
