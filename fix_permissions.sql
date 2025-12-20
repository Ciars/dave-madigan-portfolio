-- FIX PERMISSIONS (RLS)
-- This script guarantees the Admin can write to ALL tables necessary.
-- The "Reverting" issue is caused by the database blocking your 'Update' requests.

BEGIN;

-- 1. Enable RLS on both tables (Security Best Practice)
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts/duplicates
DROP POLICY IF EXISTS "Public View Artworks" ON artworks;
DROP POLICY IF EXISTS "Admin Manage Artworks" ON artworks;
DROP POLICY IF EXISTS "Public View Collections" ON collections;
DROP POLICY IF EXISTS "Admin Manage Collections" ON collections;

-- 3. Define ARTWORKS Policies
-- Public can READ
CREATE POLICY "Public View Artworks" ON artworks FOR SELECT TO public USING (true);
-- Admin can DO EVERYTHING (Insert, Update, Delete)
CREATE POLICY "Admin Manage Artworks" ON artworks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Define COLLECTIONS Policies (This was missing!)
-- Public can READ
CREATE POLICY "Public View Collections" ON collections FOR SELECT TO public USING (true);
-- Admin can DO EVERYTHING
CREATE POLICY "Admin Manage Collections" ON collections FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMIT;
