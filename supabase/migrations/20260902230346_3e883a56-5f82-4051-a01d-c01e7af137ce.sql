-- Remove user-selected / invite-based group placement (random placement only)
DROP FUNCTION IF EXISTS public.create_private_group(uuid, numeric, integer, text);
DROP FUNCTION IF EXISTS public.join_group_by_code(text);
DROP FUNCTION IF EXISTS public.join_group(uuid);

-- Confirmed configuration values
INSERT INTO public.app_config (key, value, needs_client_confirmation, note)
VALUES
  ('entry_amounts', '[5,10,20]'::jsonb, false, 'Client-confirmed wager choices'),
  ('group_sizes', '[10,25,50]'::jsonb, false, 'Client-confirmed group-size maximums'),
  ('minimum_players', '5'::jsonb, false, 'Client-confirmed minimum bettors for a group to proceed')
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      needs_client_confirmation = EXCLUDED.needs_client_confirmation,
      note = EXCLUDED.note;

-- Random placement only; groups are always system-created and always named
CREATE OR REPLACE FUNCTION public.quick_match(_slate_id uuid, _entry numeric, _size integer)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare uid uuid := auth.uid(); target uuid; s public.slates; new_id uuid; new_code text;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into s from public.slates where id = _slate_id;
  if not found then raise exception 'SLATE_NOT_FOUND'; end if;
  if s.status <> 'open' or s.lock_at <= now() then raise exception 'SLATE_CLOSED'; end if;
  if not (public.app_config_has_number('entry_amounts', _entry)) then raise exception 'INVALID_ENTRY'; end if;
  if not (public.app_config_has_number('group_sizes', _size)) then raise exception 'INVALID_SIZE'; end if;

  -- random placement among eligible groups: same game + same wager + same selected size
  select g.id into target
  from public.groups g
  left join public.group_members m on m.group_id = g.id
  where g.slate_id = _slate_id and g.entry_amount = _entry and g.group_size = _size
    and g.status = 'open' and g.is_private = false
    and not exists (select 1 from public.group_members mm where mm.group_id = g.id and mm.user_id = uid)
  group by g.id, g.group_size
  having count(m.id) < g.group_size
  order by random()
  limit 1
  for update of g skip locked;

  if target is null then
    new_code := public.gen_group_code();
    insert into public.groups (code, slate_id, entry_amount, group_size, is_private, created_by, name)
    values (new_code, _slate_id, _entry, _size, false, null, 'Group ' || new_code)
    returning id into new_id;
    target := new_id;
  end if;

  return public.join_group_internal(target, uid);
end; $function$;

REVOKE ALL ON FUNCTION public.quick_match(uuid, numeric, integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.quick_match(uuid, numeric, integer) TO authenticated;

-- Admin oversight of group chat
DROP POLICY IF EXISTS "admins read messages" ON public.group_messages;
CREATE POLICY "admins read messages" ON public.group_messages
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins read members" ON public.group_members;
CREATE POLICY "admins read members" ON public.group_members
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));