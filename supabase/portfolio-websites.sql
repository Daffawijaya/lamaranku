-- Run once in Supabase SQL Editor. Uses app_metadata, never editable profiles.plan.
create or replace function public.portfolio_has_plus(account_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from auth.users u where u.id = account_id
    and u.raw_app_meta_data->>'plan' = 'plus'
    and (u.raw_app_meta_data->>'plus_until' is null or
      (u.raw_app_meta_data->>'plus_until')::timestamptz > now()));
$$;
revoke all on function public.portfolio_has_plus(uuid) from public;
grant execute on function public.portfolio_has_plus(uuid) to authenticated;

create table if not exists public.portfolio_websites (
  user_id uuid primary key references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'
    and slug not in ('admin','api','dashboard','portfolio','support','lamaranku')),
  draft jsonb not null,
  published jsonb,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  check (octet_length(draft::text) <= 100000),
  check (published is null or octet_length(published::text) <= 100000)
);
alter table public.portfolio_websites enable row level security;
revoke all on public.portfolio_websites from anon, authenticated;
grant select on public.portfolio_websites to authenticated;
drop policy if exists "read own portfolio website" on public.portfolio_websites;
create policy "read own portfolio website" on public.portfolio_websites for select to authenticated using (user_id = (select auth.uid()));

-- Only this function writes. A saved draft never replaces the published snapshot.
create or replace function public.save_portfolio_website(site_slug text, document jsonb, action text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare account_id uuid := auth.uid(); result public.portfolio_websites;
begin
  if account_id is null then raise exception 'UNAUTHORIZED'; end if;
  if action not in ('save','publish','unpublish') then raise exception 'INVALID_ACTION'; end if;
  if action = 'unpublish' then
    update public.portfolio_websites set published = null, published_at = null, updated_at = now()
    where user_id = account_id returning * into result;
    return to_jsonb(result);
  end if;
  if not public.portfolio_has_plus(account_id) then raise exception 'PLUS_REQUIRED'; end if;
  if jsonb_typeof(document) <> 'object' or octet_length(document::text) > 100000
    or document->>'template' not in ('bento','editorial','midnight') then raise exception 'INVALID_DOCUMENT'; end if;
  if action = 'publish' and (coalesce(btrim(document->>'name'),'') = '' or coalesce(btrim(document->>'role'),'') = '') then raise exception 'PROFILE_REQUIRED'; end if;
  -- Serialize updates for one account, including first publication.
  perform pg_advisory_xact_lock(hashtextextended(account_id::text, 0));
  select * into result from public.portfolio_websites where user_id = account_id;
  if result.published is not null and result.slug <> site_slug and action = 'save' then raise exception 'UNPUBLISH_BEFORE_RENAME'; end if;
  insert into public.portfolio_websites (user_id, slug, draft, published, published_at)
  values (account_id, site_slug, document, case when action = 'publish' then document end, case when action = 'publish' then now() end)
  on conflict (user_id) do update set slug = excluded.slug, draft = excluded.draft,
    published = case when action = 'publish' then document else portfolio_websites.published end,
    published_at = case when action = 'publish' then now() else portfolio_websites.published_at end, updated_at = now()
  returning * into result;
  return to_jsonb(result);
end;
$$;
revoke all on function public.save_portfolio_website(text,jsonb,text) from public;
grant execute on function public.save_portfolio_website(text,jsonb,text) to authenticated;

-- Public visitors can only read the live snapshot, with current entitlement checked.
create or replace function public.get_public_portfolio(site_slug text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('slug', p.slug, 'document', p.published, 'updatedAt', p.published_at)
  from public.portfolio_websites p where p.slug = site_slug and p.published is not null
    and public.portfolio_has_plus(p.user_id);
$$;
revoke all on function public.get_public_portfolio(text) from public;
grant execute on function public.get_public_portfolio(text) to anon, authenticated;

-- Images use random WebP paths. Images are public; drafts and text are private.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio-images','portfolio-images',true,2097152,array['image/webp'])
on conflict (id) do update set public=true, file_size_limit=2097152, allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "portfolio image upload" on storage.objects;
create policy "portfolio image upload" on storage.objects for insert to authenticated
with check (bucket_id='portfolio-images' and (storage.foldername(name))[1]=(select auth.uid())::text and public.portfolio_has_plus((select auth.uid())));
drop policy if exists "portfolio image owner read" on storage.objects;
create policy "portfolio image owner read" on storage.objects for select to authenticated
using (bucket_id='portfolio-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "portfolio image owner delete" on storage.objects;
create policy "portfolio image owner delete" on storage.objects for delete to authenticated
using (bucket_id='portfolio-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
