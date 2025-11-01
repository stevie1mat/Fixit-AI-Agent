-- Diagnose why DELETE returns 0 rows even with service role key
-- Run this for connection ID: 0865f339-e360-44ad-b661-89f569206f1a

-- Step 1: Check if connection exists
SELECT 
  id,
  user_id,
  type,
  url,
  username,
  is_connected,
  created_at
FROM public.store_connections
WHERE id = '0865f339-e360-44ad-b661-89f569206f1a';

-- Step 2: Check RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'store_connections';

-- Step 3: Check all DELETE policies
SELECT 
  policyname,
  cmd as command,
  roles,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'store_connections' 
  AND cmd = 'DELETE'
ORDER BY policyname;

-- Step 4: Test manual delete with service role context
-- Note: In Supabase SQL Editor, you're running as postgres (superuser)
-- This should work regardless of RLS
DELETE FROM public.store_connections 
WHERE id = '0865f339-e360-44ad-b661-89f569206f1a'
RETURNING id, type, url;

-- Step 5: Verify it was deleted
SELECT COUNT(*) as remaining
FROM public.store_connections
WHERE id = '0865f339-e360-44ad-b661-89f569206f1a';

-- Step 6: Check for foreign key constraints that might prevent delete
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'store_connections'
  AND tc.constraint_type = 'FOREIGN KEY';

