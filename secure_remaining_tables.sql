-- 1. Secure 'exhibitions' table
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;

-- Public can view exhibitions
CREATE POLICY "Public Exhibitions View" 
ON exhibitions FOR SELECT 
TO public 
USING (true);

-- Only Admins can manage exhibitions
CREATE POLICY "Admin Exhibitions Manage" 
ON exhibitions FOR ALL 
TO authenticated 
USING ( EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin' ) )
WITH CHECK ( EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin' ) );


-- 2. Secure 'subscribers' table
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Only Admins can view subscribers (Privacy!)
CREATE POLICY "Admin View Subscribers" 
ON subscribers FOR SELECT 
TO authenticated 
USING ( EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin' ) );

-- Only Admins can delete subscribers
CREATE POLICY "Admin Manage Subscribers" 
ON subscribers FOR DELETE 
TO authenticated 
USING ( EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin' ) );

-- Public can INSERT (Subscribe) but NOT view
CREATE POLICY "Public Subscribe" 
ON subscribers FOR INSERT 
TO public 
WITH CHECK (true);


-- 3. Secure 'site_config' table (if it exists)
-- We wrap in a DO block to avoid errors if the table doesn't exist yet, 
-- but ideally you run this if you have the table.
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_config') THEN
    
    EXECUTE 'ALTER TABLE site_config ENABLE ROW LEVEL SECURITY';
    
    -- Public can view config
    EXECUTE 'CREATE POLICY "Public Config View" ON site_config FOR SELECT TO public USING (true)';
    
    -- Only Admins can update config
    EXECUTE 'CREATE POLICY "Admin Config Manage" ON site_config FOR ALL TO authenticated USING ( EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = ''admin'' ) ) WITH CHECK ( EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = ''admin'' ) )';
    
  END IF;
END $$;
