import { useState } from 'react';
import { DEMO_TRANSACTIONS } from '@/lib/data';

type Filter = 'all' | 'deposit' | 'withdrawal' | 'bet' | 'payout';

const AdminTransactions = () => {
  const [filter, setFilter] = useState<Filter>('all');
  const txns = DEMO_TRANSACTIONS.filter((t) => filter === 'all' || t.type === filter);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display font-bold text-xl mb-4">Transaction Management</h1>

      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {(['all', 'deposit', 'withdrawal', 'bet', 'payout'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${
              filter === f ? 'gradient-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border bg-secondary">
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Type</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Provider</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                  <td className="p-3 text-muted-foreground">{t.id}</td>
                  <td className="p-3">{t.userId}</td>
                  <td className="p-3 capitalize">{t.type}</td>
                  <td className={`p-3 text-right font-bold ${t.amount >= 0 ? 'text-primary' : 'text-foreground'}`}>
                    {t.amount >= 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                  </td>
                  <td className="p-3 text-muted-foreground">{t.provider || '-'}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'completed' ? 'bg-primary/10 text-primary' : t.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {t.type === 'withdrawal' && t.status === 'pending' && (
                      <div className="flex gap-2">
                        <button className="text-xs text-primary hover:underline">Approve</button>
                        <button className="text-xs text-destructive hover:underline">Flag</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
