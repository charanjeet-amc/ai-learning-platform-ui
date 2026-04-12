import type { LeaderboardEntry } from '@/types';
import { useGetLeaderboardQuery } from '@/store/api/gamificationApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Medal, Award, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Leaderboard() {
  const { data: entries, isLoading } = useGetLeaderboardQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1 h-4 bg-muted rounded" />
                <div className="w-16 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-700" />;
      default: return <span className="w-5 text-center text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {entries?.map((entry: LeaderboardEntry) => (
              <div
                key={entry.userId}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-colors',
                  entry.rank <= 3 ? 'bg-primary/5' : 'hover:bg-accent'
                )}
              >
                <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {entry.avatarUrl ? (
                    <img src={entry.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.displayName}</p>
                  <p className="text-xs text-muted-foreground">{entry.badgeCount} badges</p>
                </div>
                <span className="text-sm font-bold text-primary">{entry.totalXp.toLocaleString()} XP</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
