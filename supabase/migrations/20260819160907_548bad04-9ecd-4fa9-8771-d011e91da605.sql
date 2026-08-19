
revoke execute on function public.quick_match(uuid, numeric, int) from anon, public;
revoke execute on function public.create_private_group(uuid, numeric, int, text) from anon, public;
revoke execute on function public.join_group(uuid) from anon, public;
revoke execute on function public.join_group_by_code(text) from anon, public;
revoke execute on function public.submit_picks(uuid, jsonb) from anon, public;
revoke execute on function public.lock_due_groups() from anon, public;
revoke execute on function public.gen_group_code() from public;
revoke execute on function public.join_group_internal(uuid, uuid) from public;
revoke execute on function public.app_config_has_number(text, numeric) from public;
revoke execute on function public.has_role(uuid, public.app_role) from public;
revoke execute on function public.handle_new_user() from public;

grant execute on function public.quick_match(uuid, numeric, int) to authenticated;
grant execute on function public.create_private_group(uuid, numeric, int, text) to authenticated;
grant execute on function public.join_group(uuid) to authenticated;
grant execute on function public.join_group_by_code(text) to authenticated;
grant execute on function public.submit_picks(uuid, jsonb) to authenticated;
grant execute on function public.lock_due_groups() to authenticated;
