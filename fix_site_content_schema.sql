-- FIX SITE CONTENT SCHEMA & DATA
-- This script ensures the 'site_content' table assumes the correct structure and has the required default row.

BEGIN;

-- 1. Create table if missing
CREATE TABLE IF NOT EXISTS site_content (
  id SERIAL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Ensure Row 1 exists (Singleton Pattern)
INSERT INTO site_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 3. Add ALL required columns (Idempotent)
ALTER TABLE site_content 
ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT 'Distorting Reality',
ALTER COLUMN hero_title SET DEFAULT 'Distorting Reality';

ALTER TABLE site_content 
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT 'Exploring the increasing remove from the natural world through surreal depictions of technological artefacts.',
ALTER COLUMN hero_subtitle SET DEFAULT 'Exploring the increasing remove from the natural world through surreal depictions of technological artefacts.';

ALTER TABLE site_content 
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ALTER COLUMN hero_image_url SET DEFAULT 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop';

ALTER TABLE site_content 
ADD COLUMN IF NOT EXISTS header_settings jsonb DEFAULT '{"title": "Dave Madigan"}'::jsonb;

ALTER TABLE site_content 
ADD COLUMN IF NOT EXISTS footer_settings jsonb DEFAULT '{"email": "", "instagram_url": "", "copyright_text": "© 2024 Dave Madigan", "show_subscribe": true}'::jsonb;

ALTER TABLE site_content 
ADD COLUMN IF NOT EXISTS about_bio jsonb DEFAULT '["Following a career in manufacturing, Dave Madigan (b. Dublin, Ireland) retrained as a visual artist.", "A regular exhibitor in the Royal Hibernian and Royal Ulster academies, Dave''s work is noted for his surreal painted depictions of modern day technological artefacts.", "Most recently, Dave has moved toward studies of environmental subject matter."]'::jsonb;

ALTER TABLE site_content 
ADD COLUMN IF NOT EXISTS about_collections jsonb DEFAULT '["Office of Public Works", "DCU Business School", "The Arts Council of Northern Ireland", "Dún Laoghaire-Rathdown County Council", "Royal College of Physicians, Ireland"]'::jsonb;


-- 4. FORCE RLS POLICIES (Refresh)
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Site Content" ON site_content;
DROP POLICY IF EXISTS "Admin Update Site Content" ON site_content;
DROP POLICY IF EXISTS "Allow public read access" ON site_content;
DROP POLICY IF EXISTS "Allow admin update" ON site_content;
DROP POLICY IF EXISTS "Allow admin insert" ON site_content;

-- Public can Read
CREATE POLICY "Public Read Site Content" ON site_content FOR SELECT TO public USING (true);

-- Admin can Update
CREATE POLICY "Admin Update Site Content" ON site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMIT;
