import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import {
  applyDueLocks,
  useMyEntries,
  useSlates,
  STATUS_LABEL,
  type EntryRow,
  type GroupStatus,
  type SlateEvent,
} from '@/lib/groups';
import { Anchor, CalendarDays, ChevronRight, Clock, Loader2, MessageSquare, Shuffle, Users } from 'lucide-react';

export const statusStyle: Record<GroupStatus, string> = {
  open: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  locked: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
  live: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  completed: 'bg-muted text-muted-foreground border-border',
  void: 'bg-destructive/20 text-destructive border-destructive/40',
};

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD';

const GroupsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: slates, isLoading: slatesLoading, refetch: refetchSlates } = useSlates();
  const { data: entries, isLoading, isError, refetch } = useMyEntries(user?.id);

  useEffect(() => {
    void applyDueLocks()
      .then(() => { void refetch(); void refetchSlates(); })
      .catch(() => undefined);
  }, [refetch, refetchSlates]);

  const slateIds = (slates ?? []).map(s => s.id);
  const { data: schedule } = useQuery({
    enabled: slateIds.length > 0,
    queryKey: ['open-schedules', slateIds.join(',')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slate_events')
        .select('*')
        .in('slate_id', slateIds)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as SlateEvent[];
    },
  });

  const openGames = (slates ?? []).filter(s => new Date(s.lock_at).getTime() > Date.now());
  const enteredSlateIds = new Set(
    (entries ?? []).filter(e => e.status !== 'void').map(e => e.slate_id),
  );
  const active = (entries ?? []).filter(e => e.status !== 'void');
  const past = (entries ?? []).filter(e => e.status === 'void');

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24">
      <header className="space-y-1">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Anchor size={24} /> Groups
        </h1>
        <p className="text-sm text-muted-foreground">
          Pirate Parlays creates the games. Make your own picks, choose your wager and group size, and the system places
          you randomly with other Pirates who chose the same three.
        </p>
      </header>

      <section className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-1">Grouping Games</p>
        {slatesLoading ? (
          <div className="space-y-2">{[0, 1].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>
        ) : openGames.length === 0 ? (
          <Card><CardContent className="p-6 text-center space-y-1">
            <p className="font-display font-semibold">No Grouping Games Available</p>
            <p className="text-xs text-muted-foreground">
              Pirate Parlays creates the games. Check back when a game is open for entries.
            </p>
          </CardContent></Card>
        ) : (
          openGames.map(s => {
            const matches = (schedule ?? []).filter(e => e.slate_id === s.id);
            const entered = enteredSlateIds.has(s.id);
            return (
              <Card key={s.id} className="border-primary/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display font-semibold truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px]">{s.league}</Badge>
                        <span className="flex items-center gap-1"><Clock size={11} /> Entries close {fmt(s.lock_at)}</span>
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/40">
                      Open for entries
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                      <CalendarDays size={11} /> Schedule
                    </p>
                    {matches.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Schedule loading…</p>
                    ) : (
                      matches.map(m => (
                        <div key={m.id} className="flex items-center justify-between text-xs bg-secondary/30 rounded px-2 py-1.5">
                          <span className="truncate">{m.away_team} @ {m.home_team}</span>
                          <span className="text-muted-foreground shrink-0 ml-2">{fmt(m.starts_at)}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <Button
                    className="w-full"
                    disabled={entered}
                    onClick={() => navigate(`/groups/entry/${s.id}`)}
                  >
                    <Shuffle size={14} className="mr-1" />
                    {entered ? 'Entry submitted' : 'Start My Entry'}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </section>

      <section className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-1">My Entries</p>
        {isLoading ? (
          <div className="space-y-2">{[0, 1].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : isError ? (
          <Card><CardContent className="p-4 text-sm text-center space-y-2">
            <p className="text-muted-foreground">We couldn't load your entries.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
          </CardContent></Card>
        ) : active.length === 0 ? (
          <Card><CardContent className="p-4 text-sm text-muted-foreground text-center">
            You have no entries yet.
          </CardContent></Card>
        ) : (
          active.map(e => <EntryCard key={e.id} entry={e} onOpen={() => navigate(`/groups/${e.group_id}`)} onChat={() => navigate('/group-chat')} />)
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-1">Past Entries</p>
          {past.map(e => <EntryCard key={e.id} entry={e} onOpen={() => navigate('/groups')} onChat={() => navigate('/group-chat')} />)}
        </section>
      )}
    </div>
  );
};

const EntryCard = ({ entry, onOpen, onChat }: { entry: EntryRow; onOpen: () => void; onChat: () => void }) => {
  const grouped = entry.status === 'grouped' && !!entry.group;
  return (
    <Card className={grouped ? 'cursor-pointer hover:border-primary/40 transition-colors' : ''} onClick={grouped ? onOpen : undefined}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {entry.slate?.name ?? 'Grouping Game'}
              {grouped ? ` • ${entry.group?.name ?? entry.group?.code}` : ''}
            </p>
            <p className="text-xs text-muted-foreground">
              {entry.slate?.league} • ${Number(entry.wager_amount)} wager • max {entry.group_size} bettors
            </p>
          </div>
          {entry.status === 'void' ? (
            <Badge variant="outline" className={`text-[10px] ${statusStyle.void}`}>Null &amp; Void</Badge>
          ) : grouped ? (
            <Badge variant="outline" className={`text-[10px] ${statusStyle[entry.group!.status]}`}>
              {STATUS_LABEL[entry.group!.status]}
            </Badge>
          ) : (
            <Badge variant="outline" className={`text-[10px] ${statusStyle.open}`}>Waiting</Badge>
          )}
        </div>

        {grouped ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users size={12} /> {entry.memberCount} / {entry.group_size} bettors
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={ev => { ev.stopPropagation(); onChat(); }}>
                <MessageSquare size={12} className="mr-1" /> Group Chat
              </Button>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>
          </div>
        ) : entry.status === 'void' ? (
          <p className="text-xs text-muted-foreground">
            Fewer than the required bettors matched before the game locked. You may complete another slip when a game is
            open. Handling of the original entry amount is pending client confirmation.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Waiting for matching players</p>
        )}
      </CardContent>
    </Card>
  );
};

export const InlineSpinner = () => <Loader2 className="animate-spin" size={16} />;

export default GroupsPage;
