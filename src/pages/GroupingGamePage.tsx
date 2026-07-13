import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGroups } from '@/lib/group-context';
import { useAuth } from '@/lib/auth';
import DemoBadge from '@/components/DemoBadge';
import { Anchor, Calendar, ChevronRight, Info, Trophy, Users } from 'lucide-react';

const GroupingGamePage = () => {
  const navigate = useNavigate();
  const { games, instances, mySlips } = useGroups();
  const { user } = useAuth();

  const myInstances = instances.filter(i => user && i.memberIds.includes(user.id));

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Anchor size={24} /> Grouping Game
        </h1>
        <DemoBadge />
      </div>

      {/* Spec explainer */}
      <div className="bg-secondary/40 border border-border rounded-lg p-3 text-xs text-muted-foreground space-y-1.5">
        <div className="flex items-start gap-2">
          <Info size={14} className="text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-foreground font-semibold text-sm">How it works</p>
            <p>• Pirate Parlays creates the games — you don't create your own.</p>
            <p>• Pick winners or losers from the schedule and fill out your own slip.</p>
            <p>• Choose a wager (<span className="text-primary font-semibold">$5 / $10 / $20</span>) and a group size (<span className="text-primary font-semibold">10 / 25 / 50</span>).</p>
            <p>• You'll be placed <span className="text-primary font-semibold">randomly</span> into a matching group.</p>
            <p>• A group with <span className="text-primary font-semibold">5 or more</span> bettors proceeds; fewer than 5 is null-and-void.</p>
          </div>
        </div>
      </div>

      {/* My active entries */}
      {myInstances.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-1">My Entries</p>
          {myInstances.map(inst => {
            const game = games.find(g => g.id === inst.gameId);
            const statusCfg = statusConfig[inst.status];
            return (
              <Card key={inst.id} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate(`/groups/${inst.id}`)}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{game?.name}</p>
                    <p className="text-xs text-muted-foreground">${inst.wager} • up to {inst.groupSize} • {inst.memberIds.length} joined</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`text-[10px] ${statusCfg.color}`}>{statusCfg.label}</Badge>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* System-created games */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-1">Games from Pirate Parlays</p>
        {games.map(game => {
          const openInsts = instances.filter(i => i.gameId === game.id && (i.status === 'forming' || i.status === 'proceeding'));
          const totalBettors = openInsts.reduce((sum, i) => sum + i.memberIds.length, 0);
          return (
            <Card key={game.id} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate(`/groups/game/${game.id}`)}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{game.name}</h3>
                      <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">{game.sport}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Calendar size={12} /> Entry closes {new Date(game.entryCloses).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border">
                  <span className="flex items-center gap-1"><Trophy size={12} /> {game.schedule.length} matches</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {totalBettors} bettors across {openInsts.length} group{openInsts.length !== 1 ? 's' : ''}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {mySlips.length === 0 && (
        <p className="text-xs text-center text-muted-foreground pt-2">Tap a game above to fill out your own slip.</p>
      )}
    </div>
  );
};

export const statusConfig: Record<string, { color: string; label: string }> = {
  forming: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/40', label: 'Forming' },
  proceeding: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', label: 'Proceeding' },
  null_and_void: { color: 'bg-destructive/20 text-destructive border-destructive/40', label: 'Null & Void' },
  settled: { color: 'bg-muted text-muted-foreground border-border', label: 'Settled' },
};

export default GroupingGamePage;
