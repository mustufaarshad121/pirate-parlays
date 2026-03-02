import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MATCHES, SPORTS, Match } from '@/lib/data';
import { motion } from 'framer-motion';
import { Search, Zap } from 'lucide-react';

const sportEmojis: Record<string, string> = {
  Football: '🏈', Basketball: '🏀', Baseball: '⚾', Hockey: '🏒', Soccer: '⚽', MMA: '🥊',
};

const Home = () => {
  const [sport, setSport] = useState('All');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = MATCHES.filter((m) => {
    if (sport !== 'All' && m.sport !== sport) return false;
    if (search && !(m.homeTeam + m.awayTeam + m.league).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-1">Matches</h1>
      <p className="text-muted-foreground text-sm mb-5">Discover & bet on live and upcoming matches</p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search matches..."
          className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Sports filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {SPORTS.map((s) => (
          <button
            key={s}
            onClick={() => setSport(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              sport === s
                ? 'gradient-primary text-primary-foreground glow-green-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {s !== 'All' && <span className="mr-1">{sportEmojis[s]}</span>}
            {s}
          </button>
        ))}
      </div>

      {/* Match list */}
      <div className="space-y-3">
        {filtered.map((match, i) => (
          <MatchCard key={match.id} match={match} index={i} onClick={() => navigate(`/match/${match.id}`)} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No matches found.</p>
        )}
      </div>
    </div>
  );
};

const MatchCard = ({ match, index, onClick }: { match: Match; index: number; onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    onClick={onClick}
    className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-all group"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded">
        {match.league}
      </span>
      <div className="flex items-center gap-2">
        {match.status === 'live' && (
          <span className="flex items-center gap-1 text-xs font-bold text-primary">
            <Zap size={12} className="animate-pulse" /> LIVE
          </span>
        )}
        <span className="text-xs text-muted-foreground">{match.date} • {match.time}</span>
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="font-semibold text-sm">{match.homeTeam}</p>
        <p className="font-semibold text-sm text-muted-foreground">vs</p>
        <p className="font-semibold text-sm">{match.awayTeam}</p>
      </div>
      {match.status === 'live' && match.homeScore !== undefined && (
        <div className="text-right">
          <p className="font-display font-bold text-lg text-primary">{match.homeScore}</p>
          <p className="text-xs text-muted-foreground">-</p>
          <p className="font-display font-bold text-lg text-primary">{match.awayScore}</p>
        </div>
      )}
    </div>

    {/* Quick odds */}
    {match.markets[0] && (
      <div className="flex gap-2 mt-3">
        {match.markets[0].outcomes.map((o) => (
          <div
            key={o.id}
            className="flex-1 bg-secondary rounded-lg py-1.5 px-2 text-center group-hover:bg-muted transition-colors"
          >
            <p className="text-[10px] text-muted-foreground truncate">{o.label}</p>
            <p className="text-sm font-bold text-primary">{o.odds.toFixed(2)}</p>
          </div>
        ))}
      </div>
    )}
  </motion.div>
);

export default Home;
