-- Check RLS policies for store_connections table
-- Run this if connections still aren't saving

-- 1. Check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'store_connections';

-- 2. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'store_connections';

-- 3. If needed, create policy to allow authenticated users to insert their own connections
-- Uncomment and run if you see RLS is enabled but no INSERT policy exists:

/*
CREATE POLICY "Allow authenticated users to insert own connections" 
ON public.store_connections
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid()::text = user_id::text
);

CREATE POLICY "Allow authenticated users to view own connections" 
ON public.store_connections
FOR SELECT 
TO authenticated
USING (
  auth.uid()::text = user_id::text
);
*/

