import { useBets } from '@/lib/bet-context';
import { useAuth } from '@/lib/auth';
import { Trophy, Clock } from 'lucide-react';

const MyBets = () => {
  const { bets } = useBets();
  const { user } = useAuth();
  const userBets = bets.filter((b) => b.userId === user?.id);

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    won: 'bg-primary/10 text-primary',
    lost: 'bg-destructive/10 text-destructive',
    settled: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-xl mb-1">My Bets</h1>
      <p className="text-muted-foreground text-sm mb-6">Track all your active and past bets</p>

      {userBets.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No bets placed yet.</p>
      ) : (
        <div className="space-y-3">
          {userBets.map((bet) => (
            <div key={bet.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-primary" />
                  <span className="text-xs text-muted-foreground">{bet.txRef}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[bet.status]}`}>
                  {bet.status}
                </span>
              </div>
              {bet.items.map((item, i) => (
                <div key={i} className="text-sm mb-1">
                  <span className="text-muted-foreground">{item.match}</span>
                  <span className="mx-1">•</span>
                  <span>{item.market}: <span className="text-primary font-medium">{item.outcome}</span></span>
                  <span className="ml-2 font-bold text-primary">@{item.odds.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock size={12} />
                  {new Date(bet.placedAt).toLocaleDateString()}
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground">Stake: ${bet.stake}</span>
                  <span className="mx-2 text-muted-foreground">|</span>
                  <span className="font-bold text-primary">Payout: ${bet.payout.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBets;
