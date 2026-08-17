import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';

// ─────────────────────────────────────────────────────────────
// PIRATE PARLAYS — GROUPING GAME
//
// CONFIRMED CLIENT RULES:
// - Pirate Parlays (system) creates games; users pick winner/loser
// - Every user fills out their OWN individual slip (no shared slip)
// - Wagers: $5 | $10 | $20  (fixed options)
// - Group capacities: 10 | 25 | 50  (selected capacity, not a minimum)
// - Random, system-controlled grouping by (game + wager + capacity)
// - Minimum 5 actual bettors to proceed; fewer than 5 = null and void
// - No AI / company / bot filler entries — participants are real entries only
// - Null-and-void members may fill out another slip
//
// NOT CONFIRMED (deliberately NOT implemented):
// - payout formula, platform fee, winner allocation, tie handling
// - scoring / settlement algorithm
// - refund / carry-over behaviour of a null-and-void wager
//
// REMOVED:
// - Captain-created / Captain-owned / Captain-controlled groups
// - Shared parlay slips
// - User-selected group joining
// ─────────────────────────────────────────────────────────────

export type WagerOption = 5 | 10 | 20;
export type GroupSizeOption = 10 | 25 | 50;
export const WAGER_OPTIONS: WagerOption[] = [5, 10, 20];
export const GROUP_SIZE_OPTIONS: GroupSizeOption[] = [10, 25, 50];
export const MINIMUM_BETTORS = 5;

export type Pick = 'winner' | 'loser';

// Confirmed sport scope: NFL, NBA, EPL only.
export const GAME_SPORTS = ['NFL', 'NBA', 'EPL'] as const;
export type GameSport = (typeof GAME_SPORTS)[number];

export interface ScheduleMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: string;
}

// A game created by Pirate Parlays operations. Contains a schedule of matches.
export interface SystemGame {
  id: string;
  name: string;
  sport: string;
  entryCloses: string;
  status: 'open' | 'closed' | 'settled';
  schedule: ScheduleMatch[];
}

// A user's own individual slip (winner/loser per scheduled match).
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
}

export type GroupInstanceStatus =
  | 'forming'        // entry window open, waiting for participants
  | 'proceeding'     // entries closed with 5+ actual bettors
  | 'null_and_void'  // entries closed with fewer than 5 actual bettors
  | 'settled';       // settlement rules pending client confirmation

// A randomly formed group: same game, same wager, same selected capacity.
export interface GroupInstance {
  id: string;
  gameId: string;
  wager: WagerOption;
  groupSize: GroupSizeOption;
  memberIds: string[];
  memberNames: string[];
  status: GroupInstanceStatus;
  createdAt: string;
}

export interface GroupChatMessage {
  id: string;
  instanceId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

// ─── PERSISTENCE (local, no fabricated records) ────────────
const STORAGE_KEY = 'pp_grouping_state_v3';

interface PersistedState {
  games: SystemGame[];
  instances: GroupInstance[];
  slips: UserSlip[];
  messages: GroupChatMessage[];
}

const emptyState: PersistedState = { games: [], instances: [], slips: [], messages: [] };

const loadState = (): PersistedState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      games: parsed.games ?? [],
      instances: parsed.instances ?? [],
      slips: parsed.slips ?? [],
      messages: parsed.messages ?? [],
    };
  } catch {
    return emptyState;
  }
};

// ─── CONTEXT ───────────────────────────────────────────────

