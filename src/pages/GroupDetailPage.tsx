import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useGroups, MINIMUM_BETTORS } from '@/lib/group-context';
import { statusConfig } from './GroupingGamePage';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Dice5,
  DollarSign,
  Info,
  MessageSquare,
  ShieldX,
  Users,
} from 'lucide-react';

const GroupDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getInstance, getGame, getSlipForInstance } = useGroups();

  const instance = id ? getInstance(id) : undefined;
  if (!instance) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Group not found. <Button variant="link" onClick={() => navigate('/groups')}>Back to Grouping Game</Button>
      </div>
    );
  }
  const game = getGame(instance.gameId);
  const isMember = user ? instance.memberIds.includes(user.id) : false;
  const mySlip = user ? getSlipForInstance(instance.id, user.id) : undefined;
  const cfg = statusConfig[instance.status];
  const minMet = instance.memberIds.length >= MINIMUM_BETTORS;

  if (!isMember) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-3">
        <p className="text-sm text-muted-foreground">You are not a member of this group.</p>
        <Button onClick={() => navigate('/groups')}>Back to Grouping Game</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-display font-bold truncate">{game?.name ?? 'Grouping Game'}</h1>
            <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Group {instance.id.slice(-6).toUpperCase()} • randomly formed by Pirate Parlays</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card><CardContent className="p-3 text-center">
          <DollarSign size={14} className="mx-auto text-muted-foreground mb-1" />
          <p className="text-sm font-bold">${instance.wager}</p>
          <p className="text-[10px] text-muted-foreground">Wager</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Users size={14} className="mx-auto text-muted-foreground mb-1" />
          <p className="text-sm font-bold">{instance.memberIds.length} / {instance.groupSize}</p>
          <p className="text-[10px] text-muted-foreground">Bettors</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Dice5 size={14} className="mx-auto text-muted-foreground mb-1" />
          <p className="text-sm font-bold">{instance.groupSize}</p>
          <p className="text-[10px] text-muted-foreground">Selected capacity</p>
        </CardContent></Card>
      </div>

      {instance.status === 'forming' && (
        <div className="bg-secondary/50 border border-border rounded-lg p-3 text-sm flex items-start gap-2">
          {minMet ? (
            <>
              <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Minimum reached</p>
                <p className="text-xs text-muted-foreground">
                  {instance.memberIds.length} bettors have entered — this group can proceed at the game's start boundary. Still open to more entries.
                </p>
              </div>
            </>
          ) : (
            <>
              <Info size={16} className="text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Waiting for bettors</p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary font-semibold">{MINIMUM_BETTORS - instance.memberIds.length}</span> more actual entries are needed to reach the minimum of {MINIMUM_BETTORS}. If fewer than {MINIMUM_BETTORS} at the start boundary, this group is null and void.
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
            <p className="text-xs text-muted-foreground">This group met the {MINIMUM_BETTORS}-bettor minimum. Scoring and payout rules are pending client confirmation.</p>
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
                  Fewer than {MINIMUM_BETTORS} bettors entered this group. Pirate Parlays does not fill missing entries.
                </p>
                <p className="text-[11px] text-warning mt-1">
                  Handling of the original wager is not yet confirmed. No automatic refund, transfer, or carry-over has been applied.
                </p>
              </div>
            </div>
            <Button className="w-full" onClick={() => navigate('/groups')}>
              Fill Out Another Slip <ChevronRight size={14} className="ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Estimated cash payout */}
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Estimated Cash Payout</CardTitle>
          <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">Pending</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">Estimated payout pending final payout formula confirmation.</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            No payout calculation, platform fee, winner allocation, or tie handling has been configured, so no amount is displayed here.
          </p>
        </CardContent>
      </Card>

      {/* My own slip */}
      {mySlip && game && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Your Slip</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {game.schedule.map((m, i) => {
              const p = mySlip.picks[m.id];
              return (
                <div key={m.id} className="flex items-center justify-between text-xs bg-secondary/30 rounded p-2">
                  <span className="text-muted-foreground truncate">{i + 1}. {m.homeTeam} vs {m.awayTeam}</span>
                  <Badge variant="outline" className={`text-[10px] ${p === 'winner' ? 'border-primary/40 text-primary' : 'border-destructive/40 text-destructive'}`}>
                    {p === 'winner' ? 'Winner' : 'Loser'}
                  </Badge>
                </div>
              );
            })}
            <p className="text-[11px] text-muted-foreground pt-1">Each member of this group keeps their own separate slip.</p>
          </CardContent>
        </Card>
      )}

      {/* Members */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Group Members</CardTitle>
          <span className="text-xs text-muted-foreground">{instance.memberIds.length} / {instance.groupSize} bettors</span>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {instance.memberNames.map((name, i) => {
            const isMe = user && instance.memberIds[i] === user.id;
            return (
              <div key={instance.memberIds[i]} className="flex items-center gap-2 bg-secondary/30 rounded p-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                  {name.charAt(0)}
                </div>
                <span className="text-sm flex-1">{name}</span>
                {isMe && <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">You</Badge>}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" onClick={() => navigate(`/group-chat?group=${instance.id}`)}>
        <MessageSquare size={14} className="mr-1" /> Open group chat
      </Button>
    </div>
  );
};

export default GroupDetailPage;
