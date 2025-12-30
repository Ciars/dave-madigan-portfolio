-- Add About section content to site_content table
-- We use JSONB to store arrays of paragraphs (bio) and strings (collections)

ALTER TABLE site_content 
ADD COLUMN IF NOT EXISTS about_bio jsonb DEFAULT '["Following a career in manufacturing, Dave Madigan (b. Dublin, Ireland) retrained as a visual artist.", "A regular exhibitor in the Royal Hibernian and Royal Ulster academies, Dave''s work is noted for his surreal painted depictions of modern day technological artefacts.", "Most recently, Dave has moved toward studies of environmental subject matter."]'::jsonb,
ADD COLUMN IF NOT EXISTS about_collections jsonb DEFAULT '["Office of Public Works", "DCU Business School", "The Arts Council of Northern Ireland", "Dún Laoghaire-Rathdown County Council", "Royal College of Physicians, Ireland"]'::jsonb;
