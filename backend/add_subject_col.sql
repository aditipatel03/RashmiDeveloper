-- Add subject column to appointments table
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS subject TEXT;
