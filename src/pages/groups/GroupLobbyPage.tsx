import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import {
  STATUS_LABEL,
  applyDueLocks,
  useGroup,
  useGroupMembers,
  useGroupsConfig,
  useMyPicks,
  useSlate,
  useSlateEvents,
} from '@/lib/groups';
import { statusStyle } from './GroupsPage';
import GroupChatPanel from './GroupChatPanel';
import {
  ArrowLeft, CheckCircle2, Clock, DollarSign, Info, ShieldX, Users,
} from 'lucide-react';

const GroupLobbyPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: group, isLoading, isError, refetch } = useGroup(id);
  const { data: members } = useGroupMembers(id);
  const { data: slate } = useSlate(group?.slate_id);
  const { data: events } = useSlateEvents(group?.slate_id);
  const { data: myPicks } = useMyPicks(id, user?.id);
  const { data: config } = useGroupsConfig();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    void applyDueLocks().then(() => refetch()).catch(() => undefined);
  }, [refetch, now]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`group-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${id}` }, () => {
        void qc.invalidateQueries({ queryKey: ['group-members', id] });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'groups', filter: `id=eq.${id}` }, () => {
        void qc.invalidateQueries({ queryKey: ['group', id] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [id, qc]);

  if (isLoading) {
    return <div className="max-w-2xl mx-auto space-y-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  if (isError || !group) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-3">
        <p className="text-sm text-muted-foreground">We couldn't load this group.</p>
        <Button onClick={() => navigate('/groups')}>Back to Groups</Button>
      </div>
    );
  }

  const isMember = !!members?.some(m => m.user_id === user?.id);
  if (members && !isMember) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-3">
        <p className="text-sm text-muted-foreground">You are not a member of this group.</p>
        <Button onClick={() => navigate('/groups')}>Back to Groups</Button>
      </div>
    );
  }

  const memberCount = members?.length ?? 0;
  const totalEvents = events?.length ?? 0;
  const myPickCount = Object.keys(myPicks ?? {}).length;
  const picksComplete = totalEvents > 0 && myPickCount >= totalEvents;
  const min = config?.minimumPlayers ?? null;
  const minMet = min == null ? null : memberCount >= min;
  const lockAt = slate ? new Date(slate.lock_at) : null;
  const editable = group.status === 'open' && !!lockAt && lockAt.getTime() > now;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}><ArrowLeft size={20} /></Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-display font-bold truncate">{slate?.name ?? 'Group'}</h1>
            <Badge variant="outline" className={`text-[10px] ${statusStyle[group.status]}`}>{STATUS_LABEL[group.status]}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {group.name ?? 'Group'} • Randomly assigned
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card><CardContent className="p-3 text-center">
          <DollarSign size={14} className="mx-auto text-muted-foreground mb-1" />
          <p className="text-sm font-bold">${Number(group.entry_amount)}</p>
          <p className="text-[10px] text-muted-foreground">Entry</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Users size={14} className="mx-auto text-muted-foreground mb-1" />
          <p className="text-sm font-bold">{memberCount} / {group.group_size}</p>
          <p className="text-[10px] text-muted-foreground">Bettors</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Clock size={14} className="mx-auto text-muted-foreground mb-1" />
          <p className="text-sm font-bold">
            {lockAt ? lockAt.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
          </p>
          <p className="text-[10px] text-muted-foreground">Locks</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-3 space-y-2">
          <Progress value={group.group_size ? (memberCount / group.group_size) * 100 : 0} />
          <p className="text-xs text-muted-foreground">
            {memberCount} of {group.group_size} spots filled.{' '}
            {min != null && (minMet
              ? `Minimum of ${min} bettors met — this group can proceed even if it is not full.`
              : `${min - memberCount} more needed to reach the ${min}-bettor minimum.`)}
          </p>
        </CardContent>
      </Card>

      {group.status === 'open' && (
        <div className="bg-secondary/50 border border-border rounded-lg p-3 text-sm flex items-start gap-2">
          {picksComplete ? <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" /> : <Info size={16} className="text-warning shrink-0 mt-0.5" />}
          <div className="flex-1">
            <p className="font-semibold">{picksComplete ? 'Your picks are in' : 'Make your picks'}</p>
            <p className="text-xs text-muted-foreground">
              {picksComplete
                ? `${myPickCount} of ${totalEvents} selections submitted. You can change them until the group locks.`
                : `Every player makes their own picks. ${myPickCount} of ${totalEvents} submitted.`}
            </p>
          </div>
          <Button size="sm" disabled={!editable} onClick={() => navigate(`/groups/${group.id}/picks`)}>
            {picksComplete ? 'Edit picks' : 'Make picks'}
          </Button>
        </div>
      )}

      {group.status === 'void' && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <ShieldX size={18} className="text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Null and Void</p>
                <p className="text-xs text-muted-foreground">
                  This group had fewer than the required number of bettors. Pirate Parlays never fills missing spots
                  with company or AI slips.
                </p>
                <p className="text-[11px] text-warning mt-1">
                  Handling of the original entry amount is pending client confirmation — no refund, transfer, or
                  carry-over has been applied.
                </p>
              </div>
            </div>
            <Button className="w-full" onClick={() => navigate('/groups/find')}>Fill out another slip</Button>
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
          <p className="text-[11px] text-muted-foreground mt-1">
            No payout calculation, platform fee, winner allocation, or tie handling has been configured.
          </p>
        </CardContent>
      </Card>

      {/* Standings / results structure — no scoring rules are applied */}
      {(group.status === 'live' || group.status === 'completed') && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Group Standings</CardTitle>
            <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">Scoring pending</Badge>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {members?.map(m => (
              <div key={m.user_id} className="flex items-center justify-between bg-secondary/30 rounded p-2 text-sm">
                <span>{m.display_name || m.username}{m.user_id === user?.id ? ' (you)' : ''}</span>
                <span className="text-xs text-muted-foreground">{m.picksSubmitted} / {totalEvents} picks</span>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground pt-1">
              Ranking is shown once the scoring rules are confirmed. No result, score, or winner is calculated yet.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Members</CardTitle>
          <span className="text-xs text-muted-foreground">{memberCount} / {group.group_size}</span>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {members?.map(m => (
            <div key={m.user_id} className="flex items-center gap-2 bg-secondary/30 rounded p-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                {(m.display_name || m.username).charAt(0).toUpperCase()}
              </div>
              <span className="text-sm flex-1 truncate">{m.display_name || m.username}</span>
              {m.user_id === user?.id && (
                <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">You</Badge>
              )}
              <Badge variant="outline" className="text-[10px]">
                {m.picksSubmitted >= totalEvents && totalEvents > 0 ? 'Picks in' : 'Picks pending'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <GroupChatPanel groupId={group.id} />
    </div>
  );
};

export default GroupLobbyPage;