interface GroupContextType {
  games: SystemGame[];
  openGames: SystemGame[];
  instances: GroupInstance[];
  slips: UserSlip[];
  mySlips: UserSlip[];
  myInstances: GroupInstance[];
  submitSlip: (input: {
    gameId: string;
    picks: Record<string, Pick>;
    wager: WagerOption;
    groupSize: GroupSizeOption;
  }) => { ok: boolean; slipId?: string; instanceId?: string; error?: string };
  getInstance: (id: string) => GroupInstance | undefined;
  getGame: (id: string) => SystemGame | undefined;
  getSlipForInstance: (instanceId: string, userId: string) => UserSlip | undefined;
  getMessages: (instanceId: string) => GroupChatMessage[];
  sendMessage: (instanceId: string, text: string) => { ok: boolean; error?: string };
  // Pirate Parlays operations (admin) — game creation & entry lifecycle only.
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
  const [state, setState] = useState<PersistedState>(() => loadState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — in-memory only */
    }
  }, [state]);

  const { games, instances, slips, messages } = state;

  // ── RANDOM GROUPING ──────────────────────────────────────
  // Placement is system-controlled. The user never sees or selects a group.
  // Eligible groups share the same game + wager + selected capacity, are still
  // forming, have room, and do not already contain the user. One is chosen at
  // random; if none exists the system opens a new group.
  const submitSlip: GroupContextType['submitSlip'] = ({ gameId, picks, wager, groupSize }) => {
    if (!user) return { ok: false, error: 'Not signed in' };
    const game = games.find(g => g.id === gameId);
    if (!game) return { ok: false, error: 'Game not found' };
    if (game.status !== 'open') return { ok: false, error: 'Entries are closed for this game' };
    if (game.schedule.some(m => !picks[m.id])) return { ok: false, error: 'Make a selection for every scheduled match' };
    if (user.balance < wager) return { ok: false, error: 'Insufficient balance' };

    const eligible = instances.filter(
      i =>
        i.gameId === gameId &&
        i.wager === wager &&
        i.groupSize === groupSize &&
        i.status === 'forming' &&
        i.memberIds.length < i.groupSize &&
        !i.memberIds.includes(user.id),
    );

    const now = new Date().toISOString();
    const target = eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : undefined;
    const instanceId = target ? target.id : `gi-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    const slip: UserSlip = {
      id: `slip-${Date.now()}`,
      gameId,
      userId: user.id,
      username: user.username,
      picks,
      wager,
      groupSize,
      submittedAt: now,
      groupInstanceId: instanceId,
    };

    setState(prev => {
      const nextInstances = target
        ? prev.instances.map(i =>
            i.id === instanceId
              ? { ...i, memberIds: [...i.memberIds, user.id], memberNames: [...i.memberNames, user.username] }
              : i,
          )
        : [
            {
              id: instanceId,
              gameId,
              wager,
              groupSize,
              memberIds: [user.id],
              memberNames: [user.username],
              status: 'forming' as GroupInstanceStatus,
              createdAt: now,
            },
            ...prev.instances,
          ];
      return { ...prev, instances: nextInstances, slips: [slip, ...prev.slips] };
    });

    updateBalance(-wager);
    return { ok: true, slipId: slip.id, instanceId };
  };

  const createGame: GroupContextType['createGame'] = ({ name, sport, entryCloses, schedule }) => {
    if (!name.trim()) return { ok: false, error: 'Game name is required' };
    if (schedule.length === 0) return { ok: false, error: 'Add at least one match' };
    const gameId = `sg-${Date.now()}`;
    setState(prev => ({
      ...prev,
      games: [
        {
          id: gameId,
          name: name.trim(),
          sport,
          entryCloses,
          status: 'open',
          schedule: schedule.map((m, idx) => ({ ...m, id: `${gameId}-m${idx + 1}` })),
        },
        ...prev.games,
      ],
    }));
    return { ok: true, gameId };
  };

  // ── MINIMUM-PARTICIPATION RULE ───────────────────────────
  // At the game's start boundary the system evaluates every group of that game:
  // 5 or more actual bettors → proceeding; fewer than 5 → null and void.
  // No filler entries are ever generated.
  const closeGameEntries = (gameId: string) => {
    setState(prev => ({
      ...prev,
      games: prev.games.map(g => (g.id === gameId ? { ...g, status: 'closed' } : g)),
      instances: prev.instances.map(i => {
        if (i.gameId !== gameId) return i;
        if (i.status === 'settled') return i;
        return { ...i, status: i.memberIds.length >= MINIMUM_BETTORS ? 'proceeding' : 'null_and_void' };
      }),
    }));
  };

  const getInstance = (id: string) => instances.find(i => i.id === id);
  const getGame = (id: string) => games.find(g => g.id === id);
  const getSlipForInstance = (instanceId: string, userId: string) =>
    slips.find(s => s.groupInstanceId === instanceId && s.userId === userId);
  const getMessages = (instanceId: string) =>
    messages
      .filter(m => m.instanceId === instanceId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  // Chat is tied to the randomly formed group. Only actual members can post.
  const sendMessage: GroupContextType['sendMessage'] = (instanceId, text) => {
    if (!user) return { ok: false, error: 'Not signed in' };
    const instance = instances.find(i => i.id === instanceId);
    if (!instance) return { ok: false, error: 'Group not found' };
    if (!instance.memberIds.includes(user.id)) return { ok: false, error: 'You are not in this group' };
    if (!text.trim()) return { ok: false, error: 'Empty message' };
    const msg: GroupChatMessage = {
      id: `gm-${Date.now()}`,
      instanceId,
      senderId: user.id,
      senderName: user.username,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, messages: [...prev.messages, msg] }));
    return { ok: true };
  };

  const openGames = games.filter(g => g.status === 'open');
  const mySlips = user ? slips.filter(s => s.userId === user.id) : [];
  const myInstances = user ? instances.filter(i => i.memberIds.includes(user.id)) : [];

  const value = useMemo<GroupContextType>(
    () => ({
      games,
      openGames,
      instances,
      slips,
      mySlips,
      myInstances,
      submitSlip,
      getInstance,
      getGame,
      getSlipForInstance,
      getMessages,
      sendMessage,
      createGame,
      closeGameEntries,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, user],
  );

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};
