import { useState } from 'react';
import { SAMPLE_TRANSACTIONS, Transaction } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

type TypeFilter = 'all' | 'deposit' | 'withdrawal' | 'bet' | 'payout';
type StatusFilter = 'all' | 'completed' | 'pending' | 'failed' | 'flagged';

interface AdminTx extends Omit<Transaction, 'status'> {
  status: Transaction['status'] | 'flagged';
}

const AdminTransactions = () => {
  const { toast } = useToast();
  const [txns, setTxns] = useState<AdminTx[]>(SAMPLE_TRANSACTIONS);
  const [type, setType] = useState<TypeFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const visible = txns.filter(t =>
    (type === 'all' || t.type === type) &&
    (status === 'all' || t.status === status) &&
    (!from || t.date >= from) &&
    (!to || t.date <= to)
  );

  const setTxStatus = (id: string, next: AdminTx['status'], label: string) => {
    setTxns(prev => prev.map(t => (t.id === id ? { ...t, status: next } : t)));
    toast({ title: label });
  };

  const statusClass = (s: AdminTx['status']) =>
    s === 'completed' ? 'bg-primary/10 text-primary'
      : s === 'pending' ? 'bg-warning/10 text-warning'
      : s === 'flagged' ? 'bg-destructive/10 text-destructive'
      : 'bg-destructive/10 text-destructive';

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-xl">Transaction Management</h1>
      </div>

      <div className="space-y-2">
        <div className="flex gap-1.5 overflow-x-auto">
          {(['all', 'deposit', 'withdrawal', 'bet', 'payout'] as TypeFilter[]).map(f => (
            <button key={f} onClick={() => setType(f)} className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${type === f ? 'gradient-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}>{f}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {(['all', 'completed', 'pending', 'flagged', 'failed'] as StatusFilter[]).map(f => (
            <button key={f} onClick={() => setStatus(f)} className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${status === f ? 'bg-secondary text-foreground border border-primary/40' : 'bg-card border border-border text-muted-foreground'}`}>{f}</button>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-8 w-36 text-xs" />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-8 w-36 text-xs" />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border bg-secondary">
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">User ID</th>
                <th className="text-left p-3">Type</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Provider</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(t => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                  <td className="p-3 text-muted-foreground">{t.id}</td>
                  <td className="p-3">{t.userId}</td>
                  <td className="p-3 capitalize">{t.type}</td>
                  <td className={`p-3 text-right font-bold ${t.amount >= 0 ? 'text-primary' : 'text-foreground'}`}>{t.amount >= 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}</td>
                  <td className="p-3 text-muted-foreground">{t.provider || '-'}</td>
                  <td className="p-3 text-muted-foreground">{t.date}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${statusClass(t.status)}`}>{t.status}</span></td>
                  <td className="p-3">
                    {t.type === 'withdrawal' && t.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button className="text-xs text-primary hover:underline" onClick={() => setTxStatus(t.id, 'completed', `Withdrawal ${t.id} approved`)}>Approve</button>
                        <button className="text-xs text-destructive hover:underline" onClick={() => setTxStatus(t.id, 'flagged', `Withdrawal ${t.id} flagged`)}>Flag</button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">Withdrawals require Admin review before provider payout processing.</p>
    </div>
  );
};

export default AdminTransactions;
