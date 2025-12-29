-- Create a table for singleton site content
CREATE TABLE IF NOT EXISTS site_content (
    id SERIAL PRIMARY KEY,
    hero_title TEXT DEFAULT 'Distorting Reality',
    hero_subtitle TEXT DEFAULT 'Exploring the increasing remove from the natural world through surreal depictions of technological artefacts.',
    hero_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enforce a single row by checking id=1 constraint or just policy
-- Simple way: Insert default row if not exists
INSERT INTO site_content (id, hero_title, hero_subtitle, hero_image_url)
VALUES (1, 'Distorting Reality', 'Exploring the increasing remove from the natural world through surreal depictions of technological artefacts.', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON site_content FOR SELECT
USING (true);

-- Allow authenticated users (admin) to update
CREATE POLICY "Allow admin update"
ON site_content FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to insert (only needed once, but good for completeness)
CREATE POLICY "Allow admin insert"
ON site_content FOR INSERT
TO authenticated
WITH CHECK (true);
