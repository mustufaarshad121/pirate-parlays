import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { STATUS_LABEL, useMyGroups } from '@/lib/groups';
import { statusStyle } from './groups/GroupsPage';
import { ChevronRight, MessageSquare } from 'lucide-react';

const GroupChatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: groups, isLoading } = useMyGroups(user?.id);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <MessageSquare size={24} /> Group Chat
      </h1>
      <p className="text-sm text-muted-foreground">
        Each chat room belongs to one group. Only the players in that group can read and post.
      </p>

      {isLoading ? (
        <div className="space-y-2">{[0, 1].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (groups?.length ?? 0) === 0 ? (
        <Card><CardContent className="p-6 text-center space-y-2">
          <p className="font-display font-semibold">No group chats yet</p>
          <p className="text-xs text-muted-foreground">Join a group and its chat room appears here.</p>
          <Button onClick={() => navigate('/groups')}>Go to Groups</Button>
        </CardContent></Card>
      ) : (
        groups!.map(g => (
          <Card key={g.id} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate(`/groups/${g.id}`)}>
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{g.slate?.name ?? 'Group'} {g.name ? `• ${g.name}` : ''}</p>
                <p className="text-xs text-muted-foreground">{g.memberCount} / {g.group_size} players • Code {g.code}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className={`text-[10px] ${statusStyle[g.status]}`}>{STATUS_LABEL[g.status]}</Badge>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default GroupChatPage;
