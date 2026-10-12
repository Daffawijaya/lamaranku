-- Lamaranku schema Fase 2 (Supabase)
-- Paste ke Supabase Dashboard > SQL Editor > Run

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  plan text not null default 'basic' check (plan in ('basic','plus')),
  plus_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists cvs (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null default 'CV Tanpa Judul',
  nama text not null default '',
  posisi text not null default '',
  pengalaman text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists letters (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  nama text not null default '',
  perusahaan text not null default '',
  posisi text not null default '',
  body text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  plan text not null default 'plus',
  amount int not null default 29000,
  status text not null default 'pending' check (status in ('pending','paid','expired')),
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id bigint generated always as identity primary key,
  subscription_id bigint references subscriptions(id) on delete set null,
  user_id uuid not null references profiles(id) on delete cascade,
  proof_url text not null default '',
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table cvs enable row level security;
alter table letters enable row level security;
alter table subscriptions enable row level security;
alter table payments enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own cvs" on cvs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own letters" on letters for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own subs" on subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own payments" on payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Profil otomatis tiap user daftar (idempotent, aman di-run ulang).
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();
