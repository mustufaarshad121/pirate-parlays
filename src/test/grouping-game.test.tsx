import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';

// Controllable auth stub so several bettors can be simulated.
const authState = {
  user: { id: 'u1', username: 'bettor1', role: 'user' as const, balance: 1000, email: 'a@b.c' },
  updateBalance: vi.fn(),
};
vi.mock('@/lib/auth', () => ({ useAuth: () => authState }));

import { GroupProvider, useGroups } from '@/lib/group-context';

const wrapper = ({ children }: { children: ReactNode }) => <GroupProvider>{children}</GroupProvider>;

const setUser = (id: string, h?: { rerender: () => void }) => {
  authState.user = { ...authState.user, id, username: id };
  h?.rerender();
};

const mount = () => renderHook(() => useGroups(), { wrapper });

describe('Grouping Game', () => {
  beforeEach(() => {
    localStorage.clear();
    setUser('u1', h);
  });

  const seedGame = (h: ReturnType<typeof mount>) => {
    let gameId = '';
    act(() => {
      const r = h.result.current.createGame({
        name: 'Week 1 Slate',
        sport: 'NFL',
        entryCloses: '2026-09-10T18:00:00',
        schedule: [
          { homeTeam: 'A', awayTeam: 'B', league: 'NFL', startTime: 'Sun 1:00 PM' },
          { homeTeam: 'C', awayTeam: 'D', league: 'NFL', startTime: 'Sun 4:00 PM' },
        ],
      });
      gameId = r.gameId!;
    });
    return gameId;
  };

  const enter = (h: ReturnType<typeof mount>, gameId: string, wager: 5 | 10 | 20, size: 10 | 25 | 50) => {
    const game = h.result.current.getGame(gameId)!;
    const picks = Object.fromEntries(game.schedule.map(m => [m.id, 'winner' as const]));
    let instanceId = '';
    act(() => {
      const r = h.result.current.submitSlip({ gameId, picks, wager, groupSize: size });
      expect(r.ok).toBe(true);
      instanceId = r.instanceId!;
    });
    return instanceId;
  };

  it('A — starts empty and creates an individual entry with no shared/captain slip', () => {
    const h = mount();
    expect(h.result.current.games).toHaveLength(0);
    expect(h.result.current.instances).toHaveLength(0);

    const gameId = seedGame(h);
    const instanceId = enter(h, gameId, 10, 10);

    const inst = h.result.current.getInstance(instanceId)!;
    expect(inst.memberIds).toEqual(['u1']);
    expect(inst.groupSize).toBe(10);
    expect(inst.wager).toBe(10);
    expect(h.result.current.getSlipForInstance(instanceId, 'u1')).toBeDefined();
    expect(Object.keys(inst)).not.toContain('captainId');
  });

  it('B — same game/wager/size bettors land in a compatible group without choosing it', () => {
    const h = mount();
    const gameId = seedGame(h);
    const ids: string[] = [];
    ['u1', 'u2', 'u3'].forEach(u => {
      setUser(u, h);
      ids.push(enter(h, gameId, 10, 10));
    });
    expect(new Set(ids).size).toBe(1);
    expect(h.result.current.getInstance(ids[0])!.memberIds).toEqual(['u1', 'u2', 'u3']);
  });

  it('C/D — different wager or capacity are separate grouping buckets', () => {
    const h = mount();
    const gameId = seedGame(h);
    setUser('u1', h);
    const a = enter(h, gameId, 5, 10);
    setUser('u2', h);
    const b = enter(h, gameId, 20, 10);
    setUser('u3', h);
    const c = enter(h, gameId, 5, 25);
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });

  it('E/H — five actual bettors proceed and no filler entries are created', () => {
    const h = mount();
    const gameId = seedGame(h);
    let instanceId = '';
    ['u1', 'u2', 'u3', 'u4', 'u5'].forEach(u => {
      setUser(u, h);
      instanceId = enter(h, gameId, 10, 10);
    });
    act(() => h.result.current.closeGameEntries(gameId));
    const inst = h.result.current.getInstance(instanceId)!;
    expect(inst.memberIds).toHaveLength(5);
    expect(inst.status).toBe('proceeding');
    expect(inst.memberIds.every(id => ['u1', 'u2', 'u3', 'u4', 'u5'].includes(id))).toBe(true);
  });

  it('F/G — four bettors become null and void with the wager untouched', () => {
    const h = mount();
    const gameId = seedGame(h);
    let instanceId = '';
    ['u1', 'u2', 'u3', 'u4'].forEach(u => {
      setUser(u, h);
      instanceId = enter(h, gameId, 10, 10);
    });
    authState.updateBalance.mockClear();
    act(() => h.result.current.closeGameEntries(gameId));
    expect(h.result.current.getInstance(instanceId)!.status).toBe('null_and_void');
    // no automatic refund / carry-over applied
    expect(authState.updateBalance).not.toHaveBeenCalled();
  });

  it('I — chat is tied to the group and rejects non-members', () => {
    const h = mount();
    const gameId = seedGame(h);
    setUser('u1', h);
    const instanceId = enter(h, gameId, 10, 10);
    act(() => {
      h.result.current.sendMessage(instanceId, 'ahoy');
    });
    expect(h.result.current.getMessages(instanceId).map(m => m.text)).toEqual(['ahoy']);
    setUser('outsider', h);
    let res: { ok: boolean; error?: string } = { ok: true };
    act(() => {
      res = h.result.current.sendMessage(instanceId, 'let me in');
    });
    expect(res.ok).toBe(false);
    expect(h.result.current.getMessages(instanceId)).toHaveLength(1);
  });
});
