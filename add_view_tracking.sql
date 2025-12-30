-- Migration: Add view tracking to artworks
-- Description: Adds a view_count column and a function to increment it.

-- 1. Add view_count column
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 2. Create RPC function for incrementing (bypasses RLS strictly for counting)
CREATE OR REPLACE FUNCTION increment_artwork_view(artwork_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE artworks
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = artwork_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant access to authenticated and anonymous users if needed
-- Assuming the public site is anonymous
GRANT EXECUTE ON FUNCTION increment_artwork_view(BIGINT) TO anon;
GRANT EXECUTE ON FUNCTION increment_artwork_view(BIGINT) TO authenticated;
