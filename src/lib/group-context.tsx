import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';

// ─────────────────────────────────────────────────────────────
// PIRATE PARLAYS — GROUPING GAME v2.0
// Per Final Client-Confirmed Override (July 13, 2026)
//
// CONFIRMED:
// - Pirate Parlays (system) creates games; users pick winners/losers
// - Users fill their OWN slip
// - Wagers: $5 | $10 | $20  (fixed options)
// - Group sizes: 10 | 25 | 50  (fixed options)
// - Random grouping by (game + wager + group size)
// - Minimum 5 bettors to proceed; <5 = null-and-void
// - No Company/AI filler slips
// - Null-and-void users get option to fill another slip
// - Estimated payout must be visible (no final formula confirmed)
//
// REMOVED (from prior spec):
// - Captain-created / Captain-controlled groups
// - Shared parlay slip across group members
// - Group activates only when full
// - Fixed Stake × Combined Odds as final payout rule
// ─────────────────────────────────────────────────────────────

export type WagerOption = 5 | 10 | 20;
export type GroupSizeOption = 10 | 25 | 50;
export const WAGER_OPTIONS: WagerOption[] = [5, 10, 20];
export const GROUP_SIZE_OPTIONS: GroupSizeOption[] = [10, 25, 50];

export type Pick = 'winner' | 'loser';

export interface ScheduleMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: string;
}

// A "System Game" is created by Pirate Parlays. Contains a schedule of matches.
export interface SystemGame {
  id: string;
  name: string;
  sport: string;
  entryCloses: string;
  status: 'open' | 'closed' | 'settled';
  schedule: ScheduleMatch[];
}

// A user's own slip (they pick winner/loser per match).
export interface UserSlip {
  id: string;
  gameId: string;
  userId: string;
  username: string;
  picks: Record<string, Pick>; // matchId -> winner|loser
  wager: WagerOption;
  groupSize: GroupSizeOption;
  submittedAt: string;
  groupInstanceId: string;
  refunded?: boolean; // for null-and-void cases (UI hint only; wallet rule unconfirmed)
}

export type GroupInstanceStatus =
  | 'forming'        // waiting for more bettors / entry window open
  | 'proceeding'     // has ≥5 bettors; will run
  | 'null_and_void'  // <5 bettors after cutoff
  | 'settled';       // scoring complete (unconfirmed — placeholder)

// A random-grouped instance: same game, same wager, same group size.
export interface GroupInstance {
  id: string;
  gameId: string;
  wager: WagerOption;
  groupSize: GroupSizeOption;
  memberIds: string[];         // user IDs in this instance
  memberNames: string[];       // parallel usernames
  status: GroupInstanceStatus;
  createdAt: string;
}

// ─── DEMO DATA ─────────────────────────────────────────────

const DEMO_GAMES: SystemGame[] = [
  {
    id: 'sg1',
    name: 'NFL Sunday Slate',
    sport: 'NFL',
    entryCloses: '2026-03-08T18:00:00',
    status: 'open',
    schedule: [
      { id: 'sm1', homeTeam: 'Tampa Bay Buccaneers', awayTeam: 'Kansas City Chiefs', league: 'NFL', startTime: 'Sun 1:00 PM' },
      { id: 'sm2', homeTeam: 'Dallas Cowboys', awayTeam: 'Philadelphia Eagles', league: 'NFL', startTime: 'Sun 4:25 PM' },
      { id: 'sm3', homeTeam: 'Buffalo Bills', awayTeam: 'Miami Dolphins', league: 'NFL', startTime: 'Sun 4:25 PM' },
      { id: 'sm4', homeTeam: 'Green Bay Packers', awayTeam: 'Detroit Lions', league: 'NFL', startTime: 'Sun 8:20 PM' },
      { id: 'sm5', homeTeam: 'San Francisco 49ers', awayTeam: 'LA Rams', league: 'NFL', startTime: 'Mon 8:15 PM' },
    ],
  },
  {
    id: 'sg2',
    name: 'NBA Nightly Sweep',
    sport: 'NBA',
    entryCloses: '2026-03-05T22:00:00',
    status: 'open',
    schedule: [
      { id: 'sm6', homeTeam: 'Los Angeles Lakers', awayTeam: 'Boston Celtics', league: 'NBA', startTime: 'Wed 7:30 PM' },
      { id: 'sm7', homeTeam: 'Golden State Warriors', awayTeam: 'Denver Nuggets', league: 'NBA', startTime: 'Wed 10:00 PM' },
      { id: 'sm8', homeTeam: 'Milwaukee Bucks', awayTeam: 'Miami Heat', league: 'NBA', startTime: 'Wed 8:00 PM' },
      { id: 'sm9', homeTeam: 'Phoenix Suns', awayTeam: 'Dallas Mavericks', league: 'NBA', startTime: 'Wed 10:00 PM' },
    ],
  },
  {
    id: 'sg3',
    name: 'EPL Weekend Fixtures',
    sport: 'EPL',
    entryCloses: '2026-03-07T12:00:00',
    status: 'open',
    schedule: [
      { id: 'sm10', homeTeam: 'Manchester United', awayTeam: 'Liverpool', league: 'EPL', startTime: 'Sat 12:30 PM' },
      { id: 'sm11', homeTeam: 'Arsenal', awayTeam: 'Chelsea', league: 'EPL', startTime: 'Sat 3:00 PM' },
      { id: 'sm12', homeTeam: 'Manchester City', awayTeam: 'Tottenham', league: 'EPL', startTime: 'Sun 4:30 PM' },
    ],
  },
];

