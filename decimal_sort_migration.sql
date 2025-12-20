-- Migration to support Decimal Ordering
-- Changes sort_order from integer/bigint to double precision (float8)

BEGIN;

-- 1. Alter Artworks Table
DO $$ 
BEGIN
    -- Check if column exists, if not adds it (safety)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artworks' AND column_name = 'sort_order') THEN
        ALTER TABLE artworks ADD COLUMN sort_order double precision DEFAULT 0;
    ELSE
        -- Change type to double precision
        ALTER TABLE artworks ALTER COLUMN sort_order TYPE double precision USING sort_order::double precision;
    END IF;
END $$;

-- 2. Alter Collections Table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collections' AND column_name = 'sort_order') THEN
        ALTER TABLE collections ADD COLUMN sort_order double precision DEFAULT 0;
    ELSE
        ALTER TABLE collections ALTER COLUMN sort_order TYPE double precision USING sort_order::double precision;
    END IF;
END $$;

COMMIT;
