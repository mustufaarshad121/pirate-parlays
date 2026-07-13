import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import {
  GROUP_SIZE_OPTIONS,
  WAGER_OPTIONS,
  useGroups,
  type GroupSizeOption,
  type Pick,
  type WagerOption,
} from '@/lib/group-context';
import DemoBadge from '@/components/DemoBadge';
import { ArrowLeft, Calendar, CheckCircle2, Info, Trophy, Users } from 'lucide-react';

const GameEntryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGame, submitSlip, estimatedPayoutRange, instances } = useGroups();
  const { user } = useAuth();
  const { toast } = useToast();

  const game = getGame(id || '');
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [wager, setWager] = useState<WagerOption>(5);
  const [groupSize, setGroupSize] = useState<GroupSizeOption>(10);

  const est = useMemo(() => {
    const existing = instances.find(
      i => i.gameId === id && i.wager === wager && i.groupSize === groupSize && i.status !== 'settled',
    );
    const currentMembers = existing ? existing.memberIds.length + 1 : 1;
    return estimatedPayoutRange(wager, groupSize, currentMembers);
  }, [instances, id, wager, groupSize, estimatedPayoutRange]);

  if (!game) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Game not found. <Button variant="link" onClick={() => navigate('/groups')}>Back to Games</Button>
      </div>
    );
  }

  const allPicked = game.schedule.every(m => picks[m.id]);
  const canAfford = (user?.balance ?? 0) >= wager;

  const setPick = (matchId: string, p: Pick) => setPicks(prev => ({ ...prev, [matchId]: p }));

  const handleSubmit = () => {
    const result = submitSlip({ gameId: game.id, picks, wager, groupSize });
    if (!result.ok) {
      toast({ title: 'Could not submit slip', description: result.error, variant: 'destructive' });
      return;
    }
    toast({
      title: 'Slip submitted! 🏴‍☠️',
      description: `$${wager} entered. You'll be randomly grouped with matching bettors.`,
    });
    if (result.instanceId) navigate(`/groups/${result.instanceId}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-display font-bold truncate">{game.name}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar size={12} /> Entry closes {new Date(game.entryCloses).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <DemoBadge />
      </div>

      {/* Slip: pick winner or loser per match */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2"><Trophy size={14} /> Your Slip</CardTitle>
          <span className="text-xs text-muted-foreground">{Object.keys(picks).length}/{game.schedule.length} picks</span>
        </CardHeader>
        <CardContent className="space-y-2">
          {game.schedule.map((m, idx) => {
            const pick = picks[m.id];
            return (
              <div key={m.id} className="bg-secondary/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Match {idx + 1} • {m.startTime}
                  </p>
                </div>
                <p className="text-sm font-medium mb-2">{m.homeTeam} vs {m.awayTeam}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={pick === 'winner' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => setPick(m.id, 'winner')}
                  >
                    Pick Winner
                  </Button>
                  <Button
                    variant={pick === 'loser' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => setPick(m.id, 'loser')}
                  >
                    Pick Loser
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Wager */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Wager Amount</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {WAGER_OPTIONS.map(w => (
              <button
                key={w}
                onClick={() => setWager(w)}
                className={`p-3 rounded-lg border-2 transition-colors text-center ${
                  wager === w ? 'border-primary bg-primary/10' : 'border-border hover:border-border/70'
                }`}
              >
                <p className="font-display font-bold text-lg">${w}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Group size */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Group Size</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {GROUP_SIZE_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setGroupSize(s)}
                className={`p-3 rounded-lg border-2 transition-colors text-center ${
                  groupSize === s ? 'border-primary bg-primary/10' : 'border-border hover:border-border/70'
                }`}
              >
                <p className="font-display font-bold text-lg">{s}</p>
                <p className="text-[10px] text-muted-foreground">people</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
            <Info size={12} className="mt-0.5 shrink-0" />
            <span>Group proceeds with any <span className="text-primary font-semibold">5+</span> bettors even if below the selected max. Fewer than 5 is null-and-void.</span>
          </p>
        </CardContent>
      </Card>

      {/* Estimated payout — DEMO ONLY */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Estimated Payout</span>
            <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">Demo estimate</Badge>
          </div>
          <p className="text-lg font-display font-bold text-primary">
            ${est.low.toFixed(2)} – ${est.high.toFixed(2)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Illustrative range only. Final scoring, winner determination, payout formula, ties, fees, and null-and-void wallet handling are pending client confirmation and are <span className="text-warning">not implemented</span> in this demo.
          </p>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="sticky bottom-0 md:static bg-background/95 backdrop-blur pt-2 -mx-4 md:mx-0 px-4 md:px-0 pb-2">
        <Button
          className="w-full h-12 text-base"
          onClick={handleSubmit}
          disabled={!allPicked || !canAfford}
        >
          {!allPicked ? (
            `Pick all ${game.schedule.length} matches to continue`
          ) : !canAfford ? (
            `Need $${wager} — balance $${user?.balance.toFixed(2)}`
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle2 size={18} /> Submit Slip — ${wager}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default GameEntryPage;
