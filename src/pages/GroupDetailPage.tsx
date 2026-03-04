import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGroups, type GroupStatus } from '@/lib/group-context';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import RankBadge from '@/components/RankBadge';
import DemoBadge from '@/components/DemoBadge';
import { ArrowLeft, Send, Users, DollarSign, TrendingUp, Lock, Play, CheckCircle2, AlertCircle, Trophy, MessageSquare, FileText, UserCheck } from 'lucide-react';

const statusColors: Record<GroupStatus, string> = {
  Open: 'bg-emerald-500/20 text-emerald-400',
  Locked: 'bg-amber-500/20 text-amber-400',
  Active: 'bg-primary/20 text-primary',
  Completed: 'bg-muted text-muted-foreground',
};

const GroupDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { groups, groupChats, groupBets, joinGroup, sendGroupMessage, settleGroup, getGroupBets } = useGroups();
  const [chatInput, setChatInput] = useState('');
  const [tab, setTab] = useState('slip');

  const group = groups.find(g => g.id === id);
  if (!group) return <div className="text-center py-20 text-muted-foreground">Group not found. <Button variant="link" onClick={() => navigate('/groups')}>Back to Groups</Button></div>;

  const isMember = group.members.some(m => m.id === user?.id);
  const isCaptain = group.captainId === user?.id;
  const messages = groupChats[group.id] || [];
  const bets = getGroupBets(group.id);
  const canJoin = group.status === 'Open' && !isMember && (user?.balance || 0) >= group.entryAmount;
  const potentialPayout = parseFloat((group.entryAmount * group.combinedOdds).toFixed(2));

  const handleJoin = () => {
    if (!user) return;
    if (user.balance < group.entryAmount) {
      toast({ title: 'Insufficient Balance', description: `You need $${group.entryAmount} to join. Current balance: $${user.balance.toFixed(2)}`, variant: 'destructive' });
      return;
    }
    const ok = joinGroup(group.id);
    if (ok) {
      const updatedGroup = groups.find(g => g.id === group.id);
      toast({
        title: 'Joined! 🏴‍☠️',
        description: `$${group.entryAmount} deducted. ${updatedGroup && updatedGroup.currentUsers + 1 >= updatedGroup.maxUsers ? 'Group is now ACTIVE! 🔥' : `Waiting for ${group.maxUsers - group.currentUsers - 1} more.`}`,
      });
    }
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    sendGroupMessage(group.id, chatInput);
    setChatInput('');
  };

  const handleDemoSettle = (result: 'won' | 'lost') => {
    settleGroup(group.id, result);
    toast({ title: result === 'won' ? '🎉 Parlay Won!' : '😞 Parlay Lost', description: result === 'won' ? `Each member receives $${potentialPayout}!` : 'Better luck next time.' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}><ArrowLeft size={20} /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-display font-bold">{group.name}</h1>
            <Badge variant="outline" className={`text-[10px] ${statusColors[group.status]}`}>{group.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Captain: {group.captainName} • {group.sport}</p>
        </div>
        <DemoBadge />
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-1">
        {(['Open', 'Locked', 'Active', 'Completed'] as GroupStatus[]).map((s, i) => {
          const reached = ['Open', 'Locked', 'Active', 'Completed'].indexOf(group.status) >= i;
          return (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full ${reached ? 'bg-primary' : 'bg-secondary'}`} />
              <span className={`text-[10px] ${reached ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{s}</span>
            </div>
          );
        })}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Entry', value: `$${group.entryAmount}`, icon: DollarSign },
          { label: 'Members', value: `${group.currentUsers}/${group.maxUsers}`, icon: Users },
          { label: 'Odds', value: `+${group.combinedOdds.toFixed(2)}`, icon: TrendingUp },
          { label: 'Payout', value: `$${potentialPayout}`, icon: Trophy },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-2 text-center">
            <s.icon size={14} className="mx-auto text-muted-foreground mb-1" />
            <p className="text-sm font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Join Button */}
      {!isMember && group.status === 'Open' && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            {group.joinCriteria && (
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle size={14} className="mt-0.5 text-muted-foreground shrink-0" />
                <p className="text-muted-foreground"><span className="font-semibold">Join Criteria:</span> {group.joinCriteria}</p>
              </div>
            )}
            <div className="bg-secondary/50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Entry Amount</span><span className="font-bold">${group.entryAmount}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Your Balance</span><span className={`font-bold ${(user?.balance || 0) >= group.entryAmount ? 'text-primary' : 'text-destructive'}`}>${user?.balance.toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-border pt-1"><span className="text-muted-foreground">Potential Payout</span><span className="font-bold text-primary">${potentialPayout}</span></div>
            </div>
            <Button className="w-full" onClick={handleJoin} disabled={!canJoin}>
              {(user?.balance || 0) < group.entryAmount ? 'Insufficient Balance' : `Join Group — $${group.entryAmount}`}
            </Button>
          </CardContent>
        </Card>
      )}

      {isMember && group.status === 'Open' && (
        <div className="bg-secondary/50 rounded-lg p-3 text-sm text-center text-muted-foreground">
          <UserCheck size={16} className="inline mr-1" /> You're in! Waiting for {group.maxUsers - group.currentUsers} more members to activate.
        </div>
      )}

      {/* Tabs: Slip / Chat / Members / Bets */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="slip" className="flex-1"><FileText size={14} className="mr-1" /> Parlay Slip</TabsTrigger>
          <TabsTrigger value="chat" className="flex-1"><MessageSquare size={14} className="mr-1" /> Chat</TabsTrigger>
          <TabsTrigger value="members" className="flex-1"><Users size={14} className="mr-1" /> Members</TabsTrigger>
          <TabsTrigger value="bets" className="flex-1"><Trophy size={14} className="mr-1" /> Bets</TabsTrigger>
        </TabsList>

        {/* Parlay Slip */}
        <TabsContent value="slip" className="mt-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Group Parlay Slip</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {group.parlaySlip.map((sel, i) => (
                <div key={i} className="bg-secondary/30 rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Game {i + 1} • {sel.marketType}</span>
                    <span className="text-sm font-bold text-primary">{sel.odds.toFixed(2)}</span>
                  </div>
                  <p className="text-sm font-medium">{sel.homeTeam} vs {sel.awayTeam}</p>
                  <p className="text-sm">Pick: <span className="text-primary font-semibold">{sel.outcome}</span></p>
                </div>
              ))}
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Number of Legs</span><span className="font-bold">{group.parlaySlip.length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Combined Odds</span><span className="font-bold text-primary">+{group.combinedOdds.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Entry per User</span><span className="font-bold">${group.entryAmount}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Payout per User</span><span className="font-bold text-primary">${potentialPayout}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Pool</span><span className="font-bold">${group.entryAmount * group.maxUsers}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Settlement (only for Active groups) */}
          {group.status === 'Active' && (
            <Card className="mt-3 border-warning/30">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-2">⚠️ Demo Mode: Simulate settlement</p>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => handleDemoSettle('won')}>Simulate Win 🎉</Button>
                  <Button className="flex-1" variant="outline" onClick={() => handleDemoSettle('lost')}>Simulate Loss</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {group.status === 'Completed' && (
            <Card className="mt-3">
              <CardContent className="p-4 text-center">
                {bets.some(b => b.status === 'won') ? (
                  <div>
                    <p className="text-2xl mb-1">🎉</p>
                    <p className="font-bold text-primary text-lg">Parlay Won!</p>
                    <p className="text-sm text-muted-foreground">Each member received ${potentialPayout}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl mb-1">😞</p>
                    <p className="font-bold text-lg">Parlay Lost</p>
                    <p className="text-sm text-muted-foreground">Better luck next time, matey!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Chat */}
        <TabsContent value="chat" className="mt-3">
          <div className="flex flex-col h-[400px]">
            <div className="flex-1 overflow-auto space-y-2 bg-secondary/20 rounded-lg p-3">
              {messages.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">No messages yet. Be the first!</p>}
              {messages.map(msg => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-lg px-3 py-2 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
                      {!isMe && <p className="text-xs font-semibold text-primary mb-0.5">{msg.senderName}</p>}
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {isMember && (
              <div className="flex gap-2 mt-3">
                <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' && handleSend()} />
                <Button onClick={handleSend} disabled={!chatInput.trim()}><Send size={16} /></Button>
              </div>
            )}
            {!isMember && <p className="text-xs text-muted-foreground text-center mt-3">Join the group to participate in chat.</p>}
          </div>
        </TabsContent>

        {/* Members */}
        <TabsContent value="members" className="mt-3 space-y-2">
          {group.members.map(m => (
            <div key={m.id} className="flex items-center gap-3 bg-secondary/30 rounded-lg p-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">{m.username.charAt(0)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{m.username}</span>
                  <RankBadge rank={m.rank} />
                  {m.id === group.captainId && <Badge variant="outline" className="text-[10px] border-primary/50 text-primary">Captain</Badge>}
                </div>
              </div>
              {m.id === user?.id && <span className="text-[10px] text-primary font-semibold">You</span>}
            </div>
          ))}
          {group.status === 'Open' && (
            <div className="border border-dashed border-border rounded-lg p-3 text-center text-sm text-muted-foreground">
              {group.maxUsers - group.currentUsers} spot{group.maxUsers - group.currentUsers !== 1 ? 's' : ''} remaining
            </div>
          )}
        </TabsContent>

        {/* Bets */}
        <TabsContent value="bets" className="mt-3 space-y-2">
          {bets.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Bets will appear once the group activates.</p>}
          {bets.map(bet => (
            <Card key={bet.betId}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">{bet.username.charAt(0)}</div>
                    <span className="text-sm font-medium">{bet.username}</span>
                    {bet.userId === user?.id && <Badge variant="outline" className="text-[10px]">You</Badge>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${bet.stake} → ${bet.potentialPayout}</p>
                    <Badge variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : 'outline'} className="text-[10px]">
                      {bet.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupDetailPage;
