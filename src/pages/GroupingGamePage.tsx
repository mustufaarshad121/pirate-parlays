import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGroups, type GroupStatus } from '@/lib/group-context';
import { useAuth } from '@/lib/auth';
import RankBadge from '@/components/RankBadge';
import DemoBadge from '@/components/DemoBadge';
import { Anchor, Plus, Users, DollarSign, TrendingUp, Lock, Play, CheckCircle2 } from 'lucide-react';

const statusConfig: Record<GroupStatus, { color: string; icon: typeof Lock; label: string }> = {
  Open: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: Users, label: 'Open' },
  Locked: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Lock, label: 'Locked' },
  Active: { color: 'bg-primary/20 text-primary border-primary/30', icon: Play, label: 'Active' },
  Completed: { color: 'bg-muted text-muted-foreground border-border', icon: CheckCircle2, label: 'Completed' },
};

const GroupingGamePage = () => {
  const { groups, getUserGroups } = useGroups();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');

  const myGroups = getUserGroups(user?.id || '');
  const openGroups = groups.filter(g => g.status === 'Open');

  const displayGroups = tab === 'my' ? myGroups : tab === 'open' ? openGroups : groups;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Anchor size={24} /> Grouping Game</h1>
        <DemoBadge />
      </div>
      <p className="text-sm text-muted-foreground">Join a shared parlay group. When the group fills, the bet activates. If the parlay wins, everyone shares the payout!</p>

      <Button className="w-full" onClick={() => navigate('/groups/create')}>
        <Plus size={16} className="mr-1" /> Create New Group
      </Button>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All Groups</TabsTrigger>
          <TabsTrigger value="open" className="flex-1">Open</TabsTrigger>
          <TabsTrigger value="my" className="flex-1">My Groups</TabsTrigger>
        </TabsList>

        {['all', 'open', 'my'].map(t => (
          <TabsContent key={t} value={t} className="space-y-3 mt-3">
            {displayGroups.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No groups found.</p>}
            {displayGroups.map(group => {
              const sc = statusConfig[group.status];
              const isMember = group.members.some(m => m.id === user?.id);
              return (
                <Card key={group.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/groups/${group.id}`)}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{group.name}</h3>
                          {isMember && <Badge variant="outline" className="text-[10px] border-primary/50 text-primary">Joined</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Captain: {group.captainName} • {group.sport}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${sc.color}`}>
                        <sc.icon size={10} className="mr-1" /> {sc.label}
                      </Badge>
                    </div>

                    {/* Parlay Preview */}
                    <div className="bg-secondary/30 rounded-lg p-2.5 space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Parlay Slip • {group.parlaySlip.length} Legs</p>
                      {group.parlaySlip.map((sel, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{sel.homeTeam} vs {sel.awayTeam}</span>
                          <span className="font-medium">{sel.outcome} <span className="text-primary ml-1">{sel.odds.toFixed(2)}</span></span>
                        </div>
                      ))}
                      <div className="border-t border-border pt-1.5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Combined Odds</span>
                        <span className="text-sm font-bold text-primary">+{group.combinedOdds.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Footer stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users size={12} /> {group.currentUsers}/{group.maxUsers}</span>
                      <span className="flex items-center gap-1"><DollarSign size={12} /> ${group.entryAmount} entry</span>
                      <span className="flex items-center gap-1"><TrendingUp size={12} /> ${(group.entryAmount * group.combinedOdds).toFixed(2)} payout</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default GroupingGamePage;