const DEMO_INSTANCES: GroupInstance[] = [
  {
    id: 'gi1', gameId: 'sg1', wager: 10, groupSize: 10,
    memberIds: ['u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11'],
    memberNames: ['JackSparrow22', 'BlackBeard', 'ParlayKing', 'OddsShark', 'BetMaster99', 'TreasureHunter', 'DeadMansHand', 'SeaDog77', 'CannonBall', 'RumRunner'],
    status: 'proceeding', createdAt: '2026-03-04T08:00:00',
  },
  {
    id: 'gi2', gameId: 'sg1', wager: 20, groupSize: 10,
    memberIds: ['u2', 'u4', 'u5', 'u6', 'u7', 'u8'],
    memberNames: ['JackSparrow22', 'ParlayKing', 'OddsShark', 'BetMaster99', 'TreasureHunter', 'DeadMansHand'],
    status: 'proceeding', createdAt: '2026-03-04T09:15:00',
  },
  {
    id: 'gi3', gameId: 'sg1', wager: 5, groupSize: 10,
    memberIds: ['u3', 'u9', 'u10'],
    memberNames: ['BlackBeard', 'SeaDog77', 'CannonBall'],
    status: 'null_and_void', createdAt: '2026-03-03T14:00:00',
  },
  {
    id: 'gi4', gameId: 'sg2', wager: 20, groupSize: 25,
    memberIds: Array.from({ length: 25 }, (_, i) => `demo-u${i + 20}`),
    memberNames: Array.from({ length: 25 }, (_, i) => `Bettor${i + 1}`),
    status: 'proceeding', createdAt: '2026-03-04T10:00:00',
  },
  {
    id: 'gi5', gameId: 'sg2', wager: 10, groupSize: 50,
    memberIds: Array.from({ length: 34 }, (_, i) => `demo-u${i + 100}`),
    memberNames: Array.from({ length: 34 }, (_, i) => `Bettor${i + 40}`),
    status: 'forming', createdAt: '2026-03-05T06:00:00',
  },
];

// ─── CONTEXT ───────────────────────────────────────────────

interface GroupContextType {
  games: SystemGame[];
  instances: GroupInstance[];
  mySlips: UserSlip[];
  submitSlip: (input: {
    gameId: string;
    picks: Record<string, Pick>;
    wager: WagerOption;
    groupSize: GroupSizeOption;
  }) => { ok: boolean; slipId?: string; instanceId?: string; error?: string };
  getInstance: (id: string) => GroupInstance | undefined;
  getGame: (id: string) => SystemGame | undefined;
  getSlipsForInstance: (instanceId: string) => UserSlip[];
  simulateProceed: (instanceId: string) => void;
  simulateNullAndVoid: (instanceId: string) => void;
  estimatedPayoutRange: (wager: WagerOption, groupSize: GroupSizeOption, currentMembers: number) => { low: number; high: number };
}

const GroupContext = createContext<GroupContextType | null>(null);

export const useGroups = () => {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error('useGroups must be used within GroupProvider');
  return ctx;
};

