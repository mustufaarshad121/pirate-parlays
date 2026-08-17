import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useGroups } from '@/lib/group-context';
import { statusConfig } from './GroupingGamePage';
import { ArrowLeft, Send, Users } from 'lucide-react';

// Grouping Game chat is tied to the randomly formed group ID.
// There is no Captain owner and no fabricated participants — the room uses the
// actual member list of the group the signed-in user was randomly placed into.
const GroupChatPage = () => {
  const { user } = useAuth();
  const { myInstances, getGame, getMessages, sendMessage } = useGroups();
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState('');

  const selectedId = searchParams.get('group');
  const selected = myInstances.find(i => i.id === selectedId);

  const handleSend = () => {
    if (!selected) return;
    const res = sendMessage(selected.id, input);
    if (res.ok) setInput('');
  };

  if (!selected) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-display font-bold">Group Chat</h1>
        <p className="text-sm text-muted-foreground">
          Each Grouping Game group you are randomly placed into gets its own chat room.
        </p>

        {myInstances.length === 0 ? (
          <Card><CardContent className="p-6 text-center space-y-1">
            <p className="font-display font-semibold">No Group Chats Yet</p>
            <p className="text-xs text-muted-foreground">Enter a Grouping Game to be placed into a group and unlock its chat room.</p>
          </CardContent></Card>
        ) : (
          myInstances.map(inst => {
            const game = getGame(inst.gameId);
            const msgs = getMessages(inst.id);
            const last = msgs[msgs.length - 1];
            return (
              <Card key={inst.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSearchParams({ group: inst.id })}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{game?.name ?? 'Grouping Game'} · Group {inst.id.slice(-6).toUpperCase()}</h3>
                      <p className="text-xs text-muted-foreground">
                        ${inst.wager} • {inst.memberIds.length} / {inst.groupSize} bettors
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={`text-[10px] ${statusConfig[inst.status].color}`}>{statusConfig[inst.status].label}</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users size={14} />{inst.memberIds.length}</span>
                    </div>
                  </div>
                  {last && (
                    <p className="text-xs text-muted-foreground mt-2 truncate">
                      <span className="font-semibold">{last.senderName}:</span> {last.text}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    );
  }

  const game = getGame(selected.gameId);
  const msgs = getMessages(selected.id);

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setSearchParams({})}><ArrowLeft size={20} /></Button>
        <div className="min-w-0">
          <h2 className="font-display font-bold truncate">{game?.name ?? 'Grouping Game'} · Group {selected.id.slice(-6).toUpperCase()}</h2>
          <p className="text-xs text-muted-foreground">{selected.memberIds.length} / {selected.groupSize} bettors • ${selected.wager}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {selected.memberNames.map((name, i) => (
          <div key={selected.memberIds[i]} className="shrink-0 flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">{name.charAt(0)}</div>
            <span className="text-xs">{name}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto space-y-3 bg-secondary/20 rounded-lg p-3">
        {msgs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">No messages yet. Say hello to your group.</p>
        ) : (
          msgs.map(msg => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg p-2.5 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
                  {!isMe && <p className="text-xs font-semibold text-primary mb-0.5">{msg.senderName}</p>}
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend} disabled={!input.trim()}><Send size={16} /></Button>
      </div>
    </div>
  );
};

export default GroupChatPage;
