import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ─────────────────────────────────────────────────────────────
// PIRATE PARLAYS — GROUPS
// Pirate Parlays creates the game. Every bettor makes their own slip,
// picks one wager and one group-size maximum, and the system places
// them randomly among bettors matching game + wager + group size.
//
// Business values (entry amounts, group sizes, minimum players) are
// stored in app_config and read at runtime — never hard-coded in UI.
// Scoring, payout, fees and tie handling are NOT defined: those rows
// are flagged `needs_client_confirmation` and rendered as pending.
// ─────────────────────────────────────────────────────────────

export type GroupStatus = 'open' | 'locked' | 'live' | 'completed' | 'void';
export type SlateStatus = 'open' | 'locked' | 'live' | 'completed' | 'cancelled';
export type Selection = 'home' | 'away';

export interface Slate {
  id: string;
  name: string;
  league: string;
  starts_at: string;
  lock_at: string;
  status: SlateStatus;
}

export interface SlateEvent {
  id: string;
  slate_id: string;
  home_team: string;
  away_team: string;
  starts_at: string | null;
  sort_order: number;
  result: 'home' | 'away' | 'void' | null;
}

export interface Group {
  id: string;
  code: string;
  name: string | null;
  slate_id: string;
  entry_amount: number;
  group_size: number;
  is_private: boolean;
  status: GroupStatus;
  created_by: string | null;
  locked_at: string | null;
  created_at: string;
}

export interface GroupMemberRow {
  user_id: string;
  joined_at: string;
  username: string;
  display_name: string | null;
  picksSubmitted: number;
}

export const STATUS_LABEL: Record<GroupStatus, string> = {
  open: 'Open',
  locked: 'Locked',
  live: 'Live',
  completed: 'Completed',
  void: 'Void',
};

const err = (e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  const map: Record<string, string> = {
    AUTH_REQUIRED: 'You need to be signed in to do that.',
    GROUP_NOT_FOUND: "That group doesn't exist.",
    GROUP_NOT_OPEN: 'This group is locked and can no longer be joined.',
    GROUP_FULL: 'This group is full.',
    GROUP_LOCKED: 'This group is locked — picks can no longer be changed.',
    NOT_A_MEMBER: 'You are not a member of this group.',
    SLATE_CLOSED: 'Entries for this slate are closed.',
    SLATE_NOT_FOUND: 'That slate is no longer available.',
    INVALID_ENTRY: 'That entry amount is not available.',
    INVALID_SIZE: 'That group size is not available.',
    INVALID_SELECTION: 'One of your selections is not valid.',
    INVALID_EVENT: 'One of your selections is not part of this slate.',
  };
  const key = Object.keys(map).find(k => msg.includes(k));
  return new Error(key ? map[key] : msg);
};

// ─── CONFIG ────────────────────────────────────────────────
export interface GroupsConfig {
  entryAmounts: number[];
  groupSizes: number[];
  minimumPlayers: number | null;
  minimumPlayersNeedsConfirmation: boolean;
  payoutRulesDefined: boolean;
  scoringRulesDefined: boolean;
  allowPickEdit: boolean;
}

export const useGroupsConfig = () =>
  useQuery({
    queryKey: ['groups-config'],
    queryFn: async (): Promise<GroupsConfig> => {
      const { data, error } = await supabase.from('app_config').select('*');
      if (error) throw err(error);
      const row = (k: string) => data?.find(d => d.key === k);
      const val = <T,>(k: string, fallback: T): T => (row(k)?.value ?? fallback) as T;
      return {
        entryAmounts: val<number[]>('entry_amounts', []),
        groupSizes: val<number[]>('group_sizes', []),
        minimumPlayers: val<number | null>('minimum_players', null),
        minimumPlayersNeedsConfirmation: !!row('minimum_players')?.needs_client_confirmation,
        payoutRulesDefined: val<unknown>('payout_rules', null) !== null,
        scoringRulesDefined: val<unknown>('scoring_rules', null) !== null,
        allowPickEdit: val<boolean>('allow_pick_edit_before_lock', true),
      };
    },
    staleTime: 5 * 60 * 1000,
  });

// ─── SLATES ────────────────────────────────────────────────
export const useSlates = (onlyOpen = true) =>
  useQuery({
    queryKey: ['slates', onlyOpen],
    queryFn: async () => {
      let q = supabase.from('slates').select('*').order('starts_at', { ascending: true });
      if (onlyOpen) q = q.eq('status', 'open');
      const { data, error } = await q;
      if (error) throw err(error);
      return (data ?? []) as Slate[];
    },
  });

export const useSlate = (slateId?: string) =>
  useQuery({
    enabled: !!slateId,
    queryKey: ['slate', slateId],
    queryFn: async () => {
      const { data, error } = await supabase.from('slates').select('*').eq('id', slateId!).maybeSingle();
      if (error) throw err(error);
      return (data ?? null) as Slate | null;
    },
  });

export const useSlateEvents = (slateId?: string) =>
  useQuery({
    enabled: !!slateId,
    queryKey: ['slate-events', slateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slate_events')
        .select('*')
        .eq('slate_id', slateId!)
        .order('sort_order', { ascending: true });
      if (error) throw err(error);
      return (data ?? []) as SlateEvent[];
    },
  });

/** Open group availability per slate, used on the slate cards. */
export const useSlateAvailability = () =>
  useQuery({
    queryKey: ['slate-availability'],
    queryFn: async () => {
      const { data, error } = await supabase.from('groups').select('slate_id, status').eq('status', 'open');
      if (error) throw err(error);
      const map: Record<string, number> = {};
      (data ?? []).forEach(g => { map[g.slate_id] = (map[g.slate_id] ?? 0) + 1; });
      return map;
    },
  });