export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const { user, updateBalance } = useAuth();
  const [games] = useState<SystemGame[]>(DEMO_GAMES);
  const [instances, setInstances] = useState<GroupInstance[]>(DEMO_INSTANCES);
  const [mySlips, setMySlips] = useState<UserSlip[]>([]);

  // Estimated payout is a DEMO placeholder — actual formula is UNCONFIRMED per spec §8.
  // We show a range based on the pool size to satisfy VC-07 without inventing a rule.
  const estimatedPayoutRange = (wager: WagerOption, groupSize: GroupSizeOption, currentMembers: number) => {
    const projected = Math.max(currentMembers, 5);
    const pool = wager * projected;
    // Demo-only illustrative range (final formula pending client confirmation)
    return { low: +(pool * 0.5).toFixed(2), high: +(pool * 0.9).toFixed(2) };
  };

  const submitSlip: GroupContextType['submitSlip'] = ({ gameId, picks, wager, groupSize }) => {
    if (!user) return { ok: false, error: 'Not signed in' };
    if (user.balance < wager) return { ok: false, error: 'Insufficient balance' };

    // Random grouping: find an OPEN instance matching game+wager+groupSize with room.
    let target = instances.find(
      i =>
        i.gameId === gameId &&
        i.wager === wager &&
        i.groupSize === groupSize &&
        (i.status === 'forming' || i.status === 'proceeding') &&
        i.memberIds.length < i.groupSize &&
        !i.memberIds.includes(user.id),
    );

    const now = new Date().toISOString();
    let instanceId: string;

    if (!target) {
      // No matching instance — Pirate Parlays opens a new random-grouped instance.
      instanceId = `gi-${Date.now()}`;
      const newInstance: GroupInstance = {
        id: instanceId,
        gameId,
        wager,
        groupSize,
        memberIds: [user.id],
        memberNames: [user.username],
        status: 'forming',
        createdAt: now,
      };
      setInstances(prev => [newInstance, ...prev]);
    } else {
      instanceId = target.id;
      setInstances(prev =>
        prev.map(i => {
          if (i.id !== instanceId) return i;
          const memberIds = [...i.memberIds, user.id];
          const memberNames = [...i.memberNames, user.username];
          const nextStatus: GroupInstanceStatus = memberIds.length >= 5 ? 'proceeding' : 'forming';
          return { ...i, memberIds, memberNames, status: nextStatus };
        }),
      );
    }

    // Deduct wager
    updateBalance(-wager);

    const slipId = `slip-${Date.now()}`;
    const slip: UserSlip = {
      id: slipId,
      gameId,
      userId: user.id,
      username: user.username,
      picks,
      wager,
      groupSize,
      submittedAt: now,
      groupInstanceId: instanceId,
    };
    setMySlips(prev => [slip, ...prev]);

    return { ok: true, slipId, instanceId };
  };

  const getInstance = (id: string) => instances.find(i => i.id === id);
  const getGame = (id: string) => games.find(g => g.id === id);
  const getSlipsForInstance = (instanceId: string) => mySlips.filter(s => s.groupInstanceId === instanceId);

  // DEMO controls — let clients see both outcomes visually
  const simulateProceed = (instanceId: string) => {
    setInstances(prev =>
      prev.map(i => {
        if (i.id !== instanceId) return i;
        // Add filler demo names (labeled clearly as demo) to reach at least 5
        const needed = Math.max(0, 5 - i.memberIds.length);
        const memberIds = [...i.memberIds, ...Array.from({ length: needed }, (_, k) => `demo-fill-${k}`)];
        const memberNames = [...i.memberNames, ...Array.from({ length: needed }, (_, k) => `Bettor${100 + k}`)];
        return { ...i, memberIds, memberNames, status: 'proceeding' };
      }),
    );
  };

  const simulateNullAndVoid = (instanceId: string) => {
    setInstances(prev => prev.map(i => (i.id === instanceId ? { ...i, status: 'null_and_void' } : i)));
    // NOTE: Wallet refund on null-and-void is UNCONFIRMED per spec §8. No auto-refund applied.
  };

  const value = useMemo<GroupContextType>(
    () => ({
      games,
      instances,
      mySlips,
      submitSlip,
      getInstance,
      getGame,
      getSlipsForInstance,
      simulateProceed,
      simulateNullAndVoid,
      estimatedPayoutRange,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [games, instances, mySlips, user],
  );

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};
