-- Add collection column to artworks table
alter table artworks 
add column if not exists collection text;
