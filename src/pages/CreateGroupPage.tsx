import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGroups, type ParlaySelection } from '@/lib/group-context';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { MATCHES } from '@/lib/data';
import DemoBadge from '@/components/DemoBadge';
import { ArrowLeft, Plus, Trash2, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const { createGroup } = useGroups();
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [sport, setSport] = useState('NFL');
  const [entryAmount, setEntryAmount] = useState('25');
  const [maxUsers, setMaxUsers] = useState('5');
  const [joinCriteria, setJoinCriteria] = useState('');
  const [selections, setSelections] = useState<ParlaySelection[]>([]);
  const [showMatchPicker, setShowMatchPicker] = useState(false);

  const combinedOdds = selections.reduce((acc, s) => acc * s.odds, 1);
  const potentialPayout = parseFloat(entryAmount) * combinedOdds;

  const addSelection = (matchId: string, market: any, outcome: any, match: any) => {
    const sel: ParlaySelection = {
      matchId,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      marketType: market.label,
      outcome: outcome.label,
      odds: outcome.odds,
    };
    setSelections(prev => [...prev, sel]);
    setShowMatchPicker(false);
  };

  const removeSelection = (i: number) => setSelections(prev => prev.filter((_, idx) => idx !== i));

  const handleCreate = () => {
    if (!name.trim() || selections.length < 2) {
      toast({ title: 'Missing Info', description: 'Name and at least 2 parlay selections required.', variant: 'destructive' });
      return;
    }
    const id = createGroup({
      name,
      sport,
      captainId: user!.id,
      captainName: user!.username,
      entryAmount: parseFloat(entryAmount),
      maxUsers: parseInt(maxUsers),
      joinCriteria,
      parlaySlip: selections,
    });
    toast({ title: 'Group Created! 🏴‍☠️', description: `${name} is now open for members.` });
    navigate(`/groups/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}><ArrowLeft size={20} /></Button>
        <h1 className="text-xl font-display font-bold flex-1">Create Group</h1>
        <DemoBadge />
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Group Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Group Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sunday Smash Parlay" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Sport</label>
              <Select value={sport} onValueChange={setSport}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NFL">NFL</SelectItem>
                  <SelectItem value="NBA">NBA</SelectItem>
                  <SelectItem value="EPL">EPL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Max Users</label>
              <Input type="number" value={maxUsers} onChange={e => setMaxUsers(e.target.value)} min="2" max="50" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Entry Amount ($)</label>
            <Input type="number" value={entryAmount} onChange={e => setEntryAmount(e.target.value)} min="1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Join Criteria (optional)</label>
            <Textarea value={joinCriteria} onChange={e => setJoinCriteria(e.target.value)} placeholder="e.g. Min 50 bets placed, Win rate above 55%" rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Parlay Slip Builder */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Parlay Slip Builder</CardTitle>
            <span className="text-xs text-muted-foreground">{selections.length} leg{selections.length !== 1 ? 's' : ''}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {selections.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Add at least 2 selections to build your parlay slip.</p>
          )}
          {selections.map((sel, i) => (
            <div key={i} className="bg-secondary/30 rounded-lg p-3 flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Game {i + 1} • {sel.marketType}</p>
                <p className="text-sm">{sel.homeTeam} vs {sel.awayTeam}</p>
                <p className="text-sm">Pick: <span className="text-primary font-semibold">{sel.outcome}</span> @ <span className="text-primary">{sel.odds.toFixed(2)}</span></p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeSelection(i)}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={() => setShowMatchPicker(true)}>
            <Plus size={14} className="mr-1" /> Add Selection
          </Button>

          {selections.length >= 2 && (
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Combined Odds</span><span className="font-bold text-primary">+{combinedOdds.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Entry × Odds</span><span className="font-bold">${entryAmount} × {combinedOdds.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Payout per User</span><span className="font-bold text-primary">${potentialPayout.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Pool ({maxUsers} users)</span><span className="font-bold">${(parseFloat(entryAmount) * parseInt(maxUsers)).toFixed(2)}</span></div>
            </div>
          )}
        </CardContent>
      </Card>

      {selections.length < 2 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
          <AlertCircle size={14} /> You need at least 2 parlay selections to create a group.
        </div>
      )}

      <Button className="w-full" size="lg" onClick={handleCreate} disabled={!name.trim() || selections.length < 2}>
        Create Group 🏴‍☠️
      </Button>

      {/* Match Picker Dialog */}
      <Dialog open={showMatchPicker} onOpenChange={setShowMatchPicker}>
        <DialogContent className="max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>Select a Pick</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {MATCHES.map(match => (
              <Card key={match.id}>
                <CardContent className="p-3 space-y-2">
                  <p className="text-sm font-semibold">{match.homeTeam} vs {match.awayTeam}</p>
                  <p className="text-xs text-muted-foreground">{match.league} • {match.date} {match.time}</p>
                  {match.markets.map(market => (
                    <div key={market.type} className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{market.label}</p>
                      <div className="flex gap-2 flex-wrap">
                        {market.outcomes.map(outcome => {
                          const alreadyAdded = selections.some(s => s.matchId === match.id && s.outcome === outcome.label);
                          return (
                            <Button
                              key={outcome.id}
                              variant={alreadyAdded ? 'default' : 'outline'}
                              size="sm"
                              className="text-xs"
                              disabled={alreadyAdded}
                              onClick={() => addSelection(match.id, market, outcome, match)}
                            >
                              {outcome.label} <span className="ml-1 text-primary">{outcome.odds.toFixed(2)}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateGroupPage;
