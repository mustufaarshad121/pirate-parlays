import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { GAME_SPORTS, useGroups } from '@/lib/group-context';
import { Anchor, Info, Plus, Trash2, Users, Lock } from 'lucide-react';

interface DraftMatch {
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: string;
}

const emptyMatch: DraftMatch = { homeTeam: '', awayTeam: '', league: 'NFL', startTime: '' };

const AdminGrouping = () => {
  const { games, instances, createGame, closeGameEntries } = useGroups();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [sport, setSport] = useState<string>('NFL');
  const [entryCloses, setEntryCloses] = useState('');
  const [draft, setDraft] = useState<DraftMatch[]>([{ ...emptyMatch }]);

  const updateMatch = (idx: number, patch: Partial<DraftMatch>) =>
    setDraft(prev => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));

  const handleCreate = () => {
    const schedule = draft.filter(m => m.homeTeam.trim() && m.awayTeam.trim());
    const result = createGame({
      name,
      sport,
      entryCloses: entryCloses || new Date().toISOString(),
      schedule: schedule.map(m => ({ ...m, league: sport })),
    });
    if (!result.ok) {
      toast({ title: 'Could not create game', description: result.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Game created', description: `${name} is now open for entries.` });
    setName('');
    setEntryCloses('');
    setDraft([{ ...emptyMatch }]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl flex items-center gap-2">
            <Anchor size={20} /> Grouping Game Management
          </h1>
          <p className="text-sm text-muted-foreground">Pirate Parlays creates games. Grouping is random and system-controlled.</p>
        </div>
      </div>

      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4 flex items-start gap-2">
          <Info size={16} className="text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Admin may create games and close entries. Admin cannot assign users to groups, alter group membership, or set
            payouts — grouping is random by game + wager + group size, and payout rules remain unconfirmed.
          </p>
        </CardContent>
      </Card>

      {/* Create game */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Create System Game</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Game name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Game name" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Sport</label>
              <div className="flex gap-2 mt-1">
                {GAME_SPORTS.map(s => (
                  <button
                    key={s}
                    onClick={() => setSport(s)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      sport === s ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Entry closes</label>
              <Input type="datetime-local" value={entryCloses} onChange={e => setEntryCloses(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Schedule</p>
            {draft.map((m, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                <Input placeholder="Home team" value={m.homeTeam} onChange={e => updateMatch(idx, { homeTeam: e.target.value })} />
                <Input placeholder="Away team" value={m.awayTeam} onChange={e => updateMatch(idx, { awayTeam: e.target.value })} />
                <Input placeholder="Start time (e.g. Sun 1:00 PM)" value={m.startTime} onChange={e => updateMatch(idx, { startTime: e.target.value })} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDraft(prev => prev.filter((_, i) => i !== idx))}
                  disabled={draft.length === 1}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setDraft(prev => [...prev, { ...emptyMatch }])}>
              <Plus size={14} className="mr-1" /> Add match
            </Button>
          </div>

          <Button className="w-full" onClick={handleCreate}>Create Game</Button>
        </CardContent>
      </Card>

      {/* Games */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Games</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {games.map(g => {
            const gameInstances = instances.filter(i => i.gameId === g.id);
            return (
              <div key={g.id} className="bg-secondary/30 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold">{g.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {g.sport} • {g.schedule.length} matches • entry closes{' '}
                      {new Date(g.entryCloses).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize">{g.status}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={g.status !== 'open'}
                      onClick={() => {
                        closeGameEntries(g.id);
                        toast({ title: 'Entries closed', description: 'Minimum-participant rule applied to all groups.' });
                      }}
                    >
                      <Lock size={12} className="mr-1" /> Close entries
                    </Button>
                  </div>
                </div>

                {gameInstances.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {gameInstances.map(i => (
                      <div key={i.id} className="flex items-center justify-between text-xs bg-background/40 rounded px-2 py-1.5">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users size={12} /> ${i.wager} • max {i.groupSize} • {i.memberIds.length} bettors
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            i.status === 'null_and_void' ? 'border-destructive/40 text-destructive' : 'border-primary/40 text-primary'
                          }`}
                        >
                          {i.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGrouping;
