
create table public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index group_messages_group_idx on public.group_messages (group_id, created_at);
grant select, insert on public.group_messages to authenticated;
grant all on public.group_messages to service_role;
alter table public.group_messages enable row level security;
create policy "members read messages" on public.group_messages for select to authenticated
  using (exists (select 1 from public.group_members m where m.group_id = group_messages.group_id and m.user_id = auth.uid()));
create policy "members post messages" on public.group_messages for insert to authenticated
  with check (user_id = auth.uid() and exists (
    select 1 from public.group_members m where m.group_id = group_messages.group_id and m.user_id = auth.uid()));

alter publication supabase_realtime add table public.group_messages;
alter publication supabase_realtime add table public.group_members;
alter publication supabase_realtime add table public.groups;
