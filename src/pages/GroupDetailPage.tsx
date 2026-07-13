import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useGroups } from '@/lib/group-context';
import DemoBadge from '@/components/DemoBadge';
import { statusConfig } from './GroupingGamePage';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Dice5,
  DollarSign,
  Info,
  ShieldX,
  Users,
} from 'lucide-react';

const GroupDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getInstance, getGame, estimatedPayoutRange, simulateProceed, simulateNullAndVoid, mySlips } = useGroups();

  const instance = id ? getInstance(id) : undefined;
  if (!instance) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Group not found. <Button variant="link" onClick={() => navigate('/groups')}>Back to Games</Button>
      </div>
    );
  }
  const game = getGame(instance.gameId)!;
  const isMember = user ? instance.memberIds.includes(user.id) : false;
  const mySlip = mySlips.find(s => s.groupInstanceId === instance.id);
  const est = estimatedPayoutRange(instance.wager, instance.groupSize, instance.memberIds.length);
  const cfg = statusConfig[instance.status];
  const spotsLeft = Math.max(0, instance.groupSize - instance.memberIds.length);
  const minMet = instance.memberIds.length >= 5;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-display font-bold truncate">{game.name}</h1>
            <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Randomly grouped by Pirate Parlays</p>
        </div>
        <DemoBadge />
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card><CardContent className="p-3 text-center">
          <DollarSign size={14} className="mx-auto text-muted-foreground mb-1" />
          <p className="text-sm font-bold">${instance.wager}</p>
          <p className="text-[10px] text-muted-foreground">Wager</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Users size={14} className="mx-auto text-muted-foreground mb-1" />
          <p className="text-sm font-bold">{instance.memberIds.length}/{instance.groupSize}</p>
          <p className="text-[10px] text-muted-foreground">Bettors</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Dice5 size={14} className="mx-auto text-muted-foreground mb-1" />
          <p className="text-sm font-bold">{instance.groupSize}</p>
          <p className="text-[10px] text-muted-foreground">Max Size</p>
        </CardContent></Card>
      </div>

      {/* Status banner */}
      {instance.status === 'forming' && (
        <div className="bg-secondary/50 border border-border rounded-lg p-3 text-sm flex items-start gap-2">
          {minMet ? (
            <>
              <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Minimum met</p>
                <p className="text-xs text-muted-foreground">
                  {instance.memberIds.length} bettors joined — group can proceed. Still accepting up to {spotsLeft} more.
                </p>
              </div>
            </>
          ) : (
            <>
              <Info size={16} className="text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Waiting for more bettors</p>
                <p className="text-xs text-muted-foreground">
                  Need <span className="text-primary font-semibold">{5 - instance.memberIds.length}</span> more to reach the minimum of 5. If fewer than 5 by entry cutoff, this group is null-and-void.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {instance.status === 'proceeding' && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm flex items-start gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-400">Proceeding</p>
            <p className="text-xs text-muted-foreground">This group has the required minimum. Scoring & payout rules are pending final client confirmation (not implemented in demo).</p>
          </div>
        </div>
      )}

      {instance.status === 'null_and_void' && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <ShieldX size={18} className="text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Null and Void</p>
                <p className="text-xs text-muted-foreground">
                  Fewer than 5 bettors joined this group. Per Pirate Parlays rules, Pirate Parlays and AI do not fill missing slips.
                </p>
                <p className="text-[11px] text-warning mt-1">
                  ⚠️ Wallet refund / credit rule for null-and-void groups is unconfirmed and is not applied in this demo.
                </p>
              </div>
            </div>
            <Button className="w-full" onClick={() => navigate('/groups')}>
              Fill out another slip <ChevronRight size={14} className="ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Estimated payout */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Estimated Payout</CardTitle>
          <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">Demo estimate</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-display font-bold text-primary">
            ${est.low.toFixed(2)} – ${est.high.toFixed(2)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Illustrative only. Final scoring, winner determination, payout formula, ties, and fees are pending client confirmation.
          </p>
        </CardContent>
      </Card>

      {/* My slip */}
      {isMember && mySlip && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Your Slip</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {game.schedule.map((m, i) => {
              const p = mySlip.picks[m.id];
              return (
                <div key={m.id} className="flex items-center justify-between text-xs bg-secondary/30 rounded p-2">
                  <span className="text-muted-foreground">{i + 1}. {m.homeTeam} vs {m.awayTeam}</span>
                  <Badge variant="outline" className={`text-[10px] ${p === 'winner' ? 'border-primary/40 text-primary' : 'border-destructive/40 text-destructive'}`}>
                    {p === 'winner' ? 'Winner' : 'Loser'}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Members */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Random Group Members</CardTitle>
          <span className="text-xs text-muted-foreground">{instance.memberIds.length} total</span>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {instance.memberNames.map((name, i) => {
            const isMe = user && instance.memberIds[i] === user.id;
            return (
              <div key={i} className="flex items-center gap-2 bg-secondary/30 rounded p-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                  {name.charAt(0)}
                </div>
                <span className="text-sm flex-1">{name}</span>
                {isMe && <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">You</Badge>}
              </div>
            );
          })}
          {spotsLeft > 0 && (
            <div className="border border-dashed border-border rounded p-2 text-center text-xs text-muted-foreground">
              {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} still open
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo controls */}
      {(instance.status === 'forming') && (
        <Card className="border-warning/30">
          <CardContent className="p-4 space-y-2">
            <p className="text-xs text-warning flex items-center gap-1"><AlertCircle size={12} /> Demo controls (client walkthrough)</p>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => simulateProceed(instance.id)}>
                Simulate → Proceeds
              </Button>
              <Button size="sm" variant="outline" onClick={() => simulateNullAndVoid(instance.id)}>
                Simulate → Null &amp; Void
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not a member */}
      {!isMember && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-2 text-center">
            <p className="text-sm text-muted-foreground">You're not in this group.</p>
            <Button className="w-full" onClick={() => navigate(`/groups/game/${instance.gameId}`)}>
              Submit your own slip for {game.name}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GroupDetailPage;
