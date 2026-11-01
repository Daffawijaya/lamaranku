-- Run once in Supabase SQL Editor. Menyimpan CV per akun supaya bisa dibuka di device lain.
create table if not exists public.saved_cvs (
  user_id uuid not null references auth.users(id) on delete cascade,
  cv_id text not null check (cv_id ~ '^[A-Za-z0-9_-]{1,64}$'),
  judul text not null default '' check (char_length(judul) <= 200),
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, cv_id),
  check (octet_length(data::text) <= 100000)
);

create index if not exists saved_cvs_user_created on public.saved_cvs (user_id, created_at);

alter table public.saved_cvs enable row level security;
revoke all on public.saved_cvs from anon, authenticated;
grant select, insert, update, delete on public.saved_cvs to authenticated;

drop policy if exists "read own saved cvs" on public.saved_cvs;
create policy "read own saved cvs" on public.saved_cvs for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "write own saved cvs" on public.saved_cvs;
create policy "write own saved cvs" on public.saved_cvs for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "update own saved cvs" on public.saved_cvs;
create policy "update own saved cvs" on public.saved_cvs for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "delete own saved cvs" on public.saved_cvs;
create policy "delete own saved cvs" on public.saved_cvs for delete to authenticated
  using (user_id = (select auth.uid()));
