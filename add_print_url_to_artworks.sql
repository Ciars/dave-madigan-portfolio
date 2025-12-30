-- Add print_url column to artworks table
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS print_url TEXT;
