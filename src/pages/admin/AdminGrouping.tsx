import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { STATUS_LABEL, applyDueLocks, useGroupsConfig, type Group, type Slate } from '@/lib/groups';
import { Anchor, Info, Lock, Plus, Trash2, Users } from 'lucide-react';

const LEAGUES = ['NFL', 'NBA', 'EPL'];

interface DraftMatch { homeTeam: string; awayTeam: string; startsAt: string }
const emptyMatch: DraftMatch = { homeTeam: '', awayTeam: '', startsAt: '' };

const AdminGrouping = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: config } = useGroupsConfig();

  const [name, setName] = useState('');
  const [league, setLeague] = useState('NFL');
  const [startsAt, setStartsAt] = useState('');
  const [lockAt, setLockAt] = useState('');
  const [draft, setDraft] = useState<DraftMatch[]>([{ ...emptyMatch }]);

  const { data: slates, isLoading } = useQuery({
    queryKey: ['admin-slates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('slates').select('*').order('starts_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Slate[];
    },
  });

  const { data: groups } = useQuery({
    queryKey: ['admin-groups'],
    queryFn: async () => {
      const [{ data: g, error }, { data: m }] = await Promise.all([
        supabase.from('groups').select('*').order('created_at', { ascending: false }),
        supabase.from('group_members').select('group_id'),
      ]);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (m ?? []).forEach(r => { counts[r.group_id] = (counts[r.group_id] ?? 0) + 1; });
      return (g ?? []).map(row => ({ ...(row as Group), memberCount: counts[row.id] ?? 0 }));
    },
  });

  const createSlate = useMutation({
    mutationFn: async () => {
      const schedule = draft.filter(m => m.homeTeam.trim() && m.awayTeam.trim());
      if (!name.trim()) throw new Error('Give the game a name.');
      if (!startsAt || !lockAt) throw new Error('Set both the start time and the lock time.');
      if (schedule.length === 0) throw new Error('Add at least one matchup.');
      const { data, error } = await supabase
        .from('slates')
        .insert({
          name: name.trim(),
          league,
          starts_at: new Date(startsAt).toISOString(),
          lock_at: new Date(lockAt).toISOString(),
          created_by: user?.id ?? null,
        })
        .select('id')
        .single();
      if (error) throw error;
      const { error: evErr } = await supabase.from('slate_events').insert(
        schedule.map((m, i) => ({
          slate_id: data.id,
          home_team: m.homeTeam.trim(),
          away_team: m.awayTeam.trim(),
          starts_at: m.startsAt ? new Date(m.startsAt).toISOString() : null,
          sort_order: i,
        })),
      );
      if (evErr) throw evErr;
    },
    onSuccess: () => {
      toast({ title: 'Game created', description: `${name} is open for entries.` });
      setName(''); setStartsAt(''); setLockAt(''); setDraft([{ ...emptyMatch }]);
      void qc.invalidateQueries({ queryKey: ['admin-slates'] });
      void qc.invalidateQueries({ queryKey: ['slates'] });
    },
    onError: (e: unknown) => toast({
      title: 'Could not create game',
      description: e instanceof Error ? e.message : 'Please try again.',
      variant: 'destructive',
    }),
  });

  const runLocks = useMutation({
    mutationFn: applyDueLocks,
    onSuccess: () => {
      toast({ title: 'Lock check applied', description: 'Minimum-player rule applied to every group past its lock time.' });
      void qc.invalidateQueries({ queryKey: ['admin-groups'] });
      void qc.invalidateQueries({ queryKey: ['admin-slates'] });
    },
  });

  const updateMatch = (idx: number, patch: Partial<DraftMatch>) =>
    setDraft(prev => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-xl flex items-center gap-2"><Anchor size={20} /> Groups Management</h1>
          <p className="text-sm text-muted-foreground">Pirate Parlays creates the games. Grouping stays random and system-controlled.</p>
        </div>
        <Button variant="outline" disabled={runLocks.isPending} onClick={() => runLocks.mutate()}>
          <Lock size={14} className="mr-1" /> Run lock check
        </Button>
      </div>

      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4 flex items-start gap-2">
          <Info size={16} className="text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Admin creates games and runs the lock check. Admin cannot assign players to groups, change membership, or set
            payouts. Entry amounts ({config?.entryAmounts.join(', ') || '—'}), group sizes ({config?.groupSizes.join(', ') || '—'})
            and the minimum-player rule ({config?.minimumPlayers ?? '—'}) come from configuration; payout, scoring and tie
            rules remain unconfirmed.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Create Game</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Game name</label>
              <Input value={name} maxLength={80} onChange={e => setName(e.target.value)} placeholder="Game name" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">League</label>
              <div className="flex gap-2 mt-1">
                {LEAGUES.map(l => (
                  <button
                    key={l}
                    onClick={() => setLeague(l)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      league === l ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">First game starts</label>
              <Input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Entries lock at</label>
              <Input type="datetime-local" value={lockAt} onChange={e => setLockAt(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Schedule</p>
            {draft.map((m, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                <Input placeholder="Home team" value={m.homeTeam} onChange={e => updateMatch(idx, { homeTeam: e.target.value })} />
                <Input placeholder="Away team" value={m.awayTeam} onChange={e => updateMatch(idx, { awayTeam: e.target.value })} />
                <Input type="datetime-local" value={m.startsAt} onChange={e => updateMatch(idx, { startsAt: e.target.value })} />
                <Button variant="ghost" size="icon" disabled={draft.length === 1} onClick={() => setDraft(prev => prev.filter((_, i) => i !== idx))}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setDraft(prev => [...prev, { ...emptyMatch }])}>
              <Plus size={14} className="mr-1" /> Add matchup
            </Button>
          </div>

          <Button className="w-full" disabled={createSlate.isPending} onClick={() => createSlate.mutate()}>
            Create Game
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Games & Groups</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            [0, 1].map(i => <Skeleton key={i} className="h-20 w-full" />)
          ) : (slates?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No games created yet.</p>
          ) : (
            slates!.map(s => {
              const slateGroups = (groups ?? []).filter(g => g.slate_id === s.id);
              return (
                <div key={s.id} className="bg-secondary/30 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.league} • locks {new Date(s.lock_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{s.status}</Badge>
                  </div>
                  {slateGroups.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {slateGroups.map(g => (
                        <div key={g.id} className="flex items-center justify-between text-xs bg-background/40 rounded px-2 py-1.5">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Users size={12} /> {g.code} • ${Number(g.entry_amount)} • {g.memberCount} / {g.group_size}
                          </span>
                          <Badge variant="outline" className="text-[10px]">{STATUS_LABEL[g.status]}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGrouping;
