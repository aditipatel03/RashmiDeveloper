ALTER TABLE properties ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- If you have a profiles table and want to reference that instead
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);
