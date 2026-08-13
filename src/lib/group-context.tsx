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

// Confirmed sport scope for the Grouping Game: NFL, NBA, EPL only.
export const GAME_SPORTS = ['NFL', 'NBA', 'EPL'] as const;
export type GameSport = (typeof GAME_SPORTS)[number];

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

// NOTE: These game names and schedules are DEMO RECORDS ONLY.
// The client has not provided or approved any specific game names.
// Real game names / schedules will be supplied by Pirate Parlays operations.
const DEMO_GAMES: SystemGame[] = [
  {
    id: 'sg1',
    name: 'Demo Game A',
    sport: 'Demo',
    entryCloses: '2026-03-08T18:00:00',
    status: 'open',
    schedule: [
      { id: 'sm1', homeTeam: 'Demo Home 1', awayTeam: 'Demo Away 1', league: 'Demo', startTime: 'Sun 1:00 PM' },
      { id: 'sm2', homeTeam: 'Demo Home 2', awayTeam: 'Demo Away 2', league: 'Demo', startTime: 'Sun 4:25 PM' },
      { id: 'sm3', homeTeam: 'Demo Home 3', awayTeam: 'Demo Away 3', league: 'Demo', startTime: 'Sun 4:25 PM' },
      { id: 'sm4', homeTeam: 'Demo Home 4', awayTeam: 'Demo Away 4', league: 'Demo', startTime: 'Sun 8:20 PM' },
      { id: 'sm5', homeTeam: 'Demo Home 5', awayTeam: 'Demo Away 5', league: 'Demo', startTime: 'Mon 8:15 PM' },
    ],
  },
  {
    id: 'sg2',
    name: 'Demo Game B',
    sport: 'Demo',
    entryCloses: '2026-03-05T22:00:00',
    status: 'open',
    schedule: [
      { id: 'sm6', homeTeam: 'Demo Home 6', awayTeam: 'Demo Away 6', league: 'Demo', startTime: 'Wed 7:30 PM' },
      { id: 'sm7', homeTeam: 'Demo Home 7', awayTeam: 'Demo Away 7', league: 'Demo', startTime: 'Wed 10:00 PM' },
      { id: 'sm8', homeTeam: 'Demo Home 8', awayTeam: 'Demo Away 8', league: 'Demo', startTime: 'Wed 8:00 PM' },
      { id: 'sm9', homeTeam: 'Demo Home 9', awayTeam: 'Demo Away 9', league: 'Demo', startTime: 'Wed 10:00 PM' },
    ],
  },
  {
    id: 'sg3',
    name: 'Demo Game C',
    sport: 'Demo',
    entryCloses: '2026-03-07T12:00:00',
    status: 'open',
    schedule: [
      { id: 'sm10', homeTeam: 'Demo Home 10', awayTeam: 'Demo Away 10', league: 'Demo', startTime: 'Sat 12:30 PM' },
      { id: 'sm11', homeTeam: 'Demo Home 11', awayTeam: 'Demo Away 11', league: 'Demo', startTime: 'Sat 3:00 PM' },
      { id: 'sm12', homeTeam: 'Demo Home 12', awayTeam: 'Demo Away 12', league: 'Demo', startTime: 'Sun 4:30 PM' },
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

// Dev-only flag — flip to true ONLY in a private development/demo environment
// to expose the "Simulate → Proceeds / Null & Void" walkthrough controls.
// These are NOT confirmed production Admin controls. In real flow, the system
// enforces the minimum-participant rule automatically at entry cutoff.
export const DEV_DEMO_CONTROLS_ENABLED = false;

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
  // Admin (Pirate Parlays operations) — system game creation & lifecycle.
  createGame: (input: {
    name: string;
    sport: string;
    entryCloses: string;
    schedule: Omit<ScheduleMatch, 'id'>[];
  }) => { ok: boolean; gameId?: string; error?: string };
  closeGameEntries: (gameId: string) => void;
}

const GroupContext = createContext<GroupContextType | null>(null);

export const useGroups = () => {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error('useGroups must be used within GroupProvider');
  return ctx;
};

export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const { user, updateBalance } = useAuth();
  const [games, setGames] = useState<SystemGame[]>(DEMO_GAMES);
  const [instances, setInstances] = useState<GroupInstance[]>(DEMO_INSTANCES);
  const [mySlips, setMySlips] = useState<UserSlip[]>([]);
  // NOTE: No numerical estimated-payout calculation is exposed. The client has
  // not confirmed the payout formula, platform fee, winner allocation, or tie
  // handling. UI shows a non-numerical placeholder instead.

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

  const createGame: GroupContextType['createGame'] = ({ name, sport, entryCloses, schedule }) => {
    if (!name.trim()) return { ok: false, error: 'Game name is required' };
    if (schedule.length === 0) return { ok: false, error: 'Add at least one match' };
    const gameId = `sg-${Date.now()}`;
    setGames(prev => [
      {
        id: gameId,
        name: name.trim(),
        sport,
        entryCloses,
        status: 'open',
        schedule: schedule.map((m, idx) => ({ ...m, id: `${gameId}-m${idx + 1}` })),
      },
      ...prev,
    ]);
    return { ok: true, gameId };
  };

  // Entry cutoff: the system applies the minimum-participant rule automatically.
  // 5+ bettors proceed; fewer than 5 is null-and-void.
  const closeGameEntries = (gameId: string) => {
    setGames(prev => prev.map(g => (g.id === gameId ? { ...g, status: 'closed' } : g)));
    setInstances(prev =>
      prev.map(i => {
        if (i.gameId !== gameId) return i;
        if (i.status === 'settled') return i;
        return { ...i, status: i.memberIds.length >= 5 ? 'proceeding' : 'null_and_void' };
      }),
    );
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
      createGame,
      closeGameEntries,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [games, instances, mySlips, user],
  );

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};
