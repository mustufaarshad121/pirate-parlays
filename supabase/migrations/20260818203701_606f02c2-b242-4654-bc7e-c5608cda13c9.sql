
-- ROLES ------------------------------------------------------
create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  balance numeric not null default 1000,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable by authenticated" on public.profiles for select to authenticated using (true);
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare base_name text; final_name text; n int := 0;
begin
  base_name := coalesce(nullif(trim(new.raw_user_meta_data->>'username'),''), split_part(new.email,'@',1));
  final_name := base_name;
  while exists (select 1 from public.profiles where username = final_name) loop
    n := n + 1; final_name := base_name || n::text;
  end loop;
  insert into public.profiles (id, username, display_name)
  values (new.id, final_name, coalesce(new.raw_user_meta_data->>'display_name', final_name));
  insert into public.user_roles (user_id, role)
  values (new.id, case when new.email in ('admin@pirateparlays.com') then 'admin'::public.app_role else 'user'::public.app_role end);
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- CONFIGURABLE BUSINESS VALUES --------------------------------
create table public.app_config (
  key text primary key,
  value jsonb not null,
  needs_client_confirmation boolean not null default false,
  note text
);
grant select on public.app_config to authenticated, anon;
grant all on public.app_config to service_role;
alter table public.app_config enable row level security;
create policy "config readable" on public.app_config for select to authenticated, anon using (true);
create policy "admins manage config" on public.app_config for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.app_config (key, value, needs_client_confirmation, note) values
  ('entry_amounts', '[5,10,20]'::jsonb, false, 'Confirmed entry levels'),
  ('group_sizes', '[10,25,50]'::jsonb, false, 'Confirmed group sizes'),
  ('minimum_players', '5'::jsonb, true, 'Minimum real participants at lock time - awaiting written client confirmation'),
  ('payout_rules', 'null'::jsonb, true, 'Payout formula, fees, tie handling and refund policy are undefined - awaiting client confirmation'),
  ('scoring_rules', 'null'::jsonb, true, 'Scoring / settlement formula undefined - awaiting client confirmation'),
  ('allow_pick_edit_before_lock', 'true'::jsonb, false, 'Players may edit their picks until their group locks');

-- SLATES ------------------------------------------------------
create table public.slates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  league text not null,
  starts_at timestamptz not null,
  lock_at timestamptz not null,
  status text not null default 'open' check (status in ('open','locked','live','completed','cancelled')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.slates to authenticated;
grant all on public.slates to service_role;
alter table public.slates enable row level security;
create policy "slates readable" on public.slates for select to authenticated using (true);
create policy "admins manage slates" on public.slates for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.slate_events (
  id uuid primary key default gen_random_uuid(),
  slate_id uuid not null references public.slates(id) on delete cascade,
  home_team text not null,
  away_team text not null,
  starts_at timestamptz,
  sort_order int not null default 0,
  result text check (result in ('home','away','void')),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.slate_events to authenticated;
grant all on public.slate_events to service_role;
alter table public.slate_events enable row level security;
create policy "events readable" on public.slate_events for select to authenticated using (true);
create policy "admins manage events" on public.slate_events for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- GROUPS ------------------------------------------------------
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text,
  slate_id uuid not null references public.slates(id) on delete cascade,
  entry_amount numeric not null,
  group_size int not null,
  is_private boolean not null default false,
  status text not null default 'open' check (status in ('open','locked','live','completed','void')),
  created_by uuid references auth.users(id) on delete set null,
  locked_at timestamptz,
  created_at timestamptz not null default now()
);
create index groups_match_idx on public.groups (slate_id, entry_amount, group_size, status, is_private);
grant select, insert, update on public.groups to authenticated;
grant all on public.groups to service_role;
alter table public.groups enable row level security;
create policy "groups readable by authenticated" on public.groups for select to authenticated using (true);
create policy "admins manage groups" on public.groups for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);
grant select on public.group_members to authenticated;
grant all on public.group_members to service_role;
alter table public.group_members enable row level security;
create policy "members readable by authenticated" on public.group_members for select to authenticated using (true);

create table public.picks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.slate_events(id) on delete cascade,
  selection text not null check (selection in ('home','away')),
  submitted_at timestamptz not null default now(),
  unique (group_id, user_id, event_id)
);
grant select on public.picks to authenticated;
grant all on public.picks to service_role;
alter table public.picks enable row level security;
create policy "picks visible to group members" on public.picks for select to authenticated
  using (exists (select 1 from public.group_members m where m.group_id = picks.group_id and m.user_id = auth.uid()));
