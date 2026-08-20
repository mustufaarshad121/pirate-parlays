
grant select on public.app_config to anon, authenticated;
grant insert, update, delete on public.app_config to authenticated;
grant all on public.app_config to service_role;

grant select, insert, update, delete on public.slates to authenticated;
grant all on public.slates to service_role;

grant select, insert, update, delete on public.slate_events to authenticated;
grant all on public.slate_events to service_role;

grant select, insert, update, delete on public.groups to authenticated;
grant all on public.groups to service_role;

grant select on public.group_members to authenticated;
grant all on public.group_members to service_role;

grant select on public.picks to authenticated;
grant all on public.picks to service_role;

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
