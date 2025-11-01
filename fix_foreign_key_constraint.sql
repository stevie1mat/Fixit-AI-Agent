-- Fix foreign key constraint for store_connections table
-- The issue: user_id should reference auth.users, not public.users

-- Step 1: Drop the existing foreign key constraint (if it exists)
ALTER TABLE public.store_connections
DROP CONSTRAINT IF EXISTS store_connections_user_id_fkey;

-- Step 2: Check if constraint exists with different name
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.store_connections'::regclass
      AND contype = 'f'
      AND confrelid = 'public.users'::regclass;
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.store_connections DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END IF;
END $$;

-- Step 3: Add new foreign key constraint pointing to auth.users
ALTER TABLE public.store_connections
ADD CONSTRAINT store_connections_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Verify the constraint was created
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'store_connections';

-- Alternative: If you want to keep public.users table for extended user data
-- Option 2: Create the user in public.users if they don't exist
-- Uncomment this if you prefer to maintain a public.users table:

/*
-- Create trigger to auto-create user in public.users when they sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Then update existing users
INSERT INTO public.users (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
*/

