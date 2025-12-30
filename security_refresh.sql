-- MASTER SECURITY REFRESH
-- Run this in the Supabase SQL Editor to fix missing images and permission errors.

BEGIN;

--------------------------------------------------------------------------------
-- 1. DATABASE TABLES (Artworks, Collections, Profiles)
--------------------------------------------------------------------------------

-- Enable RLS (Safety First)
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Clear old policies (Prevent conflicts)
DROP POLICY IF EXISTS "Public View Artworks" ON artworks;
DROP POLICY IF EXISTS "Admin Manage Artworks" ON artworks;
DROP POLICY IF EXISTS "Public View Collections" ON collections;
DROP POLICY IF EXISTS "Admin Manage Collections" ON collections;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin View Profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin Manage Profiles" ON user_profiles;

-- ARTWORKS Policies
CREATE POLICY "Public View Artworks" ON artworks FOR SELECT TO public USING (true);
CREATE POLICY "Admin Manage Artworks" ON artworks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- COLLECTIONS Policies
CREATE POLICY "Public View Collections" ON collections FOR SELECT TO public USING (true);
CREATE POLICY "Admin Manage Collections" ON collections FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- USER PROFILES Policies
CREATE POLICY "Admin View Profiles" ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin Manage Profiles" ON user_profiles FOR ALL TO authenticated USING (true);


--------------------------------------------------------------------------------
-- 2. STORAGE BUCKET (The "Missing Images" Fix)
--------------------------------------------------------------------------------

-- Make sure the bucket exists (idempotent insert)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artworks', 'artworks', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Clear old storage policies
DROP POLICY IF EXISTS "Public Storage View" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Update" ON storage.objects; -- New!

-- Public Read Access (Vital for the website AND admin previews)
CREATE POLICY "Public Storage View"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'artworks' );

-- Admin Write Access (Upload, Delete, Update)
CREATE POLICY "Admin Storage Manage"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'artworks' )
WITH CHECK ( bucket_id = 'artworks' );

COMMIT;
