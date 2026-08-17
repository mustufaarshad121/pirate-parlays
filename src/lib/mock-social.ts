// Mock data for all community, social, and advanced features

export type PirateRank = 'Crew member' | 'Deck hand' | 'Cook' | 'Pilot' | 'First mate' | 'Captain';

export const RANK_ORDER: PirateRank[] = ['Crew member', 'Deck hand', 'Cook', 'Pilot', 'First mate', 'Captain'];

export const RANK_ICONS: Record<PirateRank, string> = {
  'Crew member': '⚓',
  'Deck hand': '🪢',
  'Cook': '🍖',
  'Pilot': '🧭',
  'First mate': '⚔️',
  'Captain': '🏴‍☠️',
};

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  rank: PirateRank;
  isCaptain: boolean;
  sportsInterests: string[];
  stats: {
    totalBets: number;
    winRate: number;
    winStreak: number;
    ranking: number;
    xp: number;
    pirateBucks: number;
  };
}

export interface FeedPost {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  rank: PirateRank;
  type: 'post' | 'bet_share' | 'pool_invite';
  content: string;
  betDetails?: {
    match: string;
    outcome: string;
    odds: number;
    stake: number;
    status: 'pending' | 'won' | 'lost';
  };
  poolDetails?: {
    poolId: string;
    name: string;
    members: number;
    maxMembers: number;
  };
  comments: { id: string; username: string; text: string; time: string }[];
  likes: number;
  timestamp: string;
}

