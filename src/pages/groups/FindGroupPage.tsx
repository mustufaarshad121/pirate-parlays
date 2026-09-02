import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  useGroupsConfig,
  useQuickMatch,
  useSlateAvailability,
  useSlateEvents,
  useSlates,
} from '@/lib/groups';
import { ArrowLeft, Calendar, Loader2, Shuffle, Trophy } from 'lucide-react';

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

const FindGroupPage = () => {
  const navigate = useNavigate();

  const { data: config, isLoading: configLoading } = useGroupsConfig();
  const { data: slates, isLoading: slatesLoading, isError, refetch } = useSlates();
  const { data: availability } = useSlateAvailability();

  const [slateId, setSlateId] = useState<string>('');
  const [entry, setEntry] = useState<number | null>(null);
  const [size, setSize] = useState<number | null>(null);

  const { data: events } = useSlateEvents(slateId || undefined);
  const quickMatch = useQuickMatch();
  const busy = quickMatch.isPending;

  const slate = useMemo(() => slates?.find(s => s.id === slateId), [slates, slateId]);
  const ready = !!slateId && entry !== null && size !== null;

  const submit = async () => {
    if (!ready) return;
    try {
      const groupId = await quickMatch.mutateAsync({ slateId, entry: entry!, size: size! });
      navigate(`/groups/${groupId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not join a group.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}><ArrowLeft size={20} /></Button>
        <div>
          <h1 className="text-xl font-display font-bold">Enter a Grouping Game</h1>
          <p className="text-xs text-muted-foreground">
            Choose your game, entry amount and group size — placement is random among matching bettors.
          </p>
        </div>
      </div>

      {/* Step 1 — game */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">1. Select a game</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {slatesLoading ? (
            [0, 1].map(i => <Skeleton key={i} className="h-16 w-full" />)
          ) : isError ? (
            <div className="text-center space-y-2 py-2">
              <p className="text-sm text-muted-foreground">We couldn't load the games.</p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
            </div>
          ) : (slates?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">No games are open for entries right now.</p>
          ) : (
            slates!.map(s => (
              <button
                key={s.id}
                onClick={() => setSlateId(s.id)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  slateId === s.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} /> Locks {fmt(s.lock_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">{s.league}</Badge>
                    {availability?.[s.id] ? (
                      <span className="text-[10px] text-muted-foreground">{availability[s.id]} open</span>
                    ) : null}
                  </div>
                </div>
              </button>
            ))
          )}
          {slate && events && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
              <Trophy size={12} /> {events.length} matchup{events.length === 1 ? '' : 's'} on this slate
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 2 — entry */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">2. Select your entry amount</CardTitle></CardHeader>
        <CardContent>
          {configLoading ? (
            <Skeleton className="h-11 w-full" />
          ) : (config?.entryAmounts.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Entry amounts are not configured yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {config!.entryAmounts.map(a => (
                <button
                  key={a}
                  onClick={() => setEntry(a)}
                  className={`py-3 rounded-lg border font-bold transition-colors ${
                    entry === a ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  ${a}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3 — size */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">3. Select your group size</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {configLoading ? (
            <Skeleton className="h-11 w-full" />
          ) : (config?.groupSizes.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Group sizes are not configured yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {config!.groupSizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`py-3 rounded-lg border font-bold transition-colors ${
                    size === s ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {s} people max
                </button>
              ))}
            </div>
          )}
          {config?.minimumPlayers != null && (
            <p className="text-xs text-muted-foreground">
              A group needs at least {config.minimumPlayers} real bettors to proceed, even if the {'{'}maximum{'}'} is not filled.
              Fewer than {config.minimumPlayers} is null and void — no company or AI filler slips are ever added.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Estimated Cash Payout</CardTitle>
          <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">Pending</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Estimated payout pending final payout formula confirmation.</p>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 md:static bg-background/95 backdrop-blur border-t border-border md:border-0 p-3 md:p-0">
        <div className="max-w-2xl mx-auto">
          <Button className="w-full h-12 text-base font-bold" disabled={!ready || busy} onClick={submit}>
            {busy ? <Loader2 className="animate-spin mr-2" size={18} /> : <Shuffle size={18} className="mr-2" />}
            Submit my entry
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FindGroupPage;
