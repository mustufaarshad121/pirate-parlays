import { useState } from 'react';
import { MATCHES, Match, SPORTS } from '@/lib/data';
import { Zap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import DemoBadge from '@/components/DemoBadge';

const clone = (m: Match): Match => JSON.parse(JSON.stringify(m));

const AdminMatches = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>(MATCHES.map(clone));
  const [sport, setSport] = useState('All');
  const [date, setDate] = useState('');
  const [draft, setDraft] = useState<Match | null>(null);

  const visible = matches.filter(m => (sport === 'All' || m.sport === sport) && (!date || m.date === date));

  const setOdds = (marketType: string, outcomeId: string, value: string) => {
    if (!draft) return;
    setDraft({
      ...draft,
      markets: draft.markets.map(mk =>
        mk.type !== marketType ? mk : { ...mk, outcomes: mk.outcomes.map(o => (o.id === outcomeId ? { ...o, odds: Number(value) } : o)) },
      ),
    });
  };

  const save = () => {
    if (!draft) return;
    setMatches(prev => prev.map(m => (m.id === draft.id ? draft : m)));
    toast({ title: 'Match updated', description: `${draft.homeTeam} vs ${draft.awayTeam}` });
    setDraft(null);
  };

  const select = 'bg-background border border-border rounded-lg px-3 py-2 text-sm';

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-xl">Matches & Odds Management</h1>
        <DemoBadge />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select className={select} value={sport} onChange={e => setSport(e.target.value)}>
          {SPORTS.map(s => <option key={s} value={s}>{s === 'All' ? 'All sports / leagues' : s}</option>)}
        </select>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-10 w-44" />
        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-1.5"
          onClick={() => toast({ title: 'Odds import', description: 'No odds provider is configured in the supplied requirements — use manual override.' })}
        >
          <Download size={14} /> Import Odds
        </Button>
      </div>

      <div className="space-y-3">
        {visible.map(m => (
          <div key={m.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">{m.league}</span>
                <span className="text-xs text-muted-foreground capitalize">{m.status}</span>
                {m.status === 'live' && <span className="flex items-center gap-1 text-xs font-bold text-primary"><Zap size={12} /> LIVE</span>}
              </div>
              <span className="text-xs text-muted-foreground">{m.date} • {m.time}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold">{m.homeTeam} vs {m.awayTeam}</p>
              {(m.homeScore !== undefined || m.awayScore !== undefined) && (
                <p className="text-sm font-bold text-primary">{m.homeScore ?? 0} - {m.awayScore ?? 0}</p>
              )}
            </div>

            {m.markets.map(market => (
              <div key={market.type} className="mb-2">
                <p className="text-xs text-muted-foreground mb-1">{market.label}</p>
                <div className="flex gap-2 flex-wrap">
                  {market.outcomes.map(o => (
                    <div key={o.id} className="bg-secondary rounded-lg px-3 py-1.5 text-sm">
                      <span className="text-muted-foreground">{o.label}:</span>{' '}
                      <span className="font-bold text-primary">{o.odds.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button className="mt-2 text-xs text-primary hover:underline" onClick={() => setDraft(clone(m))}>Edit Match & Odds</button>
          </div>
        ))}
      </div>

      <Dialog open={!!draft} onOpenChange={o => !o && setDraft(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit match</DialogTitle></DialogHeader>
          {draft && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Match ID {draft.id} • {draft.sport} / {draft.league}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Start date</Label>
                  <Input type="date" value={draft.date} onChange={e => setDraft({ ...draft, date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Start time</Label>
                  <Input value={draft.time} onChange={e => setDraft({ ...draft, time: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <select className={`${select} w-full`} value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as Match['status'] })}>
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="finished">Completed</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Home score</Label>
                    <Input type="number" value={draft.homeScore ?? ''} onChange={e => setDraft({ ...draft, homeScore: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Away score</Label>
                    <Input type="number" value={draft.awayScore ?? ''} onChange={e => setDraft({ ...draft, awayScore: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  </div>
                </div>
              </div>

              {draft.markets.map(market => (
                <div key={market.type} className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{market.label}</p>
                  {market.outcomes.map(o => (
                    <div key={o.id} className="flex items-center gap-2">
                      <span className="text-sm flex-1 truncate">{o.label}</span>
                      <span className="text-[10px] text-muted-foreground">{o.id}</span>
                      <Input type="number" step="0.01" value={o.odds} onChange={e => setOdds(market.type, o.id, e.target.value)} className="w-24 h-8" />
                    </div>
                  ))}
                </div>
              ))}

              <Button className="w-full" onClick={save}>Save Updates</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMatches;
