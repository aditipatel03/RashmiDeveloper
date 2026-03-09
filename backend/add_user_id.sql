-- Corrected Migration: Reference profiles instead of auth.users for metadata joining
ALTER TABLE properties DROP COLUMN IF EXISTS user_id;
ALTER TABLE properties ADD COLUMN user_id UUID REFERENCES public.profiles(id);

-- Instructions:
-- 1. Open Supabase SQL Editor.
-- 2. Run this script to ensure user_id correctly links to the profiles table.
