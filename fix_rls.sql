-- 1. Enable RLS on the 'artworks' table (just in case)
alter table artworks enable row level security;

-- 2. Allow PUBLIC read access to artworks table
create policy "Public Artworks View"
on artworks for select
to public
using (true);

-- 3. Allow AUTHENTICATED users (Admin) full access to artworks table
create policy "Admin Artworks Manage"
on artworks for all
to authenticated
using (true)
with check (true);

-- STORAGE POLICIES (This fixes the specific error you saw)

-- 4. Allow PUBLIC to view images in 'artworks' bucket
create policy "Public Storage View"
on storage.objects for select
to public
using ( bucket_id = 'artworks' );

-- 5. Allow AUTHENTICATED users to upload to 'artworks' bucket
create policy "Admin Storage Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'artworks' );

-- 6. Allow AUTHENTICATED users to delete from 'artworks' bucket
create policy "Admin Storage Delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'artworks' );
