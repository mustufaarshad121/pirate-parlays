import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { applyDueLocks, useMyGroups, useSlates, STATUS_LABEL, type GroupStatus } from '@/lib/groups';
import { Anchor, ChevronRight, KeyRound, Loader2, Shuffle, Users } from 'lucide-react';

export const statusStyle: Record<GroupStatus, string> = {
  open: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  locked: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
  live: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  completed: 'bg-muted text-muted-foreground border-border',
  void: 'bg-destructive/20 text-destructive border-destructive/40',
};

const GroupsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: slates, isLoading: slatesLoading } = useSlates();
  const { data: groups, isLoading, isError, refetch } = useMyGroups(user?.id);

  useEffect(() => {
    void applyDueLocks().then(() => refetch()).catch(() => undefined);
  }, [refetch]);

  const active = (groups ?? []).filter(g => g.status !== 'completed' && g.status !== 'void');
  const past = (groups ?? []).filter(g => g.status === 'completed' || g.status === 'void');
  const hasSlates = (slates?.length ?? 0) > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24">
      <header className="space-y-1">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Anchor size={24} /> Groups
        </h1>
        <p className="text-sm text-muted-foreground">
          Join a group, make your own picks, and compete against other Pirates.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Shuffle size={18} className="text-primary" />
              <p className="font-semibold">Quick Match</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Pick a slate, entry amount and group size — you're placed into an open group automatically.
            </p>
            <Button className="w-full" disabled={!hasSlates} onClick={() => navigate('/groups/find?mode=quick')}>
              Find a group
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <p className="font-semibold">Private Group</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Create a group and share the invite code, or join one with a code you were given.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" disabled={!hasSlates} onClick={() => navigate('/groups/find?mode=private')}>
                Create
              </Button>
              <Button variant="outline" onClick={() => navigate('/groups/join')}>
                <KeyRound size={14} className="mr-1" /> Join
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {!slatesLoading && !hasSlates && (
        <Card><CardContent className="p-6 text-center space-y-1">
          <p className="font-display font-semibold">No games available yet</p>
          <p className="text-xs text-muted-foreground">
            Pirate Parlays creates the games. Check back when a slate is open for entries.
          </p>
        </CardContent></Card>
      )}

      <section className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-1">My Groups</p>
        {isLoading ? (
          <div className="space-y-2">{[0, 1].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : isError ? (
          <Card><CardContent className="p-4 text-sm text-center space-y-2">
            <p className="text-muted-foreground">We couldn't load your groups.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
          </CardContent></Card>
        ) : active.length === 0 ? (
          <Card><CardContent className="p-4 text-sm text-muted-foreground text-center">
            You haven't joined a group yet.
          </CardContent></Card>
        ) : (
          active.map(g => <GroupRow key={g.id} group={g} onOpen={() => navigate(`/groups/${g.id}`)} />)
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-1">Past Groups</p>
          {past.map(g => <GroupRow key={g.id} group={g} onOpen={() => navigate(`/groups/${g.id}`)} />)}
        </section>
      )}
    </div>
  );
};

const GroupRow = ({
  group,
  onOpen,
}: {
  group: { id: string; code: string; name: string | null; status: GroupStatus; entry_amount: number; group_size: number; memberCount: number; is_private: boolean; slate: { name: string; league: string } | null };
  onOpen: () => void;
}) => (
  <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={onOpen}>
    <CardContent className="p-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">
          {group.slate?.name ?? 'Slate'} {group.name ? `• ${group.name}` : ''}
        </p>
        <p className="text-xs text-muted-foreground">
          ${Number(group.entry_amount)} entry • {group.memberCount} / {group.group_size} players • {group.is_private ? `Code ${group.code}` : 'Quick Match'}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className={`text-[10px] ${statusStyle[group.status]}`}>{STATUS_LABEL[group.status]}</Badge>
        <ChevronRight size={16} className="text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
);

export const InlineSpinner = () => <Loader2 className="animate-spin" size={16} />;

export default GroupsPage;
