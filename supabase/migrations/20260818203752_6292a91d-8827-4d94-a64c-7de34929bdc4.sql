
revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;

create or replace function public.gen_group_code()
returns text language plpgsql volatile security definer set search_path = public as $$
declare alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; c text; i int;
begin
  loop
    c := '';
    for i in 1..3 loop c := c || substr(alphabet, 1 + floor(random()*length(alphabet))::int, 1); end loop;
    c := c || '-';
    for i in 1..4 loop c := c || substr(alphabet, 1 + floor(random()*length(alphabet))::int, 1); end loop;
    exit when not exists (select 1 from public.groups where code = c);
  end loop;
  return c;
end; $$;
revoke execute on function public.gen_group_code() from anon, authenticated;

-- shared join logic, capacity-safe
create or replace function public.join_group_internal(_group_id uuid, _user_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare g public.groups; cnt int;
begin
  select * into g from public.groups where id = _group_id for update;
  if not found then raise exception 'GROUP_NOT_FOUND'; end if;
  if g.status <> 'open' then raise exception 'GROUP_NOT_OPEN'; end if;
  if exists (select 1 from public.group_members where group_id = _group_id and user_id = _user_id) then
    return _group_id;
  end if;
  select count(*) into cnt from public.group_members where group_id = _group_id;
  if cnt >= g.group_size then raise exception 'GROUP_FULL'; end if;
  insert into public.group_members (group_id, user_id) values (_group_id, _user_id);
  return _group_id;
end; $$;
revoke execute on function public.join_group_internal(uuid, uuid) from anon, authenticated;

create or replace function public.quick_match(_slate_id uuid, _entry numeric, _size int)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); target uuid; s public.slates; new_id uuid;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into s from public.slates where id = _slate_id;
  if not found then raise exception 'SLATE_NOT_FOUND'; end if;
  if s.status <> 'open' or s.lock_at <= now() then raise exception 'SLATE_CLOSED'; end if;
  if not (public.app_config_has_number('entry_amounts', _entry)) then raise exception 'INVALID_ENTRY'; end if;
  if not (public.app_config_has_number('group_sizes', _size)) then raise exception 'INVALID_SIZE'; end if;

  select g.id into target
  from public.groups g
  left join public.group_members m on m.group_id = g.id
  where g.slate_id = _slate_id and g.entry_amount = _entry and g.group_size = _size
    and g.status = 'open' and g.is_private = false
    and not exists (select 1 from public.group_members mm where mm.group_id = g.id and mm.user_id = uid)
  group by g.id, g.group_size
  having count(m.id) < g.group_size
  order by count(m.id) desc, g.created_at asc
  limit 1
  for update of g skip locked;

  if target is null then
    insert into public.groups (code, slate_id, entry_amount, group_size, is_private, created_by, name)
    values (public.gen_group_code(), _slate_id, _entry, _size, false, uid, null)
    returning id into new_id;
    target := new_id;
  end if;

  return public.join_group_internal(target, uid);
end; $$;

create or replace function public.app_config_has_number(_key text, _val numeric)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.app_config c, jsonb_array_elements(c.value) e
    where c.key = _key and (e::text)::numeric = _val
  )
$$;
revoke execute on function public.app_config_has_number(text, numeric) from anon, authenticated;

create or replace function public.create_private_group(_slate_id uuid, _entry numeric, _size int, _name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); s public.slates; new_id uuid;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into s from public.slates where id = _slate_id;
  if not found then raise exception 'SLATE_NOT_FOUND'; end if;
  if s.status <> 'open' or s.lock_at <= now() then raise exception 'SLATE_CLOSED'; end if;
  if not public.app_config_has_number('entry_amounts', _entry) then raise exception 'INVALID_ENTRY'; end if;
  if not public.app_config_has_number('group_sizes', _size) then raise exception 'INVALID_SIZE'; end if;
  insert into public.groups (code, slate_id, entry_amount, group_size, is_private, created_by, name)
  values (public.gen_group_code(), _slate_id, _entry, _size, true, uid,
          coalesce(nullif(trim(_name),''), 'Private Group'))
  returning id into new_id;
  perform public.join_group_internal(new_id, uid);
  return new_id;
end; $$;

create or replace function public.join_group(_group_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  return public.join_group_internal(_group_id, auth.uid());
end; $$;

create or replace function public.join_group_by_code(_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare gid uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select id into gid from public.groups where upper(code) = upper(trim(_code));
  if gid is null then raise exception 'INVALID_CODE'; end if;
  return public.join_group_internal(gid, auth.uid());
end; $$;

create or replace function public.submit_picks(_group_id uuid, _picks jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); g public.groups; rec record; n int := 0;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into g from public.groups where id = _group_id;
  if not found then raise exception 'GROUP_NOT_FOUND'; end if;
  if not exists (select 1 from public.group_members where group_id = _group_id and user_id = uid) then
    raise exception 'NOT_A_MEMBER';
  end if;
  if g.status <> 'open' then raise exception 'GROUP_LOCKED'; end if;
  if exists (select 1 from public.slates s where s.id = g.slate_id and (s.lock_at <= now() or s.status <> 'open')) then
    raise exception 'GROUP_LOCKED';
  end if;

  for rec in select key::uuid as event_id, value #>> '{}' as selection from jsonb_each(_picks) loop
    if rec.selection not in ('home','away') then raise exception 'INVALID_SELECTION'; end if;
    if not exists (select 1 from public.slate_events e where e.id = rec.event_id and e.slate_id = g.slate_id) then
      raise exception 'INVALID_EVENT';
    end if;
    insert into public.picks (group_id, user_id, event_id, selection)
    values (_group_id, uid, rec.event_id, rec.selection)
    on conflict (group_id, user_id, event_id)
      do update set selection = excluded.selection, submitted_at = now();
    n := n + 1;
  end loop;
  return n;
end; $$;

-- Applies the configured minimum-player rule at lock time.
create or replace function public.lock_due_groups()
returns int language plpgsql security definer set search_path = public as $$
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
  return n;
end; $$;
