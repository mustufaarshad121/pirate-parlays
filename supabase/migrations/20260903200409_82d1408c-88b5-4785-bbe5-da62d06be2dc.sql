
revoke all on function public.try_form_group(uuid, numeric, integer) from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.gen_group_code() from public, anon, authenticated;
revoke all on function public.join_group_internal(uuid, uuid) from public, anon, authenticated;
revoke all on function public.submit_entry(uuid, numeric, integer, jsonb) from public, anon;
grant execute on function public.submit_entry(uuid, numeric, integer, jsonb) to authenticated;
revoke all on function public.lock_due_groups() from public, anon;
grant execute on function public.lock_due_groups() to authenticated;
