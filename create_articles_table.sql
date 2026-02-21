-- CREATE ARTICLES TABLE AND STORAGE BUCKET MIGRATION

BEGIN;

-- 1. Create the 'articles' table
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS Policies for 'articles'
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Allow PUBLIC to view active articles
CREATE POLICY "Public Articles View"
ON public.articles FOR SELECT
TO public
USING (is_active = true);

-- Allow AUTHENTICATED to view all articles (including inactive ones in admin)
CREATE POLICY "Admin Articles View All"
ON public.articles FOR SELECT
TO authenticated
USING (true);

-- Allow AUTHENTICATED (Admin) to manage articles
CREATE POLICY "Admin Articles Manage"
ON public.articles FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Create 'article-images' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. RLS for 'article-images' bucket
-- Allow public to select objects
CREATE POLICY "Public Article Images View"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'article-images');

-- Allow authenticated admins to insert/update/delete objects
CREATE POLICY "Admin Article Images Manage"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'article-images')
WITH CHECK (bucket_id = 'article-images');

-- 5. Enable Realtime (optional but good for admin)
ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;

COMMIT;
