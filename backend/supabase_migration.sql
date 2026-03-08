-- Migration to support multiple images per property
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS thumbnail_index INTEGER DEFAULT 0;
