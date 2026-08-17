import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MOCK_LEADERBOARD } from '@/lib/mock-social';
import RankBadge from '@/components/RankBadge';
import { Trophy, Flame, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const LeaderboardPage = () => {
  const { user } = useAuth();

  // Simulate different leaderboards with shuffled data
  const daily = [...MOCK_LEADERBOARD].sort((a, b) => b.winStreak - a.winStreak).map((e, i) => ({ ...e, rank: i + 1 }));
  const weekly = [...MOCK_LEADERBOARD].sort((a, b) => b.winRate - a.winRate).map((e, i) => ({ ...e, rank: i + 1 }));
  const allTime = MOCK_LEADERBOARD;

  const renderTable = (data: typeof MOCK_LEADERBOARD) => (
    <div className="space-y-2">
      {data.map(entry => {
        const isMe = entry.username === user?.username;
        return (
          <div key={entry.username} className={`flex items-center gap-3 p-3 rounded-lg ${isMe ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/30'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
              entry.rank === 1 ? 'bg-warning text-warning-foreground' :
              entry.rank === 2 ? 'bg-muted text-foreground' :
              entry.rank === 3 ? 'bg-warning/50 text-warning-foreground' :
              'bg-secondary text-muted-foreground'
            }`}>
              {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${isMe ? 'text-primary' : ''}`}>{entry.username}</span>
                <RankBadge rank={entry.pirateRank} />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
              <div className="text-center hidden sm:block">
                <p className="text-foreground font-semibold">{entry.winRate}%</p>
                <p>Win</p>
              </div>
              <div className="text-center">
                <p className="text-foreground font-semibold flex items-center gap-1">{entry.winStreak} <Flame size={12} className="text-warning" /></p>
                <p>Streak</p>
              </div>
              <div className="text-center">
                <p className="text-primary font-bold">{entry.xp.toLocaleString()}</p>
                <p>XP</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Trophy className="text-warning" /> Leaderboard</h1>
      </div>
      <Tabs defaultValue="alltime">
        <TabsList className="w-full">
          <TabsTrigger value="daily" className="flex-1">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1">Weekly</TabsTrigger>
          <TabsTrigger value="alltime" className="flex-1">All-time</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">{renderTable(daily)}</TabsContent>
        <TabsContent value="weekly">{renderTable(weekly)}</TabsContent>
        <TabsContent value="alltime">{renderTable(allTime)}</TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardPage;
