-- Add email and subject columns to appointments table
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS subject TEXT;