export interface Pool {
  id: string;
  name: string;
  type: 'private' | 'public';
  creatorId: string;
  creatorName: string;
  rules: string;
  status: 'open' | 'in_progress' | 'settled';
  members: number;
  maxMembers: number;
  entryFee: number;
  prizePool: number;
  sport: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  pirateRank: PirateRank;
  xp: number;
  winStreak: number;
  winRate: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface DMThread {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

export interface PirateBucksTransaction {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  date: string;
}

export interface RedemptionItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: string;
  image: string;
}

export interface PaymentMethod {
  id: string;
  type: 'paypal' | 'venmo' | 'cashapp' | 'apple_pay' | 'google_pay';
  label: string;
  icon: string;
  isDefault: boolean;
  connected: boolean;
}

// ─── MOCK DATA ───────────────────────────────────────────────

export const CURRENT_PROFILE: UserProfile = {
  id: 'u1',
  username: 'user1',
  avatar: '',
  bio: 'Arrr! Full-time parlay pirate. NFL & NBA specialist. 🏴‍☠️',
  rank: 'Pilot',
  isCaptain: false,
  sportsInterests: ['Football', 'Basketball', 'MMA'],
  stats: {
    totalBets: 142,
    winRate: 62.3,
    winStreak: 7,
    ranking: 23,
    xp: 4850,
    pirateBucks: 320,
  },
};

export const MOCK_FEED: FeedPost[] = [
  {
    id: 'fp1',
    userId: 'u2',
    username: 'JackSparrow22',
    avatar: '',
    rank: 'Captain',
    type: 'bet_share',
    content: '3-leg parlay hit! 🔥 Never doubt the Captain!',
    betDetails: {
      match: 'Lakers vs Celtics',
      outcome: 'Lakers ML + Over 220.5',
      odds: 3.10,
      stake: 100,
      status: 'won',
    },
    comments: [
      { id: 'c1', username: 'ParlayKing', text: 'Nice hit Cap! 🏴‍☠️', time: '2h ago' },
      { id: 'c2', username: 'OddsShark', text: 'Tailing next time', time: '1h ago' },
    ],
    likes: 24,
    timestamp: '3h ago',
  },
  {
    id: 'fp2',
    userId: 'u4',
    username: 'ParlayKing',
    avatar: '',
    rank: 'First mate',
    type: 'pool_invite',
    content: 'Join my NFL Sunday pool! $25 entry, winner takes all.',
    poolDetails: {
      poolId: 'pool2',
      name: 'NFL Sunday Showdown',
      members: 6,
      maxMembers: 10,
    },
    comments: [
      { id: 'c3', username: 'user1', text: 'Count me in!', time: '5h ago' },
    ],
    likes: 8,
    timestamp: '6h ago',
  },
  {
    id: 'fp3',
    userId: 'u5',
    username: 'OddsShark',
    avatar: '',
    rank: 'Deck hand',
    type: 'post',
    content: 'McGregor vs Poirier - who ya got? I\'m leaning Poirier at +160. The value is there.',
    comments: [],
    likes: 15,
    timestamp: '8h ago',
  },
  {
    id: 'fp4',
    userId: 'u2',
    username: 'JackSparrow22',
    avatar: '',
    rank: 'Captain',
    type: 'bet_share',
    content: 'Tonight\'s slip 🎯',
    betDetails: {
      match: 'Buccaneers vs Chiefs',
      outcome: 'Chiefs -3.5',
      odds: 2.00,
      stake: 75,
      status: 'pending',
    },
    comments: [],
    likes: 11,
    timestamp: '12h ago',
  },
];

export const MOCK_POOLS: Pool[] = [
  { id: 'pool1', name: 'Weekend Warriors', type: 'public', creatorId: 'u2', creatorName: 'JackSparrow22', rules: 'Pick 3 winners from NFL Sunday slate. Most correct picks wins.', status: 'open', members: 8, maxMembers: 20, entryFee: 10, prizePool: 80, sport: 'Football' },
  { id: 'pool2', name: 'NFL Sunday Showdown', type: 'public', creatorId: 'u4', creatorName: 'ParlayKing', rules: 'Best 5-leg parlay wins. Must include at least one underdog.', status: 'open', members: 6, maxMembers: 10, entryFee: 25, prizePool: 150, sport: 'Football' },
  { id: 'pool3', name: 'NBA Daily Grind', type: 'public', creatorId: 'u5', creatorName: 'OddsShark', rules: 'Pick ATS for all NBA games tonight. Tiebreaker: total points.', status: 'in_progress', members: 15, maxMembers: 15, entryFee: 5, prizePool: 75, sport: 'Basketball' },
  { id: 'pool4', name: 'VIP High Rollers', type: 'private', creatorId: 'u2', creatorName: 'JackSparrow22', rules: 'Invite only. $100 buy-in. Winner-take-all parlay contest.', status: 'open', members: 3, maxMembers: 5, entryFee: 100, prizePool: 300, sport: 'Football' },
  { id: 'pool5', name: 'Crew Only Pool', type: 'private', creatorId: 'u4', creatorName: 'ParlayKing', rules: 'Private pool for our betting crew. $50 entry.', status: 'settled', members: 8, maxMembers: 8, entryFee: 50, prizePool: 400, sport: 'Basketball' },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'JackSparrow22', avatar: '', pirateRank: 'Captain', xp: 12400, winStreak: 12, winRate: 71.2 },
  { rank: 2, username: 'OddsShark', avatar: '', pirateRank: 'First mate', xp: 9800, winStreak: 8, winRate: 68.5 },
  { rank: 3, username: 'ParlayKing', avatar: '', pirateRank: 'First mate', xp: 8200, winStreak: 5, winRate: 65.1 },
  { rank: 4, username: 'BetMaster99', avatar: '', pirateRank: 'Cook', xp: 6100, winStreak: 3, winRate: 58.9 },
  { rank: 5, username: 'TreasureHunter', avatar: '', pirateRank: 'Pilot', xp: 5600, winStreak: 6, winRate: 60.2 },
  { rank: 6, username: 'DeadMansHand', avatar: '', pirateRank: 'Deck hand', xp: 5200, winStreak: 4, winRate: 57.3 },
  { rank: 7, username: 'SeaDog77', avatar: '', pirateRank: 'Cook', xp: 5100, winStreak: 2, winRate: 55.8 },
  { rank: 8, username: 'CannonBall', avatar: '', pirateRank: 'Pilot', xp: 4900, winStreak: 7, winRate: 61.0 },
  { rank: 9, username: 'user1', avatar: '', pirateRank: 'Pilot', xp: 4850, winStreak: 7, winRate: 62.3 },
  { rank: 10, username: 'RumRunner', avatar: '', pirateRank: 'Crew member', xp: 3200, winStreak: 1, winRate: 48.5 },
];

export const MOCK_DM_THREADS: DMThread[] = [
  { id: 'dm1', recipientId: 'u2', recipientName: 'JackSparrow22', recipientAvatar: '', lastMessage: 'Nice hit on that parlay! 🔥', lastTime: '2h ago', unread: 2 },
  { id: 'dm2', recipientId: 'u4', recipientName: 'ParlayKing', recipientAvatar: '', lastMessage: 'Joining your pool now', lastTime: '5h ago', unread: 0 },
  { id: 'dm3', recipientId: 'u5', recipientName: 'OddsShark', recipientAvatar: '', lastMessage: 'What do you think about the UFC card?', lastTime: '1d ago', unread: 0 },
];

