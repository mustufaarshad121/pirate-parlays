import { useState } from 'react';
import { MODERATION_QUEUE, REPORTED_CONTENT, ModerationItem } from '@/lib/admin-data';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DemoBadge from '@/components/DemoBadge';
import { ShieldAlert } from 'lucide-react';

const stateLabel: Record<ModerationItem['state'], string> = {
  queued: 'Queued',
  approved: 'Approved',
  rejected: 'Rejected',
  removed: 'Removed',
};

const AdminModeration = () => {
  const { toast } = useToast();
  const [queue, setQueue] = useState<ModerationItem[]>(MODERATION_QUEUE);
  const [reports, setReports] = useState<ModerationItem[]>(REPORTED_CONTENT);
  const [banned, setBanned] = useState<string[]>([]);

  const act = (
    list: ModerationItem[],
    setList: (v: ModerationItem[]) => void,
    id: string,
    state: ModerationItem['state'],
  ) => {
    setList(list.map(i => (i.id === id ? { ...i, state } : i)));
    toast({ title: `Content ${stateLabel[state].toLowerCase()}` });
  };

  const ban = (author: string) => {
    setBanned(prev => (prev.includes(author) ? prev : [...prev, author]));
    toast({ title: 'User banned', description: `${author} can no longer post.`, variant: 'destructive' });
  };

  const renderItem = (
    item: ModerationItem,
    list: ModerationItem[],
    setList: (v: ModerationItem[]) => void,
  ) => (
    <div key={item.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="outline" className="text-[10px] capitalize">{item.kind}</Badge>
          <span className="text-sm font-medium truncate">{item.author}</span>
          {banned.includes(item.author) && (
            <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive">Banned</Badge>
          )}
        </div>
        <Badge variant="outline" className="text-[10px]">{stateLabel[item.state]}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{item.content}</p>
      {item.reason && (
        <p className="text-xs text-muted-foreground">
          Reported by <span className="text-foreground">{item.reportedBy}</span> — {item.reason}
        </p>
      )}
      <p className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" variant="outline" disabled={item.state !== 'queued'} onClick={() => act(list, setList, item.id, 'approved')}>Approve</Button>
        <Button size="sm" variant="outline" disabled={item.state !== 'queued'} onClick={() => act(list, setList, item.id, 'rejected')}>Reject</Button>
        <Button size="sm" variant="outline" disabled={item.state === 'removed'} onClick={() => act(list, setList, item.id, 'removed')}>Remove Content</Button>
        <Button size="sm" variant="destructive" disabled={banned.includes(item.author)} onClick={() => ban(item.author)}>Ban User</Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-xl flex items-center gap-2"><ShieldAlert size={20} /> Moderation</h1>
        <DemoBadge />
      </div>

      <section className="space-y-2">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Posts & Comments Queue</h2>
        {queue.map(i => renderItem(i, queue, setQueue))}
      </section>

      <section className="space-y-2">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Reported Content</h2>
        {reports.map(i => renderItem(i, reports, setReports))}
      </section>
    </div>
  );
};

export default AdminModeration;
