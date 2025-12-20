-- 1. Create the 'collections' table (The Folders)
create table if not exists collections (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  cover_image_url text,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add 'sort_order' and 'collection_id' to existing 'artworks' table
alter table artworks 
add column if not exists sort_order integer default 0,
add column if not exists collection_id uuid references collections(id) on delete set null;

-- 3. RLS Policies for 'collections'
alter table collections enable row level security;

-- Allow PUBLIC to view collections
create policy "Public Collections View"
on collections for select
to public
using (true);

-- Allow AUTHENTICATED (Admin) to manage collections
create policy "Admin Collections Manage"
on collections for all
to authenticated
using (true)
with check (true);

-- 4. Enable Realtime (Optional, good for drag-and-drop sync later)
alter publication supabase_realtime add table collections;
alter publication supabase_realtime add table artworks;
