-- PLAYLIST MIGRATION (FIXED)
-- Please CLEAR the editor before running this.

BEGIN;

-- 1. Create site_config for Global/Root Order
CREATE TABLE IF NOT EXISTS site_config (
    id int PRIMARY KEY DEFAULT 1,
    root_structure jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Drop old policies to ensure clean state
DROP POLICY IF EXISTS "Public Read Config" ON site_config;
DROP POLICY IF EXISTS "Admin Write Config" ON site_config;

CREATE POLICY "Public Read Config" ON site_config FOR SELECT TO public USING (true);
CREATE POLICY "Admin Write Config" ON site_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert the singleton row if not exists
INSERT INTO site_config (id, root_structure)
VALUES (1, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. Add artwork_order to Collections
ALTER TABLE collections ADD COLUMN IF NOT EXISTS artwork_order jsonb DEFAULT '[]'::jsonb;

COMMIT;

-- 3. DATA MIGRATION: Convert old Sort Order to Playlist Arrays

DO $$
DECLARE
    r RECORD;
    arr jsonb;
BEGIN
    FOR r IN SELECT id FROM collections LOOP
        -- Get IDs of children ordered by old sort_order
        SELECT jsonb_agg(id ORDER BY sort_order ASC, created_at ASC)
        INTO arr
        FROM artworks
        WHERE collection_id = r.id;

        -- Update the collection
        UPDATE collections
        SET artwork_order = COALESCE(arr, '[]'::jsonb)
        WHERE id = r.id;
    END LOOP;
END $$;

DO $$
DECLARE
    root_arr jsonb;
BEGIN
    SELECT jsonb_agg(val ORDER BY sort_key ASC)
    INTO root_arr
    FROM (
        -- Select Collections
        SELECT 
            concat('collection:', id) as val, 
            sort_order as sort_key 
        FROM collections
        
        UNION ALL
        
        -- Select Root Artworks
        SELECT 
            concat('artwork:', id) as val, 
            sort_order as sort_key 
        FROM artworks 
        WHERE collection_id IS NULL
    ) as mixed_items;

    UPDATE site_config
    SET root_structure = COALESCE(root_arr, '[]'::jsonb)
    WHERE id = 1;
END $$;
