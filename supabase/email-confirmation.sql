-- Status untuk halaman pendaftaran yang menunggu konfirmasi di perangkat lain.
-- Kedua UUID harus cocok; email dan data akun tidak pernah dikembalikan.
create or replace function public.signup_confirmation_status(
  p_user_id uuid,
  p_confirmation_id uuid
) returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users
    where id = p_user_id
      and raw_user_meta_data ->> 'confirmation_id' = p_confirmation_id::text
      and email_confirmed_at is not null
      and created_at > now() - interval '24 hours'
  );
$$;
revoke all on function public.signup_confirmation_status(uuid, uuid) from public;
grant execute on function public.signup_confirmation_status(uuid, uuid) to anon, authenticated;
