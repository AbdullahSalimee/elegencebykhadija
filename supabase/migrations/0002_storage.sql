-- Product photo storage. Run after 0001_init.sql / seed.sql.
--
-- Public bucket: files are served straight from Supabase's CDN via the
-- public URL scheme (storage/v1/object/public/product-images/<path>), no
-- signed URLs or RLS SELECT policy needed for that. All writes happen
-- server-side through app/api/uploads/product-image (service role key,
-- which bypasses RLS entirely), so no INSERT/UPDATE/DELETE policy is
-- required either — but one is added below for defense-in-depth in case a
-- future authenticated-client upload path is added.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product-images public read" on storage.objects;
create policy "product-images public read"
  on storage.objects for select
  using (bucket_id = 'product-images');
