-- Add layout settings columns to site_config
ALTER TABLE site_config 
ADD COLUMN IF NOT EXISTS header_settings jsonb DEFAULT '{"title": "Dave Madigan"}'::jsonb,
ADD COLUMN IF NOT EXISTS footer_settings jsonb DEFAULT '{"email": "", "instagram_url": "", "copyright_text": "© 2024 Dave Madigan", "show_subscribe": true}'::jsonb;
