-- Private profile pictures; each account can access only its own folder.
-- Client uploads are re-encoded to WebP before they reach Storage.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-avatars', 'profile-avatars', false, 524288, array['image/webp'])
on conflict (id) do update set public=false,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'lamaranku own avatar') then
    create policy "lamaranku own avatar" on storage.objects for all to authenticated
      using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
      with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
  end if;
end $$;
