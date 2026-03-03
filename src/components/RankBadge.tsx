import { type PirateRank, RANK_ICONS } from '@/lib/mock-social';

const rankColors: Record<PirateRank, string> = {
  'Crew member': 'bg-muted text-muted-foreground',
  'Deck hand': 'bg-secondary text-secondary-foreground',
  'Cook': 'bg-warning/20 text-warning',
  'Pilot': 'bg-primary/20 text-primary',
  'First mate': 'bg-primary/30 text-primary',
  'Captain': 'bg-primary text-primary-foreground',
};

const RankBadge = ({ rank, size = 'sm' }: { rank: PirateRank; size?: 'sm' | 'md' }) => (
  <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${rankColors[rank]} ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'}`}>
    {RANK_ICONS[rank]} {rank}
  </span>
);

export default RankBadge;
