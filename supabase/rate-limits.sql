-- Run once in Supabase SQL Editor. Limit frekuensi per akun (token bucket per
-- jendela waktu) untuk endpoint yang mahal. Aplikasi fail-open: selama fungsi
-- ini belum ada, request tetap diizinkan dan hanya dicatat di log server.
create table if not exists public.rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (user_id, kind, window_start)
);
alter table public.rate_limits enable row level security;
-- Tidak ada policy: hanya fungsi security definer yang menulis ke tabel ini.

create or replace function public.rate_limit_hit(p_kind text, p_limit int, p_window_seconds int)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare account_id uuid := auth.uid(); bucket timestamptz; hits int;
begin
  if account_id is null then raise exception 'UNAUTHORIZED'; end if;
  if p_limit < 1 or p_window_seconds < 60 then raise exception 'INVALID_ARGUMENT'; end if;
  bucket := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.rate_limits (user_id, kind, window_start, count)
  values (account_id, p_kind, bucket, 1)
  on conflict (user_id, kind, window_start)
    do update set count = rate_limits.count + 1
  returning count into hits;
  -- Pangkas baris lama sesekali supaya tabel tetap kecil.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;
  return jsonb_build_object(
    'allowed', hits <= p_limit,
    'remaining', greatest(0, p_limit - hits),
    'retry_after_seconds',
      greatest(1, floor(extract(epoch from (bucket + make_interval(secs => p_window_seconds) - now())))::int)
  );
end;
$$;
revoke all on function public.rate_limit_hit(text,int,int) from public;
grant execute on function public.rate_limit_hit(text,int,int) to authenticated;