export const MOCK_DM_MESSAGES: Record<string, ChatMessage[]> = {
  dm1: [
    { id: 'dmm1', senderId: 'u2', senderName: 'JackSparrow22', text: 'Hey! You joining my pool tonight?', timestamp: '2026-03-03T10:00:00' },
    { id: 'dmm2', senderId: 'u1', senderName: 'user1', text: 'Yeah for sure! What\'s the buy-in?', timestamp: '2026-03-03T10:05:00' },
    { id: 'dmm3', senderId: 'u2', senderName: 'JackSparrow22', text: '$25. Winner takes all. 🏴‍☠️', timestamp: '2026-03-03T10:10:00' },
    { id: 'dmm4', senderId: 'u2', senderName: 'JackSparrow22', text: 'Nice hit on that parlay! 🔥', timestamp: '2026-03-03T12:00:00' },
  ],
  dm2: [
    { id: 'dmm5', senderId: 'u1', senderName: 'user1', text: 'Hey ParlayKing, got room in your NFL pool?', timestamp: '2026-03-03T08:00:00' },
    { id: 'dmm6', senderId: 'u4', senderName: 'ParlayKing', text: 'Yeah! 4 spots left. Jump in!', timestamp: '2026-03-03T08:30:00' },
    { id: 'dmm7', senderId: 'u1', senderName: 'user1', text: 'Joining your pool now', timestamp: '2026-03-03T09:00:00' },
  ],
  dm3: [
    { id: 'dmm8', senderId: 'u1', senderName: 'user1', text: 'What do you think about the UFC card?', timestamp: '2026-03-02T18:00:00' },
  ],
};

export const MOCK_PIRATE_BUCKS_HISTORY: PirateBucksTransaction[] = [
  { id: 'pb1', type: 'earned', amount: 50, description: '5-day login streak bonus', date: '2026-03-03' },
  { id: 'pb2', type: 'earned', amount: 25, description: 'Parlay win bonus (3+ legs)', date: '2026-03-02' },
  { id: 'pb3', type: 'spent', amount: -100, description: 'Redeemed: Free $10 Bet Token', date: '2026-03-01' },
  { id: 'pb4', type: 'earned', amount: 75, description: 'Weekly challenge completed', date: '2026-02-28' },
  { id: 'pb5', type: 'earned', amount: 30, description: 'Referred a friend', date: '2026-02-27' },
  { id: 'pb6', type: 'earned', amount: 100, description: 'Pool winner bonus', date: '2026-02-25' },
  { id: 'pb7', type: 'spent', amount: -50, description: 'Redeemed: Pirate Parlays T-Shirt', date: '2026-02-24' },
];

export const MOCK_REDEMPTION_ITEMS: RedemptionItem[] = [
  { id: 'r1', name: 'Free $5 Bet Token', description: 'Get a free $5 bet on any market', cost: 50, category: 'Betting', image: '🎰' },
  { id: 'r2', name: 'Free $10 Bet Token', description: 'Get a free $10 bet on any market', cost: 100, category: 'Betting', image: '🎲' },
  { id: 'r3', name: 'Free $25 Bet Token', description: 'Get a free $25 bet on any market', cost: 200, category: 'Betting', image: '💰' },
  { id: 'r4', name: 'Pirate Parlays T-Shirt', description: 'Official merch shipped to you', cost: 50, category: 'Merch', image: '👕' },
  { id: 'r5', name: 'Pirate Parlays Hat', description: 'Official cap with logo', cost: 75, category: 'Merch', image: '🧢' },
  { id: 'r6', name: 'Custom Avatar Frame', description: 'Gold pirate frame for your avatar', cost: 30, category: 'Digital', image: '🖼️' },
  { id: 'r7', name: 'VIP Pool Entry', description: 'Free entry to any VIP pool', cost: 150, category: 'Betting', image: '⭐' },
  { id: 'r8', name: 'Odds Boost Token', description: '+10% odds boost on your next bet', cost: 40, category: 'Betting', image: '🚀' },
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm1', type: 'paypal', label: 'PayPal', icon: '💳', isDefault: true, connected: false },
  { id: 'pm2', type: 'venmo', label: 'Venmo', icon: '📱', isDefault: false, connected: false },
  { id: 'pm3', type: 'cashapp', label: 'Cash App', icon: '💵', isDefault: false, connected: false },
  { id: 'pm4', type: 'apple_pay', label: 'Apple Pay', icon: '🍎', isDefault: false, connected: false },
  { id: 'pm5', type: 'google_pay', label: 'Google Pay', icon: '🔵', isDefault: false, connected: false },
];

export const MOCK_SUGGESTED_PARLAYS = [
  { id: 'sp1', title: '🔥 Hot 3-Leg Parlay', legs: ['Chiefs ML', 'Over 48.5', 'Lakers ML'], odds: 5.15, confidence: 72 },
  { id: 'sp2', title: '⚡ Quick Pick', legs: ['Yankees ML', 'Under 8.5'], odds: 3.10, confidence: 65 },
  { id: 'sp3', title: '🎯 Value Play', legs: ['Poirier ML', 'Maple Leafs ML', 'Man United Draw'], odds: 12.40, confidence: 38 },
];

export const ALL_SPORTS = ['Football', 'Basketball', 'Baseball', 'Hockey', 'Soccer', 'MMA', 'Tennis', 'Golf'];
