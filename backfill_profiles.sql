-- Backfill user_profiles for existing users
-- This fixes the 406 error by ensuring every auth user has a corresponding profile row.

INSERT INTO public.user_profiles (id, email)
SELECT id, email 
FROM auth.users
ON CONFLICT (id) DO NOTHING;
