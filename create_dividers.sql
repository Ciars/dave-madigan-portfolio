-- CREATE DIVIDERS TABLE MIGRATION

BEGIN;

-- 1. Create the 'dividers' table
CREATE TABLE IF NOT EXISTS dividers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS Policies for 'dividers'
ALTER TABLE dividers ENABLE ROW LEVEL SECURITY;

-- Allow PUBLIC to view dividers
CREATE POLICY "Public Dividers View"
ON dividers FOR SELECT
TO public
USING (true);

-- Allow AUTHENTICATED (Admin) to manage dividers
CREATE POLICY "Admin Dividers Manage"
ON dividers FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE dividers;

COMMIT;
