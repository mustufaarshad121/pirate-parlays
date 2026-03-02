import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { DEMO_TRANSACTIONS, Transaction } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'overview' | 'deposit' | 'withdraw';
type Filter = 'all' | 'deposit' | 'withdrawal' | 'bet' | 'payout';

const WalletPage = () => {
  const { user, updateBalance } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [filter, setFilter] = useState<Filter>('all');
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState('');

  const txns = DEMO_TRANSACTIONS.filter((t) => filter === 'all' || t.type === filter);

  const handleDeposit = () => {
    const n = parseFloat(amount);
    if (n > 0) {
      updateBalance(n);
      setSuccess(`$${n.toFixed(2)} deposited successfully!`);
      setAmount('');
      setTimeout(() => { setSuccess(''); setTab('overview'); }, 2000);
    }
  };

  const handleWithdraw = () => {
    const n = parseFloat(amount);
    if (n > 0 && n <= (user?.balance || 0)) {
      updateBalance(-n);
      setSuccess(`Withdrawal of $${n.toFixed(2)} requested. Under review.`);
      setAmount('');
      setTimeout(() => { setSuccess(''); setTab('overview'); }, 2000);
    }
  };

  const typeIcons: Record<string, JSX.Element> = {
    deposit: <ArrowDownLeft size={14} className="text-primary" />,
    withdrawal: <ArrowUpRight size={14} className="text-destructive" />,
    bet: <ArrowUpRight size={14} className="text-warning" />,
    payout: <ArrowDownLeft size={14} className="text-primary" />,
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-display font-bold text-xl mb-6">Wallet</h1>

      {/* Balance card */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 gradient-card">
        <div className="flex items-center gap-2 mb-2">
          <WalletIcon size={18} className="text-primary" />
          <span className="text-sm text-muted-foreground">Available Balance</span>
        </div>
        <p className="font-display text-3xl font-bold text-primary">${user?.balance.toFixed(2)}</p>
        <div className="flex gap-2 mt-4">
          <Button onClick={() => setTab('deposit')} className="flex-1 gradient-primary text-primary-foreground font-semibold">
            Deposit
          </Button>
          <Button onClick={() => setTab('withdraw')} variant="outline" className="flex-1 border-border">
            Withdraw
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-primary"
          >
            <CheckCircle size={16} /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {(tab === 'deposit' || tab === 'withdraw') && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="font-display font-bold text-lg mb-4">{tab === 'deposit' ? 'Deposit' : 'Withdraw'}</h2>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="bg-secondary border-border mb-4"
          />
          {tab === 'withdraw' && (
            <p className="text-xs text-muted-foreground mb-4">Available: ${user?.balance.toFixed(2)}. Withdrawals are reviewed by admin.</p>
          )}
          <div className="flex gap-2">
            <Button onClick={tab === 'deposit' ? handleDeposit : handleWithdraw} className="flex-1 gradient-primary text-primary-foreground font-semibold">
              {tab === 'deposit' ? 'Confirm Deposit' : 'Request Withdrawal'}
            </Button>
            <Button variant="outline" onClick={() => setTab('overview')} className="border-border">Cancel</Button>
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div>
        <h2 className="font-display font-bold mb-3">Transaction History</h2>
        <div className="flex gap-1.5 mb-4 overflow-x-auto">
          {(['all', 'deposit', 'withdrawal', 'bet', 'payout'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${
                filter === f ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {txns.map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  {typeIcons[t.type]}
                </div>
                <div>
                  <p className="text-sm font-medium capitalize">{t.type}</p>
                  <p className="text-xs text-muted-foreground">{t.date}{t.provider ? ` • ${t.provider}` : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${t.amount >= 0 ? 'text-primary' : 'text-foreground'}`}>
                  {t.amount >= 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                </p>
                <p className={`text-[10px] capitalize ${t.status === 'completed' ? 'text-primary' : t.status === 'pending' ? 'text-warning' : 'text-destructive'}`}>
                  {t.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
