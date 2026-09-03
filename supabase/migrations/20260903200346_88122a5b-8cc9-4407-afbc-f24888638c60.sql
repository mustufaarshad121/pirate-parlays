
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  slate_id uuid not null references public.slates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  wager_amount numeric not null,
  group_size integer not null,
  status text not null default 'waiting',
  group_id uuid references public.groups(id) on delete set null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert on public.entries to authenticated;
grant all on public.entries to service_role;
alter table public.entries enable row level security;

create policy "own entries readable" on public.entries for select to authenticated using (user_id = auth.uid());
create policy "admins read entries" on public.entries for select to authenticated using (public.has_role(auth.uid(),'admin'));

create table if not exists public.entry_picks (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  event_id uuid not null references public.slate_events(id) on delete cascade,
  selection text not null,
  created_at timestamptz not null default now(),
  unique (entry_id, event_id)
);

grant select on public.entry_picks to authenticated;
grant all on public.entry_picks to service_role;
alter table public.entry_picks enable row level security;

create policy "own picks readable" on public.entry_picks for select to authenticated
  using (exists (select 1 from public.entries e where e.id = entry_picks.entry_id and e.user_id = auth.uid()));
create policy "admins read picks" on public.entry_picks for select to authenticated
  using (public.has_role(auth.uid(),'admin'));

create index if not exists entries_match_idx on public.entries (slate_id, wager_amount, group_size, status);
create index if not exists entries_user_idx on public.entries (user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists entries_updated_at on public.entries;
create trigger entries_updated_at before update on public.entries
for each row execute function public.set_updated_at();

-- form a group when 5+ waiting entries share game + wager + size
create or replace function public.try_form_group(_slate_id uuid, _wager numeric, _size integer)
returns uuid language plpgsql security definer set search_path = public as $$
declare minp int; cnt int; gid uuid; code text; r record;
begin
  select coalesce((value #>> '{}')::int, 5) into minp from public.app_config where key = 'minimum_players';
  minp := coalesce(minp, 5);

  select count(*) into cnt from public.entries
   where slate_id = _slate_id and wager_amount = _wager and group_size = _size and status = 'waiting';
  if cnt < minp then return null; end if;

  code := public.gen_group_code();
  insert into public.groups (code, slate_id, entry_amount, group_size, is_private, created_by, name)
  values (code, _slate_id, _wager, _size, false, null, 'Group ' || code)
  returning id into gid;

  for r in
    select id, user_id from public.entries
     where slate_id = _slate_id and wager_amount = _wager and group_size = _size and status = 'waiting'
     order by random() limit _size
  loop
    update public.entries set status = 'grouped', group_id = gid where id = r.id;
    insert into public.group_members (group_id, user_id) values (gid, r.user_id)
      on conflict do nothing;
  end loop;

  return gid;
end $$;

create or replace function public.submit_entry(_slate_id uuid, _wager numeric, _size integer, _picks jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); s public.slates; eid uuid; rec record; n int := 0;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into s from public.slates where id = _slate_id;
  if not found then raise exception 'SLATE_NOT_FOUND'; end if;
  if s.status <> 'open' or s.lock_at <= now() then raise exception 'SLATE_CLOSED'; end if;
  if not public.app_config_has_number('entry_amounts', _wager) then raise exception 'INVALID_ENTRY'; end if;
  if not public.app_config_has_number('group_sizes', _size) then raise exception 'INVALID_SIZE'; end if;
  if exists (select 1 from public.entries where user_id = uid and slate_id = _slate_id and status in ('waiting','grouped')) then
    raise exception 'ENTRY_EXISTS';
  end if;

  insert into public.entries (slate_id, user_id, wager_amount, group_size)
  values (_slate_id, uid, _wager, _size) returning id into eid;

  for rec in select key::uuid as event_id, value #>> '{}' as selection from jsonb_each(_picks) loop
    if rec.selection not in ('home','away') then raise exception 'INVALID_SELECTION'; end if;
    if not exists (select 1 from public.slate_events e where e.id = rec.event_id and e.slate_id = _slate_id) then
      raise exception 'INVALID_EVENT';
    end if;
    insert into public.entry_picks (entry_id, event_id, selection) values (eid, rec.event_id, rec.selection);
    n := n + 1;
  end loop;
  if n = 0 then raise exception 'NO_SELECTIONS'; end if;

  perform public.try_form_group(_slate_id, _wager, _size);
  return eid;
end $$;

create or replace function public.lock_due_groups()
returns integer language plpgsql security definer set search_path = public as $$
declare minp int; n int := 0; g record;
begin
  select (value #>> '{}')::int into minp from public.app_config where key = 'minimum_players';
  for g in
    select gr.id, count(m.id) as members
    from public.groups gr
    join public.slates s on s.id = gr.slate_id
    left join public.group_members m on m.group_id = gr.id
    where gr.status = 'open' and s.lock_at <= now()
    group by gr.id
  loop
    update public.groups
      set status = case when g.members >= coalesce(minp, 0) then 'locked' else 'void' end,
          locked_at = now()
      where id = g.id;
    n := n + 1;
  end loop;

  update public.slates set status = 'locked' where status = 'open' and lock_at <= now();

  update public.entries e set status = 'void'
    from public.slates s
   where s.id = e.slate_id and e.status = 'waiting' and s.lock_at <= now();

  return n;
end $$;
