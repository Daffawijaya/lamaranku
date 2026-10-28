-- Private profile pictures; each account can access only its own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-avatars', 'profile-avatars', false, 524288, array['image/jpeg'])
on conflict (id) do nothing;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'lamaranku own avatar') then
    create policy "lamaranku own avatar" on storage.objects for all to authenticated
      using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
      with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
  end if;
end $$;
