import { useParams, useNavigate } from 'react-router-dom';
import { MATCHES } from '@/lib/data';
import { useBets } from '@/lib/bet-context';
import { ArrowLeft, Zap, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const match = MATCHES.find((m) => m.id === id);
  const { addToSlip, isInSlip, slipItems } = useBets();

  if (!match) return <p className="text-center text-muted-foreground py-12">Match not found.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded">{match.league}</span>
          {match.status === 'live' && (
            <span className="flex items-center gap-1 text-xs font-bold text-primary">
              <Zap size={12} className="animate-pulse" /> LIVE
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-4">{match.date} • {match.time}</p>

        <div className="flex items-center justify-around text-center">
          <div>
            <p className="font-display font-bold text-lg">{match.homeTeam}</p>
            {match.homeScore !== undefined && (
              <p className="font-display text-3xl font-bold text-primary mt-1">{match.homeScore}</p>
            )}
          </div>
          <span className="text-muted-foreground font-bold text-lg">VS</span>
          <div>
            <p className="font-display font-bold text-lg">{match.awayTeam}</p>
            {match.awayScore !== undefined && (
              <p className="font-display text-3xl font-bold text-primary mt-1">{match.awayScore}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Markets */}
      <h2 className="font-display font-bold text-lg mb-4">Markets</h2>
      <div className="space-y-4">
        {match.markets.map((market) => (
          <div key={market.type} className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">{market.label}</h3>
            <div className="grid grid-cols-2 gap-2">
              {market.outcomes.map((o) => {
                const inSlip = isInSlip(o.id);
                return (
                  <button
                    key={o.id}
                    onClick={() => {
                      if (!inSlip) {
                        addToSlip({
                          matchId: match.id,
                          match: `${match.homeTeam} vs ${match.awayTeam}`,
                          market: market.label,
                          outcome: o.label,
                          odds: o.odds,
                          outcomeId: o.id,
                        });
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      inSlip
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary hover:border-primary/40'
                    }`}
                  >
                    <span className="text-sm font-medium">{o.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-primary">{o.odds.toFixed(2)}</span>
                      {inSlip ? <Check size={14} /> : <Plus size={14} className="text-muted-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating bet slip indicator */}
      {slipItems.length > 0 && (
        <motion.button
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          onClick={() => navigate('/bet-slip')}
          className="fixed bottom-20 md:bottom-6 right-6 gradient-primary text-primary-foreground font-bold px-6 py-3 rounded-full glow-green flex items-center gap-2 z-50"
        >
          Bet Slip ({slipItems.length})
        </motion.button>
      )}
    </div>
  );
};

export default MatchDetails;
