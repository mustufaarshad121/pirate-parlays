import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import {
  useGroup, useMyPicks, useSlate, useSlateEvents, useSubmitPicks, type Selection,
} from '@/lib/groups';
import { ArrowLeft, CheckCircle2, Loader2, Lock } from 'lucide-react';

const PicksPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: group, isLoading } = useGroup(id);
  const { data: slate } = useSlate(group?.slate_id);
  const { data: events, isLoading: eventsLoading } = useSlateEvents(group?.slate_id);
  const { data: savedPicks } = useMyPicks(id, user?.id);
  const submit = useSubmitPicks();

  const [picks, setPicks] = useState<Record<string, Selection>>({});
  const [step, setStep] = useState<'build' | 'review'>('build');

  useEffect(() => { if (savedPicks) setPicks(savedPicks); }, [savedPicks]);

  const total = events?.length ?? 0;
  const chosen = Object.keys(picks).length;
  const complete = total > 0 && chosen === total;
  const locked = group ? group.status !== 'open' : false;
  const lockAt = slate ? new Date(slate.lock_at) : null;
  const pastLock = !!lockAt && lockAt.getTime() <= Date.now();

  const summary = useMemo(
    () => (events ?? []).map(e => ({ event: e, pick: picks[e.id] })),
    [events, picks],
  );

  if (isLoading || eventsLoading) {
    return <div className="max-w-2xl mx-auto space-y-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  }

  if (!group) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-3">
        <p className="text-sm text-muted-foreground">We couldn't load this group.</p>
        <Button onClick={() => navigate('/groups')}>Back to Groups</Button>
      </div>
    );
  }

  const save = async () => {
    try {
      await submit.mutateAsync({ groupId: group.id, picks });
      toast.success('Your picks are saved.');
      navigate(`/groups/${group.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Picks could not be saved.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-28">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/groups/${group.id}`)}><ArrowLeft size={20} /></Button>
        <div className="min-w-0">
          <h1 className="text-xl font-display font-bold truncate">{slate?.name ?? 'Your picks'}</h1>
          <p className="text-xs text-muted-foreground">
            Your own slip — every player in this group picks separately.
          </p>
        </div>
      </div>

      {(locked || pastLock) && (
        <div className="bg-secondary/50 border border-border rounded-lg p-3 text-sm flex items-start gap-2">
          <Lock size={16} className="text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            This group is locked. Picks can no longer be changed.
          </p>
        </div>
      )}

      {step === 'build' ? (
        <>
          {total === 0 ? (
            <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">
              No matchups have been added to this game yet.
            </CardContent></Card>
          ) : (
            events!.map((e, i) => (
              <Card key={e.id}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Game {i + 1}
                      {e.starts_at ? ` • ${new Date(e.starts_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}
                    </p>
                    {picks[e.id] && <CheckCircle2 size={14} className="text-primary" />}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['home', 'away'] as Selection[]).map(side => (
                      <button
                        key={side}
                        disabled={locked || pastLock}
                        onClick={() => setPicks(p => ({ ...p, [e.id]: side }))}
                        className={`py-3 px-2 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-50 ${
                          picks[e.id] === side
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        {side === 'home' ? e.home_team : e.away_team}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </>
      ) : (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Review your slip</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {summary.map(({ event, pick }, i) => (
              <div key={event.id} className="flex items-center justify-between text-xs bg-secondary/30 rounded p-2 gap-2">
                <span className="text-muted-foreground truncate">{i + 1}. {event.home_team} vs {event.away_team}</span>
                <Badge variant="outline" className={`text-[10px] ${pick ? 'border-primary/40 text-primary' : 'border-border text-muted-foreground'}`}>
                  {pick ? (pick === 'home' ? event.home_team : event.away_team) : 'No pick'}
                </Badge>
              </div>
            ))}
            <div className="pt-2 text-xs text-muted-foreground space-y-1">
              <p>Entry: <span className="text-foreground font-semibold">${Number(group.entry_amount)}</span></p>
              <p>Group size: <span className="text-foreground font-semibold">{group.group_size} players</span></p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Estimated Cash Payout</CardTitle>
          <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">Pending</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Estimated payout pending final payout formula confirmation.</p>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <div className="flex-1 text-xs text-muted-foreground">{chosen} of {total} picks made</div>
          {step === 'build' ? (
            <Button disabled={!complete || locked || pastLock} onClick={() => setStep('review')}>Review slip</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('build')}>Back</Button>
              <Button disabled={!complete || submit.isPending || locked || pastLock} onClick={save}>
                {submit.isPending && <Loader2 className="animate-spin mr-2" size={16} />} Submit picks
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PicksPage;
