import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { MOCK_GROUPS, MOCK_GROUP_MESSAGES, type ChatMessage, MOCK_SUGGESTED_PARLAYS } from '@/lib/mock-social';
import RankBadge from '@/components/RankBadge';
import DemoBadge from '@/components/DemoBadge';
import { ArrowLeft, Send, Users, Zap } from 'lucide-react';

const GroupChatPage = () => {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [messages, setMessages] = useState(MOCK_GROUP_MESSAGES);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || !selectedGroup) return;
    const msg: ChatMessage = {
      id: `gm-${Date.now()}`,
      senderId: user!.id,
      senderName: user!.username,
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => ({
      ...prev,
      [selectedGroup]: [...(prev[selectedGroup] || []), msg],
    }));
    setInput('');
  };

  if (!selectedGroup) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Group Chat</h1>
          <DemoBadge />
        </div>
        <p className="text-sm text-muted-foreground">Chat with your crew members in group rooms.</p>

        {MOCK_GROUPS.map(group => (
          <Card key={group.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelectedGroup(group.id)}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{group.name}</h3>
                  <p className="text-xs text-muted-foreground">Captain: {group.captainName} • {group.currentUsers}/{group.maxUsers} members</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users size={14} />
                  <span>{group.currentUsers}</span>
                </div>
              </div>
              {messages[group.id] && (
                <p className="text-xs text-muted-foreground mt-2 truncate">
                  <span className="font-semibold">{messages[group.id][messages[group.id].length - 1].senderName}:</span>{' '}
                  {messages[group.id][messages[group.id].length - 1].text}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Suggested Parlays based on group data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Zap size={16} className="text-warning" /> Suggested Props & Parlays</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">Based on your group's interests</p>
            {MOCK_SUGGESTED_PARLAYS.map(p => (
              <div key={p.id} className="bg-secondary/50 rounded-lg p-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.legs.join(' • ')}</p>
                </div>
                <span className="text-primary font-bold text-sm">{p.odds.toFixed(2)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const group = MOCK_GROUPS.find(g => g.id === selectedGroup)!;
  const groupMsgs = messages[selectedGroup] || [];

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setSelectedGroup(null)}><ArrowLeft size={20} /></Button>
        <div>
          <h2 className="font-display font-bold">{group.name}</h2>
          <p className="text-xs text-muted-foreground">{group.currentUsers} members • Captain: {group.captainName}</p>
        </div>
        <DemoBadge />
      </div>

      {/* Members */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {group.members.map(m => (
          <div key={m.id} className="shrink-0 flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">{m.username.charAt(0)}</div>
            <span className="text-xs">{m.username}</span>
            <RankBadge rank={m.rank} />
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto space-y-3 bg-secondary/20 rounded-lg p-3">
        {groupMsgs.map(msg => {
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

      {/* Input */}
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
