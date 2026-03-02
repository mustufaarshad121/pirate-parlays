export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  sport: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
  markets: Market[];
}

export interface Market {
  type: 'moneyline' | 'over_under' | 'spread';
  label: string;
  outcomes: Outcome[];
}

export interface Outcome {
  id: string;
  label: string;
  odds: number;
}

export interface BetSlipItem {
  matchId: string;
  match: string;
  market: string;
  outcome: string;
  odds: number;
  outcomeId: string;
}

export interface Bet {
  id: string;
  userId: string;
  items: BetSlipItem[];
  stake: number;
  totalOdds: number;
  payout: number;
  status: 'pending' | 'won' | 'lost' | 'settled';
  placedAt: string;
  txRef: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'payout';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  provider?: string;
}

export interface Notification {
  id: string;
  type: 'bet_placed' | 'bet_settled' | 'match_result' | 'promotion';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const SPORTS = ['All', 'Football', 'Basketball', 'Baseball', 'Hockey', 'Soccer', 'MMA'];

export const MATCHES: Match[] = [
  {
    id: 'm1',
    homeTeam: 'Tampa Bay Buccaneers',
    awayTeam: 'Kansas City Chiefs',
    league: 'NFL',
    sport: 'Football',
    date: '2026-03-05',
    time: '8:00 PM',
    status: 'upcoming',
    markets: [
      {
        type: 'moneyline',
        label: 'Moneyline',
        outcomes: [
          { id: 'o1', label: 'Buccaneers', odds: 2.10 },
          { id: 'o2', label: 'Chiefs', odds: 1.75 },
        ],
      },
      {
        type: 'over_under',
        label: 'Over/Under 48.5',
        outcomes: [
          { id: 'o3', label: 'Over 48.5', odds: 1.90 },
          { id: 'o4', label: 'Under 48.5', odds: 1.95 },
        ],
      },
      {
        type: 'spread',
        label: 'Spread',
        outcomes: [
          { id: 'o5', label: 'Buccaneers +3.5', odds: 1.85 },
          { id: 'o6', label: 'Chiefs -3.5', odds: 2.00 },
        ],
      },
    ],
  },
  {
    id: 'm2',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Boston Celtics',
    league: 'NBA',
    sport: 'Basketball',
    date: '2026-03-04',
    time: '7:30 PM',
    status: 'live',
    homeScore: 87,
    awayScore: 82,
    markets: [
      {
        type: 'moneyline',
        label: 'Moneyline',
        outcomes: [
          { id: 'o7', label: 'Lakers', odds: 1.65 },
          { id: 'o8', label: 'Celtics', odds: 2.25 },
        ],
      },
      {
        type: 'over_under',
        label: 'Over/Under 220.5',
        outcomes: [
          { id: 'o9', label: 'Over 220.5', odds: 1.88 },
          { id: 'o10', label: 'Under 220.5', odds: 1.97 },
        ],
      },
      {
        type: 'spread',
        label: 'Spread',
        outcomes: [
          { id: 'o11', label: 'Lakers -4.5', odds: 1.90 },
          { id: 'o12', label: 'Celtics +4.5', odds: 1.95 },
        ],
      },
    ],
  },
  {
    id: 'm3',
    homeTeam: 'New York Yankees',
    awayTeam: 'Houston Astros',
    league: 'MLB',
    sport: 'Baseball',
    date: '2026-03-06',
    time: '1:05 PM',
    status: 'upcoming',
    markets: [
      {
        type: 'moneyline',
        label: 'Moneyline',
        outcomes: [
          { id: 'o13', label: 'Yankees', odds: 1.55 },
          { id: 'o14', label: 'Astros', odds: 2.50 },
        ],
      },
      {
        type: 'over_under',
        label: 'Over/Under 8.5',
        outcomes: [
          { id: 'o15', label: 'Over 8.5', odds: 1.85 },
          { id: 'o16', label: 'Under 8.5', odds: 2.00 },
        ],
      },
      {
        type: 'spread',
        label: 'Spread',
        outcomes: [
          { id: 'o17', label: 'Yankees -1.5', odds: 2.15 },
          { id: 'o18', label: 'Astros +1.5', odds: 1.72 },
        ],
      },
    ],
  },
  {
    id: 'm4',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    league: 'Premier League',
    sport: 'Soccer',
    date: '2026-03-07',
    time: '3:00 PM',
    status: 'upcoming',
    markets: [
      {
        type: 'moneyline',
        label: 'Moneyline',
        outcomes: [
          { id: 'o19', label: 'Man United', odds: 3.20 },
          { id: 'o20', label: 'Draw', odds: 3.40 },
          { id: 'o21', label: 'Liverpool', odds: 2.10 },
        ],
      },
      {
        type: 'over_under',
        label: 'Over/Under 2.5',
        outcomes: [
          { id: 'o22', label: 'Over 2.5', odds: 1.80 },
          { id: 'o23', label: 'Under 2.5', odds: 2.05 },
        ],
      },
    ],
  },
  {
    id: 'm5',
    homeTeam: 'Connor McGregor',
    awayTeam: 'Dustin Poirier',
    league: 'UFC 310',
    sport: 'MMA',
    date: '2026-03-08',
    time: '10:00 PM',
    status: 'upcoming',
    markets: [
      {
        type: 'moneyline',
        label: 'Moneyline',
        outcomes: [
          { id: 'o24', label: 'McGregor', odds: 2.40 },
          { id: 'o25', label: 'Poirier', odds: 1.60 },
        ],
      },
    ],
  },
  {
    id: 'm6',
    homeTeam: 'Toronto Maple Leafs',
    awayTeam: 'Montreal Canadiens',
    league: 'NHL',
    sport: 'Hockey',
    date: '2026-03-05',
    time: '7:00 PM',
    status: 'live',
    homeScore: 3,
    awayScore: 2,
    markets: [
      {
        type: 'moneyline',
        label: 'Moneyline',
        outcomes: [
          { id: 'o26', label: 'Maple Leafs', odds: 1.45 },
          { id: 'o27', label: 'Canadiens', odds: 2.80 },
        ],
      },
      {
        type: 'over_under',
        label: 'Over/Under 5.5',
        outcomes: [
          { id: 'o28', label: 'Over 5.5', odds: 1.95 },
          { id: 'o29', label: 'Under 5.5', odds: 1.90 },
        ],
      },
    ],
  },
];

export const DEMO_BETS: Bet[] = [
  {
    id: 'b1',
    userId: 'u1',
    items: [
      { matchId: 'm2', match: 'Lakers vs Celtics', market: 'Moneyline', outcome: 'Lakers', odds: 1.65, outcomeId: 'o7' },
    ],
    stake: 50,
    totalOdds: 1.65,
    payout: 82.50,
    status: 'pending',
    placedAt: '2026-03-02T14:30:00',
    txRef: 'TX-PP-00001',
  },
  {
    id: 'b2',
    userId: 'u1',
    items: [
      { matchId: 'm1', match: 'Buccaneers vs Chiefs', market: 'Spread', outcome: 'Chiefs -3.5', odds: 2.00, outcomeId: 'o6' },
      { matchId: 'm3', match: 'Yankees vs Astros', market: 'Moneyline', outcome: 'Yankees', odds: 1.55, outcomeId: 'o13' },
    ],
    stake: 25,
    totalOdds: 3.10,
    payout: 77.50,
    status: 'pending',
    placedAt: '2026-03-02T15:00:00',
    txRef: 'TX-PP-00002',
  },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 't1', userId: 'u1', type: 'deposit', amount: 500, status: 'completed', date: '2026-02-28', provider: 'Visa' },
  { id: 't2', userId: 'u1', type: 'deposit', amount: 1000, status: 'completed', date: '2026-03-01', provider: 'Mastercard' },
  { id: 't3', userId: 'u1', type: 'bet', amount: -50, status: 'completed', date: '2026-03-02' },
  { id: 't4', userId: 'u1', type: 'bet', amount: -25, status: 'completed', date: '2026-03-02' },
  { id: 't5', userId: 'u1', type: 'payout', amount: 150, status: 'completed', date: '2026-03-01' },
  { id: 't6', userId: 'u1', type: 'withdrawal', amount: -200, status: 'pending', date: '2026-03-02', provider: 'Bank Transfer' },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'bet_placed', title: 'Bet Placed', message: 'Your $50 bet on Lakers ML has been placed.', timestamp: '2026-03-02T14:30:00', read: false },
  { id: 'n2', type: 'promotion', title: '🏴‍☠️ Pirate Bucks Bonus!', message: 'Earn 2x Pirate Bucks on all parlays this weekend!', timestamp: '2026-03-02T10:00:00', read: false },
  { id: 'n3', type: 'match_result', title: 'Match Result', message: 'Celtics vs Heat final: 112-105. Your bet is settled.', timestamp: '2026-03-01T22:00:00', read: true },
  { id: 'n4', type: 'bet_settled', title: 'Bet Won! 🎉', message: 'You won $150 on your parlay!', timestamp: '2026-03-01T22:05:00', read: true },
];

// Admin stats
export const ADMIN_STATS = {
  totalUsers: 2847,
  activeBets: 156,
  revenue: 45230,
  pendingWithdrawals: 12,
};

export const ADMIN_USERS = [
  { id: 'u1', name: 'user1', email: 'user1@email.com', status: 'active' as const, balance: 1250, kyc: 'verified' as const, joined: '2026-01-15' },
  { id: 'u2', name: 'JackSparrow22', email: 'jack@email.com', status: 'active' as const, balance: 3500, kyc: 'verified' as const, joined: '2026-01-20' },
  { id: 'u3', name: 'BetMaster99', email: 'bet@email.com', status: 'suspended' as const, balance: 0, kyc: 'pending' as const, joined: '2026-02-01' },
  { id: 'u4', name: 'ParlayKing', email: 'parlay@email.com', status: 'active' as const, balance: 890, kyc: 'verified' as const, joined: '2026-02-10' },
  { id: 'u5', name: 'OddsShark', email: 'odds@email.com', status: 'active' as const, balance: 5200, kyc: 'verified' as const, joined: '2026-02-15' },
];
