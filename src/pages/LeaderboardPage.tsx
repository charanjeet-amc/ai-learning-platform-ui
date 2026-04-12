import Leaderboard from '@/components/gamification/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">
          Top learners ranked by total XP earned
        </p>
      </div>
      <Leaderboard />
    </div>
  );
}
