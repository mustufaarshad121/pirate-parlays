import { useState } from 'react';
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
import { ArrowLeft, Calendar, CheckCircle2, Info, Trophy, X } from 'lucide-react';

const GameEntryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGame, submitSlip } = useGroups();
  const { user } = useAuth();
  const { toast } = useToast();

  const game = getGame(id || '');
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [wager, setWager] = useState<WagerOption | null>(null);
  const [groupSize, setGroupSize] = useState<GroupSizeOption | null>(null);
  const [step, setStep] = useState<'build' | 'review'>('build');

  if (!game) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Game not found. <Button variant="link" onClick={() => navigate('/groups')}>Back to Grouping Game</Button>
      </div>
    );
  }

  const allPicked = game.schedule.length > 0 && game.schedule.every(m => picks[m.id]);
  const canAfford = wager !== null && (user?.balance ?? 0) >= wager;
  const readyToReview = allPicked && wager !== null && groupSize !== null;

  const setPick = (matchId: string, p: Pick) =>
    setPicks(prev => (prev[matchId] === p ? prev : { ...prev, [matchId]: p }));
  const clearPick = (matchId: string) =>
    setPicks(prev => {
      const next = { ...prev };
      delete next[matchId];
      return next;
    });

  const handleSubmit = () => {
    if (wager === null || groupSize === null) return;
    const result = submitSlip({ gameId: game.id, picks, wager, groupSize });
    if (!result.ok) {
      toast({ title: 'Could not submit entry', description: result.error, variant: 'destructive' });
      return;
    }
    toast({
      title: 'Entry submitted 🏴‍☠️',
      description: `$${wager} entered. You have been placed randomly into a matching group.`,
    });
    if (result.instanceId) navigate(`/groups/${result.instanceId}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => (step === 'review' ? setStep('build') : navigate('/groups'))}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-display font-bold truncate">{game.name}</h1>
          {game.entryCloses && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar size={12} /> Entry closes{' '}
              {new Date(game.entryCloses).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <Badge variant="outline" className="text-[10px]">{step === 'build' ? 'Step 1 — Build' : 'Step 2 — Review'}</Badge>
      </div>

      {step === 'build' ? (
        <>
          {/* Schedule — user makes their own selections */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><Trophy size={14} /> Schedule</CardTitle>
              <span className="text-xs text-muted-foreground">{Object.keys(picks).length}/{game.schedule.length} selections</span>
            </CardHeader>
            <CardContent className="space-y-2">
              {game.schedule.map((m, idx) => {
                const pick = picks[m.id];
                return (
                  <div key={m.id} className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      Match {idx + 1}{m.startTime ? ` • ${m.startTime}` : ''}
                    </p>
                    <p className="text-sm font-medium mb-2">{m.homeTeam} vs {m.awayTeam}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant={pick === 'winner' ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setPick(m.id, 'winner')}>
                        Pick Winner
                      </Button>
                      <Button variant={pick === 'loser' ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setPick(m.id, 'loser')}>
                        Pick Loser
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Personal slip summary — live */}
          <Card className="border-primary/30">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Your Slip</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {Object.keys(picks).length === 0 ? (
                <p className="text-xs text-muted-foreground">No selections yet. Your picks appear here as you make them.</p>
              ) : (
                game.schedule
                  .filter(m => picks[m.id])
                  .map((m, i) => (
                    <div key={m.id} className="flex items-center justify-between gap-2 text-xs bg-secondary/30 rounded p-2">
                      <span className="text-muted-foreground truncate">{i + 1}. {m.homeTeam} vs {m.awayTeam}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant="outline" className={`text-[10px] ${picks[m.id] === 'winner' ? 'border-primary/40 text-primary' : 'border-destructive/40 text-destructive'}`}>
                          {picks[m.id] === 'winner' ? 'Winner' : 'Loser'}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => clearPick(m.id)} aria-label="Remove selection">
                          <X size={12} />
                        </Button>
                      </div>
                    </div>
                  ))
              )}
              <p className="text-[11px] text-muted-foreground pt-1">This is your personal slip. Every bettor in your group fills out their own.</p>
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
                <span>This is the selected capacity, not a requirement. A group proceeds with <span className="text-primary font-semibold">5 or more</span> bettors; fewer than 5 is null and void.</span>
              </p>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 md:static bg-background/95 backdrop-blur pt-2 -mx-4 md:mx-0 px-4 md:px-0 pb-2">
            <Button className="w-full h-12 text-base" disabled={!readyToReview} onClick={() => setStep('review')}>
              {!allPicked
                ? `Make all ${game.schedule.length} selections to continue`
                : wager === null
                  ? 'Choose a wager to continue'
                  : groupSize === null
                    ? 'Choose a group size to continue'
                    : 'Review entry'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Review Your Entry</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {game.schedule.map((m, i) => (
                <div key={m.id} className="flex items-center justify-between text-xs bg-secondary/30 rounded p-2">
                  <span className="text-muted-foreground truncate">{i + 1}. {m.homeTeam} vs {m.awayTeam}</span>
                  <Badge variant="outline" className={`text-[10px] ${picks[m.id] === 'winner' ? 'border-primary/40 text-primary' : 'border-destructive/40 text-destructive'}`}>
                    {picks[m.id] === 'winner' ? 'Winner' : 'Loser'}
                  </Badge>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-secondary/30 rounded p-2 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Wager</p>
                  <p className="font-display font-bold">${wager}</p>
                </div>
                <div className="bg-secondary/30 rounded p-2 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Group Size</p>
                  <p className="font-display font-bold">{groupSize} people</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-2" onClick={() => setStep('build')}>
                Edit selections
              </Button>
            </CardContent>
          </Card>

          {/* Estimated cash payout — no confirmed formula, so no number is shown */}
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Estimated Cash Payout</span>
                <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">Pending</Badge>
              </div>
              <p className="text-sm text-foreground">Estimated payout pending final payout formula confirmation.</p>
              <p className="text-[11px] text-muted-foreground">
                No payout calculation, platform fee, winner allocation, or tie handling has been configured, so no amount is displayed here.
              </p>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 md:static bg-background/95 backdrop-blur pt-2 -mx-4 md:mx-0 px-4 md:px-0 pb-2">
            <Button className="w-full h-12 text-base" onClick={handleSubmit} disabled={!canAfford}>
              {!canAfford ? (
                `Need $${wager} — balance $${user?.balance.toFixed(2)}`
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={18} /> Submit Entry — ${wager}
                </span>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-1">
              After submitting, the system places you randomly into a matching group.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default GameEntryPage;
