-- 1. Add 'role' column to user_profiles if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. Set the specified user as 'admin'
-- ⚠️ REPLACE 'INSERT_YOUR_EMAIL_HERE' WITH YOUR ACTUAL EMAIL ADDRESS ⚠️
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'INSERT_YOUR_EMAIL_HERE';

-- 3. Drop existing permissive policies
DROP POLICY IF EXISTS "Admin Artworks Manage" ON artworks;
DROP POLICY IF EXISTS "Public Artworks View" ON artworks;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- 4. Create STRICT policies for 'artworks'

-- Everyone can view artworks (Public access)
CREATE POLICY "Public Artworks View"
ON artworks FOR SELECT
TO public
USING (true);

-- Only Admins can insert/update/delete artworks
CREATE POLICY "Admin Artworks Manage"
ON artworks FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- 5. Create STRICT policies for 'user_profiles'

-- Admins can view all profiles
CREATE POLICY "Admin View Profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id -- Users can view their own profile
  OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Only Admins can update/delete profiles
CREATE POLICY "Admin Manage Profiles"
ON user_profiles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);
