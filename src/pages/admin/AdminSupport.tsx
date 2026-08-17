import { useState } from 'react';
import { CHATBOT_LOG, FAQS, TICKETS, Ticket } from '@/lib/admin-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Headphones } from 'lucide-react';

const statusStyle: Record<Ticket['status'], string> = {
  open: 'bg-warning/10 text-warning',
  pending: 'bg-primary/10 text-primary',
  resolved: 'bg-muted text-muted-foreground',
};

const AdminSupport = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS);
  const [selectedId, setSelectedId] = useState<string>(TICKETS[0].id);
  const [faqs, setFaqs] = useState(FAQS);
  const [q, setQ] = useState('');
  const [a, setA] = useState('');

  const selected = tickets.find(t => t.id === selectedId);

  const setStatus = (status: Ticket['status']) => {
    setTickets(prev => prev.map(t => (t.id === selectedId ? { ...t, status } : t)));
    toast({ title: `Ticket ${selectedId} marked ${status}` });
  };

  const addFaq = () => {
    if (!q.trim() || !a.trim()) return;
    setFaqs(prev => [...prev, { id: `f${Date.now()}`, question: q.trim(), answer: a.trim() }]);
    setQ(''); setA('');
    toast({ title: 'FAQ added' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-xl flex items-center gap-2"><Headphones size={20} /> Support Portal</h1>
      </div>

      <Tabs defaultValue="tickets">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot Log</TabsTrigger>
          <TabsTrigger value="faq">FAQ Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="space-y-2">
            {tickets.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left bg-card border rounded-lg p-3 transition-colors ${selectedId === t.id ? 'border-primary' : 'border-border hover:border-primary/30'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{t.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${statusStyle[t.status]}`}>{t.status}</span>
                </div>
                <p className="text-sm font-medium">{t.subject}</p>
                <p className="text-xs text-muted-foreground">{t.user} • {t.date}</p>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {t.tags.map(tag => <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>)}
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 space-y-3">
            {selected && (
              <>
                <div>
                  <p className="font-semibold">{selected.subject}</p>
                  <p className="text-xs text-muted-foreground">{selected.id} • {selected.user}</p>
                </div>
                <div className="space-y-2">
                  {selected.messages.map((m, i) => (
                    <div key={i} className={`rounded-lg p-3 text-sm ${m.from === 'agent' ? 'bg-primary/10 ml-6' : 'bg-secondary mr-6'}`}>
                      <p>{m.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{m.from} • {new Date(m.at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1 border-t border-border">
                  {(['open', 'pending', 'resolved'] as Ticket['status'][]).map(s => (
                    <Button key={s} size="sm" variant={selected.status === s ? 'default' : 'outline'} onClick={() => setStatus(s)} className="capitalize">
                      {s}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="chatbot" className="space-y-2 mt-4">
          {CHATBOT_LOG.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-xl p-4 space-y-1">
              <p className="text-xs text-muted-foreground">{c.user} • {new Date(c.at).toLocaleString()}</p>
              <p className="text-sm">{c.message}</p>
              <p className="text-sm text-primary">{c.reply}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="faq" className="space-y-3 mt-4">
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Question" />
            <Textarea value={a} onChange={e => setA(e.target.value)} placeholder="Answer" rows={3} />
            <Button size="sm" onClick={addFaq}>Add FAQ</Button>
          </div>
          {faqs.map(f => (
            <div key={f.id} className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-semibold">{f.question}</p>
              <p className="text-xs text-muted-foreground mt-1">{f.answer}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSupport;
