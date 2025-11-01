-- Check if RLS policies allow DELETE operations
-- Run this to diagnose why connections aren't being deleted

-- 1. Check current RLS policies for store_connections
SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'store_connections';

-- 2. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'store_connections';

-- 3. Test if you can delete (replace with actual connection ID)
-- This will show if RLS is blocking the delete
/*
SELECT 
  id,
  user_id,
  type,
  url
FROM public.store_connections
WHERE id = 'YOUR_CONNECTION_ID_HERE';
*/

-- 4. If RLS is blocking deletes, create/update DELETE policy
-- Uncomment and run if needed:

/*
-- Drop existing DELETE policy if it exists
DROP POLICY IF EXISTS "Allow authenticated users to delete own connections" ON public.store_connections;

-- Create DELETE policy
CREATE POLICY "Allow authenticated users to delete own connections" 
ON public.store_connections
FOR DELETE 
TO authenticated
USING (
  auth.uid()::text = user_id::text
);

-- Or if using service role key in backend, allow all deletes:
CREATE POLICY "Service role can delete connections" 
ON public.store_connections
FOR DELETE 
TO service_role
USING (true);
*/