// ─── GROUPS ────────────────────────────────────────────────
export const useMyGroups = (userId?: string) =>
  useQuery({
    enabled: !!userId,
    queryKey: ['my-groups', userId],
    queryFn: async () => {
      const { data: memberships, error: mErr } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId!);
      if (mErr) throw err(mErr);
      const ids = (memberships ?? []).map(m => m.group_id);
      if (ids.length === 0) return [] as (Group & { slate: Slate | null; memberCount: number })[];

      const [{ data: groups, error: gErr }, { data: counts, error: cErr }] = await Promise.all([
        supabase.from('groups').select('*, slates(*)').in('id', ids).order('created_at', { ascending: false }),
        supabase.from('group_members').select('group_id').in('group_id', ids),
      ]);
      if (gErr) throw err(gErr);
      if (cErr) throw err(cErr);
      const countMap: Record<string, number> = {};
      (counts ?? []).forEach(c => { countMap[c.group_id] = (countMap[c.group_id] ?? 0) + 1; });
      return (groups ?? []).map(g => {
        const { slates, ...rest } = g as Group & { slates: Slate | null };
        return { ...(rest as Group), slate: slates ?? null, memberCount: countMap[g.id] ?? 0 };
      });
    },
  });

export const useGroup = (groupId?: string) =>
  useQuery({
    enabled: !!groupId,
    queryKey: ['group', groupId],
    queryFn: async () => {
      const { data, error } = await supabase.from('groups').select('*').eq('id', groupId!).maybeSingle();
      if (error) throw err(error);
      return (data ?? null) as Group | null;
    },
  });

export const useGroupMembers = (groupId?: string) =>
  useQuery({
    enabled: !!groupId,
    queryKey: ['group-members', groupId],
    queryFn: async (): Promise<GroupMemberRow[]> => {
      const { data: members, error } = await supabase
        .from('group_members')
        .select('user_id, joined_at')
        .eq('group_id', groupId!)
        .order('joined_at', { ascending: true });
      if (error) throw err(error);
      const ids = (members ?? []).map(m => m.user_id);
      if (ids.length === 0) return [];
      const [{ data: profiles }, { data: entryRows }] = await Promise.all([
        supabase.from('profiles').select('id, username, display_name').in('id', ids),
        supabase.from('entries').select('user_id').eq('group_id', groupId!),
      ]);
      const submitted = new Set((entryRows ?? []).map(e => e.user_id));
      return (members ?? []).map(m => {
        const p = profiles?.find(x => x.id === m.user_id);
        return {
          user_id: m.user_id,
          joined_at: m.joined_at,
          username: p?.username ?? 'Pirate',
          display_name: p?.display_name ?? null,
          picksSubmitted: submitted.has(m.user_id) ? 1 : 0,
        };
      });
    },
  });

// ─── ENTRIES (individual slips) ────────────────────────────
export type EntryStatus = 'waiting' | 'grouped' | 'void';

export interface Entry {
  id: string;
  slate_id: string;
  user_id: string;
  wager_amount: number;
  group_size: number;
  status: EntryStatus;
  group_id: string | null;
  submitted_at: string;
}

export interface EntryRow extends Entry {
  slate: Slate | null;
  group: Group | null;
  memberCount: number;
}

export const useMyEntries = (userId?: string) =>
  useQuery({
    enabled: !!userId,
    queryKey: ['my-entries', userId],
    queryFn: async (): Promise<EntryRow[]> => {
      const { data, error } = await supabase
        .from('entries')
        .select('*, slates(*), groups(*)')
        .eq('user_id', userId!)
        .order('submitted_at', { ascending: false });
      if (error) throw err(error);
      const rows = (data ?? []) as unknown as (Entry & { slates: Slate | null; groups: Group | null })[];
      const groupIds = rows.map(r => r.group_id).filter(Boolean) as string[];
      let counts: Record<string, number> = {};
      if (groupIds.length) {
        const { data: m } = await supabase.from('group_members').select('group_id').in('group_id', groupIds);
        counts = {};
        (m ?? []).forEach(r => { counts[r.group_id] = (counts[r.group_id] ?? 0) + 1; });
      }
      return rows.map(({ slates, groups, ...rest }) => ({
        ...(rest as Entry),
        slate: slates ?? null,
        group: groups ?? null,
        memberCount: rest.group_id ? counts[rest.group_id] ?? 0 : 0,
      }));
    },
  });

/** The signed-in bettor's own slip selections for one entry. */
export const useEntryPicks = (entryId?: string) =>
  useQuery({
    enabled: !!entryId,
    queryKey: ['entry-picks', entryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entry_picks')
        .select('event_id, selection')
        .eq('entry_id', entryId!);
      if (error) throw err(error);
      const map: Record<string, Selection> = {};
      (data ?? []).forEach(p => { map[p.event_id] = p.selection as Selection; });
      return map;
    },
  });

// ─── ACTIONS ───────────────────────────────────────────────
export const useSubmitEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { slateId: string; wager: number; size: number; picks: Record<string, Selection> }) => {
      const { data, error } = await supabase.rpc('submit_entry', {
        _slate_id: v.slateId,
        _wager: v.wager,
        _size: v.size,
        _picks: v.picks,
      });
      if (error) throw err(error);
      return data as string;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['my-entries'] });
      void qc.invalidateQueries({ queryKey: ['my-groups'] });
    },
  });
};


/** Applies the configured lock/minimum-player rule server-side for anything past its lock time. */
export const applyDueLocks = async () => {
  const { error } = await supabase.rpc('lock_due_groups');
  if (error) throw err(error);
};
