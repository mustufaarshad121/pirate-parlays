import { MATCHES } from '@/lib/data';
import { Zap } from 'lucide-react';

const AdminMatches = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display font-bold text-xl mb-4">Matches & Odds Management</h1>

      <div className="space-y-3">
        {MATCHES.map((m) => (
          <div key={m.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">{m.league}</span>
                {m.status === 'live' && (
                  <span className="flex items-center gap-1 text-xs font-bold text-primary">
                    <Zap size={12} /> LIVE
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{m.date} • {m.time}</span>
            </div>
            <p className="font-semibold mb-3">{m.homeTeam} vs {m.awayTeam}</p>

            {m.markets.map((market) => (
              <div key={market.type} className="mb-2">
                <p className="text-xs text-muted-foreground mb-1">{market.label}</p>
                <div className="flex gap-2 flex-wrap">
                  {market.outcomes.map((o) => (
                    <div key={o.id} className="bg-secondary rounded-lg px-3 py-1.5 text-sm">
                      <span className="text-muted-foreground">{o.label}:</span>{' '}
                      <span className="font-bold text-primary">{o.odds.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button className="mt-2 text-xs text-primary hover:underline">Edit Match & Odds</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMatches;
