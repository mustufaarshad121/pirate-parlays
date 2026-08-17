import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { MOCK_DM_THREADS, MOCK_DM_MESSAGES, type ChatMessage } from '@/lib/mock-social';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';

const DMPage = () => {
  const { user } = useAuth();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState(MOCK_DM_MESSAGES);
  const [threads, setThreads] = useState(MOCK_DM_THREADS);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || !selectedThread) return;
    const msg: ChatMessage = {
      id: `dm-${Date.now()}`,
      senderId: user!.id,
      senderName: user!.username,
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => ({
      ...prev,
      [selectedThread]: [...(prev[selectedThread] || []), msg],
    }));
    setThreads(prev => prev.map(t => t.id === selectedThread ? { ...t, lastMessage: input, lastTime: 'Just now', unread: 0 } : t));
    setInput('');
  };

  if (!selectedThread) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><MessageCircle size={24} /> Messages</h1>
        </div>

        {threads.map(thread => (
          <Card key={thread.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => { setSelectedThread(thread.id); setThreads(p => p.map(t => t.id === thread.id ? { ...t, unread: 0 } : t)); }}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0">
                  {thread.recipientName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{thread.recipientName}</span>
                    <span className="text-xs text-muted-foreground">{thread.lastTime}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{thread.lastMessage}</p>
                </div>
                {thread.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {thread.unread}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const thread = threads.find(t => t.id === selectedThread)!;
  const threadMsgs = messages[selectedThread] || [];

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setSelectedThread(null)}><ArrowLeft size={20} /></Button>
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">{thread.recipientName.charAt(0)}</div>
        <h2 className="font-display font-bold">{thread.recipientName}</h2>
      </div>

      <div className="flex-1 overflow-auto space-y-3 bg-secondary/20 rounded-lg p-3">
        {threadMsgs.map(msg => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg px-3 py-2 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mt-3">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' && handleSend()} />
        <Button onClick={handleSend} disabled={!input.trim()}><Send size={16} /></Button>
      </div>
    </div>
  );
};

export default DMPage;
