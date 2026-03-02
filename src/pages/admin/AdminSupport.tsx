import { useState } from 'react';
import { MessageSquare, Clock } from 'lucide-react';

const tickets = [
  { id: 'T-001', user: 'JackSparrow22', subject: 'Cannot withdraw funds', status: 'open', date: '2026-03-02' },
  { id: 'T-002', user: 'BetMaster99', subject: 'Account suspended unfairly', status: 'open', date: '2026-03-01' },
  { id: 'T-003', user: 'ParlayKing', subject: 'Bet not settled', status: 'resolved', date: '2026-02-28' },
  { id: 'T-004', user: 'OddsShark', subject: 'Wrong odds displayed', status: 'resolved', date: '2026-02-27' },
];

const AdminSupport = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display font-bold text-xl mb-4">Support Portal</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-2">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`bg-card border rounded-lg p-3 cursor-pointer transition-colors ${
                selected === t.id ? 'border-primary' : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{t.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.status === 'open' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-sm font-medium">{t.subject}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock size={10} /> {t.date} • {t.user}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-card border border-border rounded-xl p-5 h-full">
              <h2 className="font-display font-bold mb-4">
                {tickets.find((t) => t.id === selected)?.subject}
              </h2>
              <div className="space-y-3 mb-6">
                <div className="bg-secondary rounded-lg p-3 text-sm max-w-[80%]">
                  <p className="text-xs text-muted-foreground mb-1">User</p>
                  I've been trying to withdraw my winnings but the request keeps failing. Can you help?
                </div>
                <div className="bg-primary/10 rounded-lg p-3 text-sm max-w-[80%] ml-auto">
                  <p className="text-xs text-primary mb-1">Support</p>
                  We're looking into your withdrawal request. Please allow 24-48 hours for review.
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  placeholder="Type a response..."
                  className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold">
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <MessageSquare size={32} className="mx-auto mb-2" />
                <p>Select a ticket to view conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;
