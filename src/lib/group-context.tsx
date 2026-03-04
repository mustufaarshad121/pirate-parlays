import { createContext, useContext, useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { MATCHES, type Match } from '@/lib/data';
import { MOCK_GROUPS, MOCK_GROUP_MESSAGES, type ChatMessage, type PirateRank } from '@/lib/mock-social';

// ─── TYPES ─────────────────────────────────────────────

export type GroupStatus = 'Open' | 'Locked' | 'Active' | 'Completed';

export interface ParlaySelection {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  marketType: string;
  outcome: string;
  odds: number;
}

export interface GroupGame {
  id: string;
  name: string;
  sport: string;
  captainId: string;
  captainName: string;
  entryAmount: number;
  maxUsers: number;
  currentUsers: number;
  status: GroupStatus;
  createdDate: string;
  joinCriteria: string;
  parlaySlip: ParlaySelection[];
  combinedOdds: number;
  members: { id: string; username: string; rank: PirateRank }[];
}

export interface GroupBetRecord {
  betId: string;
  userId: string;
  username: string;
  groupId: string;
  stake: number;
  parlaySelections: ParlaySelection[];
  potentialPayout: number;
  status: 'pending' | 'won' | 'lost';
}

// ─── DEMO DATA ─────────────────────────────────────────

const DEMO_GROUPS: GroupGame[] = [
  {
    id: 'gg1',
    name: "Sparrow's Sunday Smash",
    sport: 'NFL',
    captainId: 'u2',
    captainName: 'JackSparrow22',
    entryAmount: 25,
    maxUsers: 5,
    currentUsers: 3,
    status: 'Open',
    createdDate: '2026-03-03T10:00:00',
    joinCriteria: 'Min 50 bets placed. Win rate above 55%.',
    parlaySlip: [
      { matchId: 'm1', homeTeam: 'Tampa Bay Buccaneers', awayTeam: 'Kansas City Chiefs', marketType: 'Moneyline', outcome: 'Chiefs', odds: 1.75 },
      { matchId: 'm2', homeTeam: 'Los Angeles Lakers', awayTeam: 'Boston Celtics', marketType: 'Moneyline', outcome: 'Lakers', odds: 1.65 },
      { matchId: 'm3', homeTeam: 'New York Yankees', awayTeam: 'Houston Astros', marketType: 'Over/Under', outcome: 'Over 8.5', odds: 1.85 },
    ],
    combinedOdds: 5.35,
    members: [
      { id: 'u2', username: 'JackSparrow22', rank: 'Captain' },
      { id: 'u4', username: 'ParlayKing', rank: 'First mate' },
      { id: 'u5', username: 'OddsShark', rank: 'Deck hand' },
    ],
  },
  {
    id: 'gg2',
    name: 'High Rollers 3-Leg',
    sport: 'NBA',
    captainId: 'u5',
    captainName: 'OddsShark',
    entryAmount: 50,
    maxUsers: 4,
    currentUsers: 4,
    status: 'Active',
    createdDate: '2026-03-02T18:00:00',
    joinCriteria: 'Minimum balance $500.',
    parlaySlip: [
      { matchId: 'm2', homeTeam: 'Los Angeles Lakers', awayTeam: 'Boston Celtics', marketType: 'Spread', outcome: 'Lakers -4.5', odds: 1.90 },
      { matchId: 'm1', homeTeam: 'Tampa Bay Buccaneers', awayTeam: 'Kansas City Chiefs', marketType: 'Over/Under', outcome: 'Over 48.5', odds: 1.90 },
    ],
    combinedOdds: 3.61,
    members: [
      { id: 'u5', username: 'OddsShark', rank: 'Captain' },
      { id: 'u2', username: 'JackSparrow22', rank: 'First mate' },
      { id: 'u4', username: 'ParlayKing', rank: 'First mate' },
      { id: 'u6', username: 'BetMaster99', rank: 'Cook' },
    ],
  },
  {
    id: 'gg3',
    name: 'EPL Parlay Party',
    sport: 'EPL',
    captainId: 'u4',
    captainName: 'ParlayKing',
    entryAmount: 10,
    maxUsers: 10,
    currentUsers: 10,
    status: 'Completed',
    createdDate: '2026-02-28T12:00:00',
    joinCriteria: 'Open to all!',
    parlaySlip: [
      { matchId: 'm4', homeTeam: 'Manchester United', awayTeam: 'Liverpool', marketType: 'Moneyline', outcome: 'Liverpool', odds: 2.10 },
      { matchId: 'm4', homeTeam: 'Manchester United', awayTeam: 'Liverpool', marketType: 'Over/Under', outcome: 'Over 2.5', odds: 1.80 },
    ],
    combinedOdds: 3.78,
    members: [
      { id: 'u4', username: 'ParlayKing', rank: 'Captain' },
      { id: 'u2', username: 'JackSparrow22', rank: 'First mate' },
      { id: 'u1', username: 'user1', rank: 'Pilot' },
      { id: 'u5', username: 'OddsShark', rank: 'Deck hand' },
      { id: 'u6', username: 'BetMaster99', rank: 'Cook' },
      { id: 'u7', username: 'TreasureHunter', rank: 'Pilot' },
      { id: 'u8', username: 'DeadMansHand', rank: 'Deck hand' },
      { id: 'u9', username: 'SeaDog77', rank: 'Cook' },
      { id: 'u10', username: 'CannonBall', rank: 'Pilot' },
      { id: 'u11', username: 'RumRunner', rank: 'Crew member' },
    ],
  },
  {
    id: 'gg4',
    name: 'UFC Night Crew',
    sport: 'NFL',
    captainId: 'u2',
    captainName: 'JackSparrow22',
    entryAmount: 15,
    maxUsers: 8,
    currentUsers: 2,
    status: 'Open',
    createdDate: '2026-03-04T09:00:00',
    joinCriteria: '',
    parlaySlip: [
      { matchId: 'm5', homeTeam: 'Connor McGregor', awayTeam: 'Dustin Poirier', marketType: 'Moneyline', outcome: 'McGregor', odds: 2.40 },
      { matchId: 'm6', homeTeam: 'Toronto Maple Leafs', awayTeam: 'Montreal Canadiens', marketType: 'Moneyline', outcome: 'Maple Leafs', odds: 1.45 },
    ],
    combinedOdds: 3.48,
    members: [
      { id: 'u2', username: 'JackSparrow22', rank: 'Captain' },
      { id: 'u4', username: 'ParlayKing', rank: 'First mate' },
    ],
  },
];

const DEMO_GROUP_BETS: GroupBetRecord[] = [
  // Bets for completed group gg3 (all won)
  { betId: 'gb1', userId: 'u4', username: 'ParlayKing', groupId: 'gg3', stake: 10, parlaySelections: DEMO_GROUPS[2].parlaySlip, potentialPayout: 37.80, status: 'won' },
  { betId: 'gb2', userId: 'u2', username: 'JackSparrow22', groupId: 'gg3', stake: 10, parlaySelections: DEMO_GROUPS[2].parlaySlip, potentialPayout: 37.80, status: 'won' },
  { betId: 'gb3', userId: 'u1', username: 'user1', groupId: 'gg3', stake: 10, parlaySelections: DEMO_GROUPS[2].parlaySlip, potentialPayout: 37.80, status: 'won' },
  // Bets for active group gg2
  { betId: 'gb4', userId: 'u5', username: 'OddsShark', groupId: 'gg2', stake: 50, parlaySelections: DEMO_GROUPS[1].parlaySlip, potentialPayout: 180.50, status: 'pending' },
  { betId: 'gb5', userId: 'u2', username: 'JackSparrow22', groupId: 'gg2', stake: 50, parlaySelections: DEMO_GROUPS[1].parlaySlip, potentialPayout: 180.50, status: 'pending' },
];

const DEMO_CHAT: Record<string, ChatMessage[]> = {
  gg1: [
    { id: 'gc1', senderId: 'u2', senderName: 'JackSparrow22', text: 'Welcome to Sunday Smash! 🏴‍☠️ Chiefs + Lakers + Over is the play!', timestamp: '2026-03-03T10:05:00' },
    { id: 'gc2', senderId: 'u4', senderName: 'ParlayKing', text: 'Love it Cap! This parlay is fire 🔥', timestamp: '2026-03-03T10:10:00' },
    { id: 'gc3', senderId: 'u5', senderName: 'OddsShark', text: 'Chiefs ML is solid. +5.35 combined? Let\'s go!', timestamp: '2026-03-03T10:15:00' },
    { id: 'gc4', senderId: 'u2', senderName: 'JackSparrow22', text: 'Need 2 more crew members to fill up and lock this in! Spread the word!', timestamp: '2026-03-03T11:00:00' },
  ],
  gg2: [
    { id: 'gc5', senderId: 'u5', senderName: 'OddsShark', text: 'Group is locked! All bets are live 🎯', timestamp: '2026-03-02T20:00:00' },
    { id: 'gc6', senderId: 'u2', senderName: 'JackSparrow22', text: 'Lakers looking good early! Let\'s ride!', timestamp: '2026-03-02T20:30:00' },
  ],
  gg3: [
    { id: 'gc7', senderId: 'u4', senderName: 'ParlayKing', text: '🎉🎉🎉 WE HIT! Liverpool + Over 2.5 CASH! +3.78 parlay!', timestamp: '2026-02-28T22:00:00' },
    { id: 'gc8', senderId: 'u1', senderName: 'user1', text: 'LETS GOOOO! $37.80 payout each! 🏴‍☠️💰', timestamp: '2026-02-28T22:02:00' },
    { id: 'gc9', senderId: 'u2', senderName: 'JackSparrow22', text: 'Great pick Cap! Tailing your next group for sure!', timestamp: '2026-02-28T22:05:00' },
  ],
  gg4: [
    { id: 'gc10', senderId: 'u2', senderName: 'JackSparrow22', text: 'McGregor + Leafs parlay. Easy money! Who\'s in?', timestamp: '2026-03-04T09:05:00' },
  ],
};

// ─── CONTEXT ───────────────────────────────────────────

interface GroupContextType {
  groups: GroupGame[];
  groupBets: GroupBetRecord[];
  groupChats: Record<string, ChatMessage[]>;
  joinGroup: (groupId: string) => boolean;
  createGroup: (group: Omit<GroupGame, 'id' | 'status' | 'currentUsers' | 'combinedOdds' | 'createdDate' | 'members'>) => string;
  sendGroupMessage: (groupId: string, text: string) => void;
  settleGroup: (groupId: string, result: 'won' | 'lost') => void;
  getUserGroups: (userId: string) => GroupGame[];
  getGroupBets: (groupId: string) => GroupBetRecord[];
}

const GroupContext = createContext<GroupContextType | null>(null);

export const useGroups = () => {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error('useGroups must be used within GroupProvider');
  return ctx;
};

export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const { user, updateBalance } = useAuth();
  const [groups, setGroups] = useState<GroupGame[]>(DEMO_GROUPS);
  const [groupBets, setGroupBets] = useState<GroupBetRecord[]>(DEMO_GROUP_BETS);
  const [groupChats, setGroupChats] = useState<Record<string, ChatMessage[]>>(DEMO_CHAT);

  const calculateCombinedOdds = (selections: ParlaySelection[]) =>
    parseFloat(selections.reduce((acc, s) => acc * s.odds, 1).toFixed(2));

  const joinGroup = (groupId: string): boolean => {
    if (!user) return false;
    const group = groups.find(g => g.id === groupId);
    if (!group || group.status !== 'Open') return false;
    if (group.currentUsers >= group.maxUsers) return false;
    if (user.balance < group.entryAmount) return false;
    if (group.members.some(m => m.id === user.id)) return false;

    // Deduct entry
    updateBalance(-group.entryAmount);

    const newCurrentUsers = group.currentUsers + 1;
    const isFull = newCurrentUsers >= group.maxUsers;

    setGroups(prev => prev.map(g => g.id === groupId ? {
      ...g,
      currentUsers: newCurrentUsers,
      status: isFull ? 'Active' as GroupStatus : 'Open' as GroupStatus,
      members: [...g.members, { id: user.id, username: user.username, rank: 'Crew member' as PirateRank }],
    } : g));

    // Create bet record for user
    const betRecord: GroupBetRecord = {
      betId: `gb-${Date.now()}`,
      userId: user.id,
      username: user.username,
      groupId,
      stake: group.entryAmount,
      parlaySelections: group.parlaySlip,
      potentialPayout: parseFloat((group.entryAmount * group.combinedOdds).toFixed(2)),
      status: 'pending',
    };
    setGroupBets(prev => [...prev, betRecord]);

    // If group is now full, create bet records for existing members who don't have one
    if (isFull) {
      const existingBetUserIds = groupBets.filter(b => b.groupId === groupId).map(b => b.userId);
      const missingMembers = group.members.filter(m => !existingBetUserIds.includes(m.id) && m.id !== user.id);
      const newBets: GroupBetRecord[] = missingMembers.map(m => ({
        betId: `gb-${Date.now()}-${m.id}`,
        userId: m.id,
        username: m.username,
        groupId,
        stake: group.entryAmount,
        parlaySelections: group.parlaySlip,
        potentialPayout: parseFloat((group.entryAmount * group.combinedOdds).toFixed(2)),
        status: 'pending' as const,
      }));
      setGroupBets(prev => [...prev, ...newBets]);
    }

    return true;
  };

  const createGroup = (input: Omit<GroupGame, 'id' | 'status' | 'currentUsers' | 'combinedOdds' | 'createdDate' | 'members'>): string => {
    if (!user) return '';
    const id = `gg-${Date.now()}`;
    const combinedOdds = calculateCombinedOdds(input.parlaySlip);
    const newGroup: GroupGame = {
      ...input,
      id,
      status: 'Open',
      currentUsers: 1,
      combinedOdds,
      createdDate: new Date().toISOString(),
      members: [{ id: user.id, username: user.username, rank: 'Captain' as PirateRank }],
    };
    setGroups(prev => [newGroup, ...prev]);
    setGroupChats(prev => ({ ...prev, [id]: [] }));
    return id;
  };

  const sendGroupMessage = (groupId: string, text: string) => {
    if (!user) return;
    const msg: ChatMessage = {
      id: `gc-${Date.now()}`,
      senderId: user.id,
      senderName: user.username,
      text,
      timestamp: new Date().toISOString(),
    };
    setGroupChats(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), msg],
    }));
  };

  const settleGroup = (groupId: string, result: 'won' | 'lost') => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, status: 'Completed' as GroupStatus } : g));
    setGroupBets(prev => prev.map(b => {
      if (b.groupId !== groupId) return b;
      const newBet = { ...b, status: result };
      if (result === 'won' && b.userId === user?.id) {
        updateBalance(b.potentialPayout);
      }
      return newBet;
    }));
  };

  const getUserGroups = (userId: string) => groups.filter(g => g.members.some(m => m.id === userId));
  const getGroupBets = (groupId: string) => groupBets.filter(b => b.groupId === groupId);

  return (
    <GroupContext.Provider value={{ groups, groupBets, groupChats, joinGroup, createGroup, sendGroupMessage, settleGroup, getUserGroups, getGroupBets }}>
      {children}
    </GroupContext.Provider>
  );
};
