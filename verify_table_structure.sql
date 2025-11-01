-- Verify the store_connections table structure
-- Run this in Supabase SQL Editor to check if all columns exist

-- Check if table exists and see all columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'store_connections'
ORDER BY ordinal_position;

-- Check if username and app_password columns exist
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'store_connections' 
      AND column_name = 'username'
  ) THEN '✅ username column exists' ELSE '❌ username column MISSING' END as username_check,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'store_connections' 
      AND column_name = 'app_password'
  ) THEN '✅ app_password column exists' ELSE '❌ app_password column MISSING' END as app_password_check;

