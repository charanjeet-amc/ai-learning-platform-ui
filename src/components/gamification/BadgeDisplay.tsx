import type { Badge } from '@/types';
import { Award, Flame, Star, Trophy, Bot, Gem, Crown, Zap, BookOpen, Users, Moon, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  'rocket': <Zap className="h-6 w-6" />,
  'zap': <Zap className="h-6 w-6" />,
  'book-open': <BookOpen className="h-6 w-6" />,
  'graduation-cap': <GraduationCap className="h-6 w-6" />,
  'award': <Award className="h-6 w-6" />,
  'flame': <Flame className="h-6 w-6" />,
  'star': <Star className="h-6 w-6" />,
  'bot': <Bot className="h-6 w-6" />,
  'brain': <Trophy className="h-6 w-6" />,
  'gem': <Gem className="h-6 w-6" />,
  'crown': <Crown className="h-6 w-6" />,
  'users': <Users className="h-6 w-6" />,
  'moon': <Moon className="h-6 w-6" />,
};

const categoryColors: Record<string, string> = {
  MILESTONE: 'from-blue-500 to-blue-600',
  COURSE: 'from-purple-500 to-purple-600',
  STREAK: 'from-orange-500 to-orange-600',
  ASSESSMENT: 'from-green-500 to-green-600',
  AI: 'from-cyan-500 to-cyan-600',
  XP: 'from-yellow-500 to-yellow-600',
  SOCIAL: 'from-pink-500 to-pink-600',
  FUN: 'from-indigo-500 to-indigo-600',
};

interface BadgeDisplayProps {
  badges: Badge[];
}

export default function BadgeDisplay({ badges }: BadgeDisplayProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {badges.map((badge) => {
        const earned = !!badge.earnedAt;
        return (
          <div
            key={badge.id}
            className={cn(
              'flex flex-col items-center text-center p-3 rounded-xl transition-all',
              earned ? 'opacity-100' : 'opacity-40 grayscale'
            )}
          >
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br mb-2',
                categoryColors[badge.category] || 'from-gray-500 to-gray-600',
                earned && 'animate-pulse-glow'
              )}
            >
              {iconMap[badge.icon] || <Trophy className="h-6 w-6" />}
            </div>
            <p className="text-xs font-medium line-clamp-1">{badge.name}</p>
            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{badge.description}</p>
          </div>
        );
      })}
    </div>
  );
}
