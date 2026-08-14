// Admin demo records. Content is illustrative only — not confirmed production data.

export interface OversightUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  status: 'active' | 'suspended';
  balance: number;
  kyc: 'verified' | 'pending';
  joined: string;
  posts: number;
  comments: number;
  flags: number;
}

export const OVERSIGHT_USERS: OversightUser[] = [
  { id: 'u1', name: 'user1', email: 'user1@email.com', avatar: '🏴‍☠️', bio: 'Weekend slate specialist.', status: 'active', balance: 1250, kyc: 'verified', joined: '2026-01-15', posts: 12, comments: 34, flags: 0 },
  { id: 'u2', name: 'JackSparrow22', email: 'jack@email.com', avatar: '⚓', bio: 'Chasing the streak.', status: 'active', balance: 3500, kyc: 'verified', joined: '2026-01-20', posts: 41, comments: 96, flags: 1 },
  { id: 'u3', name: 'BetMaster99', email: 'bet@email.com', avatar: '💀', bio: 'No bio provided.', status: 'suspended', balance: 0, kyc: 'pending', joined: '2026-02-01', posts: 5, comments: 8, flags: 4 },
  { id: 'u4', name: 'ParlayKing', email: 'parlay@email.com', avatar: '👑', bio: 'Three-leg enjoyer.', status: 'active', balance: 890, kyc: 'verified', joined: '2026-02-10', posts: 23, comments: 51, flags: 0 },
  { id: 'u5', name: 'OddsShark', email: 'odds@email.com', avatar: '🦈', bio: 'Line shopper.', status: 'active', balance: 5200, kyc: 'verified', joined: '2026-02-15', posts: 67, comments: 120, flags: 2 },
];

export interface ModerationItem {
  id: string;
  kind: 'post' | 'comment';
  author: string;
  content: string;
  reportedBy?: string;
  reason?: string;
  createdAt: string;
  state: 'queued' | 'approved' | 'rejected' | 'removed';
}

export const MODERATION_QUEUE: ModerationItem[] = [
  { id: 'mod1', kind: 'post', author: 'BetMaster99', content: 'Anyone want to trade picks off-platform?', createdAt: '2026-03-02T09:12:00', state: 'queued' },
  { id: 'mod2', kind: 'comment', author: 'OddsShark', content: 'That slip is garbage, mate.', createdAt: '2026-03-02T10:40:00', state: 'queued' },
  { id: 'mod3', kind: 'post', author: 'ParlayKing', content: 'Locked in my winners for the slate.', createdAt: '2026-03-02T11:05:00', state: 'queued' },
];

export const REPORTED_CONTENT: ModerationItem[] = [
  { id: 'rep1', kind: 'comment', author: 'BetMaster99', content: 'Spam link removed by reporter description.', reportedBy: 'JackSparrow22', reason: 'Spam', createdAt: '2026-03-01T18:22:00', state: 'queued' },
  { id: 'rep2', kind: 'post', author: 'OddsShark', content: 'Heated argument in a group thread.', reportedBy: 'user1', reason: 'Harassment', createdAt: '2026-03-01T20:02:00', state: 'queued' },
];

export interface Promotion {
  id: string;
  name: string;
  bonusType: string;
  targeting: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export const PROMOTIONS: Promotion[] = [
  { id: 'p1', name: 'Weekend Engagement Boost', bonusType: 'Pirate Bucks bonus', targeting: 'All users', startDate: '2026-03-06', endDate: '2026-03-09', active: true },
  { id: 'p2', name: 'Returning Crew', bonusType: 'Deposit match', targeting: 'Inactive users', startDate: '2026-02-20', endDate: '2026-02-28', active: false },
];

export const BONUS_TYPES = ['Deposit match', 'Free bet', 'Pirate Bucks bonus', 'Odds boost'];
export const TARGET_SEGMENTS = ['All users', 'VIP', 'High-risk', 'Inactive users'];

export const SEGMENTS = [
  { key: 'VIP', count: 128, note: 'Highest lifetime stake volume' },
  { key: 'High-risk', count: 34, note: 'Flagged withdrawals or moderation flags' },
  { key: 'Inactive', count: 412, note: 'No activity in the current period' },
];

export const REVENUE_BY_SPORT = [
  { label: 'NFL', value: 24100 },
  { label: 'NBA', value: 14300 },
  { label: 'EPL', value: 6830 },
];

export const REVENUE_BY_REGION = [
  { label: 'North America', value: 31200 },
  { label: 'Europe', value: 10400 },
  { label: 'Other', value: 3630 },
];

export const REVENUE_BY_MARKET = [
  { label: 'Moneyline', value: 19800 },
  { label: 'Spread', value: 15100 },
  { label: 'Over/Under', value: 10330 },
];

export interface Ticket {
  id: string;
  user: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved';
  date: string;
  tags: string[];
  messages: { from: 'user' | 'agent'; text: string; at: string }[];
}

export const TICKETS: Ticket[] = [
  {
    id: 'T-001', user: 'JackSparrow22', subject: 'Cannot withdraw funds', status: 'open', date: '2026-03-02', tags: ['withdrawal', 'kyc'],
    messages: [
      { from: 'user', text: 'My withdrawal has been pending for two days.', at: '2026-03-02T09:00:00' },
      { from: 'agent', text: 'Thanks — the request is queued for Admin review.', at: '2026-03-02T09:30:00' },
    ],
  },
  {
    id: 'T-002', user: 'BetMaster99', subject: 'Account suspended unfairly', status: 'pending', date: '2026-03-01', tags: ['account'],
    messages: [{ from: 'user', text: 'Why was my account suspended?', at: '2026-03-01T14:10:00' }],
  },
  {
    id: 'T-003', user: 'ParlayKing', subject: 'Bet not settled', status: 'resolved', date: '2026-02-28', tags: ['settlement'],
    messages: [
      { from: 'user', text: 'My bet still shows pending after the final whistle.', at: '2026-02-28T21:00:00' },
      { from: 'agent', text: 'Settled now — apologies for the delay.', at: '2026-02-28T21:40:00' },
    ],
  },
];

export const CHATBOT_LOG = [
  { id: 'c1', user: 'user1', message: 'How do I join a Grouping Game?', reply: 'Open Grouping Game, pick your winners or losers, choose a wager and group size, then submit.', at: '2026-03-02T08:15:00' },
  { id: 'c2', user: 'OddsShark', message: 'What happens if fewer than 5 join?', reply: 'The group is null and void, and you are offered the chance to fill out another slip.', at: '2026-03-02T08:44:00' },
  { id: 'c3', user: 'ParlayKing', message: 'Where do I see my transactions?', reply: 'Wallet → Transaction History, with filters for deposits, withdrawals and bets.', at: '2026-03-01T17:02:00' },
];

export const FAQS = [
  { id: 'f1', question: 'How are Grouping Game groups formed?', answer: 'The system places you randomly with other users in the same game who chose the same wager amount and group size.' },
  { id: 'f2', question: 'What is the minimum group size to proceed?', answer: 'Five bettors. Fewer than five is null and void.' },
];
