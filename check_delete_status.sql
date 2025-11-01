-- Comprehensive SQL checks for DELETE functionality
-- Run these queries to diagnose delete issues

-- ============================================
-- 1. CHECK ALL CONNECTIONS
-- ============================================
SELECT 
  id,
  user_id,
  type,
  url,
  username,
  is_connected,
  created_at,
  updated_at
FROM public.store_connections
ORDER BY created_at DESC;

-- ============================================
-- 2. CHECK SPECIFIC CONNECTION BY ID
-- ============================================
-- Replace with your connection ID
SELECT 
  id,
  user_id,
  type,
  url,
  username,
  is_connected,
  created_at
FROM public.store_connections
WHERE id = '5b4ca314-90e0-4c8e-83b8-a15bcec5dcb3';
-- Or use: WHERE id = '174dfad6-f684-4548-90e3-b22702b58ef7';

-- ============================================
-- 3. COUNT CONNECTIONS BY TYPE
-- ============================================
SELECT 
  type,
  COUNT(*) as count,
  COUNT(CASE WHEN is_connected = true THEN 1 END) as active_count
FROM public.store_connections
GROUP BY type;

-- ============================================
-- 4. CHECK DELETE POLICIES
-- ============================================
SELECT 
  policyname,
  cmd as command,
  roles,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'store_connections' 
  AND cmd = 'DELETE'
ORDER BY policyname;

-- ============================================
-- 5. CHECK RLS STATUS
-- ============================================
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'store_connections';

-- ============================================
-- 6. CHECK ALL POLICIES (SELECT, INSERT, UPDATE, DELETE)
-- ============================================
SELECT 
  policyname,
  cmd as command,
  roles,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'store_connections'
ORDER BY cmd, policyname;

-- ============================================
-- 7. TEST MANUAL DELETE (UNCOMMENT TO USE)
-- ============================================
-- WARNING: This will actually delete the connection!
-- First run query #2 to verify the ID exists
-- Then uncomment and run:

/*
DELETE FROM public.store_connections 
WHERE id = '5b4ca314-90e0-4c8e-83b8-a15bcec5dcb3';

-- Verify it was deleted
SELECT COUNT(*) as remaining
FROM public.store_connections
WHERE id = '5b4ca314-90e0-4c8e-83b8-a15bcec5dcb3';
-- Should return 0
*/

-- ============================================
-- 8. FIND CONNECTIONS BY USER
-- ============================================
-- Replace with your user_id
SELECT 
  id,
  type,
  url,
  username,
  is_connected,
  created_at
FROM public.store_connections
WHERE user_id = '9435b1d0-fb92-4392-81b7-6008ef75a239'
ORDER BY created_at DESC;

-- ============================================
-- 9. CHECK FOREIGN KEY CONSTRAINT
-- ============================================
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
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'store_connections';

-- ============================================
-- 10. LIST ALL CONNECTIONS WITH DETAILS
-- ============================================
SELECT 
  sc.id,
  sc.user_id,
  sc.type,
  sc.url,
  CASE 
    WHEN sc.username IS NOT NULL THEN '✅ Set'
    ELSE '❌ Missing'
  END as username_status,
  CASE 
    WHEN sc.app_password IS NOT NULL THEN '✅ Set'
    ELSE '❌ Missing'
  END as app_password_status,
  sc.is_connected,
  sc.created_at
FROM public.store_connections sc
ORDER BY sc.created_at DESC;

