import { useState } from 'react';
import { useBets } from '@/lib/bet-context';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BetSlip = () => {
  const { slipItems, removeFromSlip, clearSlip, placeBet } = useBets();
  const { user } = useAuth();
  const [stake, setStake] = useState('');
  const [txRef, setTxRef] = useState<string | null>(null);
  const navigate = useNavigate();

  const totalOdds = slipItems.reduce((acc, i) => acc * i.odds, 1);
  const stakeNum = parseFloat(stake) || 0;
  const payout = +(stakeNum * totalOdds).toFixed(2);

  const handlePlace = () => {
    const ref = placeBet(stakeNum);
    if (ref) {
      setTxRef(ref);
      setStake('');
    }
  };

  if (txRef) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
        </motion.div>
        <h2 className="font-display font-bold text-xl mb-2">Bet Placed!</h2>
        <p className="text-muted-foreground text-sm mb-4">Transaction Ref: <code className="bg-secondary px-2 py-0.5 rounded">{txRef}</code></p>
        <Button onClick={() => { setTxRef(null); navigate('/'); }} className="gradient-primary text-primary-foreground">
          Back to Matches
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-xl">Bet Slip</h1>
        {slipItems.length > 0 && (
          <button onClick={clearSlip} className="text-xs text-destructive flex items-center gap-1">
            <Trash2 size={12} /> Clear All
          </button>
        )}
      </div>

      {slipItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Your bet slip is empty.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>Browse Matches</Button>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-6">
            <AnimatePresence>
              {slipItems.map((item) => (
                <motion.div
                  key={item.outcomeId}
                  layout
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-card border border-border rounded-lg p-3 flex items-start justify-between"
                >
                  <div>
                    <p className="text-xs text-muted-foreground">{item.match}</p>
                    <p className="text-sm font-medium">{item.market}: <span className="text-primary">{item.outcome}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">{item.odds.toFixed(2)}</span>
                    <button onClick={() => removeFromSlip(item.outcomeId)} className="text-muted-foreground hover:text-destructive">
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Odds</span>
              <span className="font-bold text-primary">{totalOdds.toFixed(2)}</span>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Stake Amount ($)</label>
              <Input
                type="number"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                placeholder="0.00"
                className="bg-secondary border-border"
              />
            </div>

            {stakeNum > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Potential Payout</span>
                <span className="font-display font-bold text-lg text-primary">${payout.toFixed(2)}</span>
              </div>
            )}

            {stakeNum > (user?.balance || 0) && (
              <p className="text-destructive text-xs">Insufficient balance</p>
            )}

            <Button
              onClick={handlePlace}
              disabled={stakeNum <= 0 || stakeNum > (user?.balance || 0)}
              className="w-full gradient-primary text-primary-foreground font-bold h-12 glow-green disabled:opacity-50"
            >
              Place Bet
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default BetSlip;
