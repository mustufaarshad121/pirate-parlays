import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Msg {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  username: string;
}

const GroupChatPanel = ({ groupId }: { groupId: string }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['group-messages', groupId],
    queryFn: async (): Promise<Msg[]> => {
      const { data, error } = await supabase
        .from('group_messages')
        .select('id, user_id, body, created_at')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(200);
      if (error) throw error;
      const ids = [...new Set((data ?? []).map(m => m.user_id))];
      const { data: profiles } = ids.length
        ? await supabase.from('profiles').select('id, username, display_name').in('id', ids)
        : { data: [] as { id: string; username: string; display_name: string | null }[] };
      return (data ?? []).map(m => {
        const p = profiles?.find(x => x.id === m.user_id);
        return { ...m, username: p?.display_name || p?.username || 'Pirate' };
      });
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` }, () => {
        void qc.invalidateQueries({ queryKey: ['group-messages', groupId] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [groupId, qc]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages]);

  const send = async () => {
    const body = text.trim();
    if (!body || !user) return;
    setSending(true);
    const { error } = await supabase.from('group_messages').insert({ group_id: groupId, user_id: user.id, body });
    setSending(false);
    if (error) {
      toast.error('Message could not be sent.');
      return;
    }
    setText('');
    void qc.invalidateQueries({ queryKey: ['group-messages', groupId] });
  };

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">Group Chat</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Loading messages…</p>
          ) : (messages?.length ?? 0) === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No messages yet — say ahoy to your group.
            </p>
          ) : (
            messages!.map(m => {
              const mine = m.user_id === user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 ${mine ? 'bg-primary/15' : 'bg-secondary/50'}`}>
                    {!mine && <p className="text-[10px] text-muted-foreground mb-0.5">{m.username}</p>}
                    <p className="text-sm break-words">{m.body}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>
        <div className="flex gap-2">
          <Input
            value={text}
            maxLength={1000}
            placeholder="Message your group"
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void send(); }}
            className="bg-secondary border-border"
          />
          <Button size="icon" disabled={sending || !text.trim()} onClick={send}>
            {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupChatPanel;
