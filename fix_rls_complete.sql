-- Complete RLS fix for store_connections DELETE operations
-- This ensures the backend can delete connections

-- Step 1: Check current RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'store_connections';

-- Step 2: Check ALL existing policies
SELECT 
  policyname,
  cmd as command,
  roles,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'store_connections';

-- Step 3: Drop ALL existing DELETE policies (to start fresh)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'store_connections' 
        AND cmd = 'DELETE'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.store_connections', r.policyname);
    END LOOP;
END $$;

-- Step 4: Create comprehensive DELETE policy for service_role
-- Service role key bypasses RLS, but having a policy helps
-- Note: DELETE policies only use USING, not WITH CHECK
CREATE POLICY "Service role can delete any connection" 
ON public.store_connections
FOR DELETE 
TO service_role
USING (true);

-- Step 5: Create DELETE policy for authenticated users (their own connections)
CREATE POLICY "Users can delete own connections" 
ON public.store_connections
FOR DELETE 
TO authenticated
USING (
  -- Match user_id with auth.uid() - handle both text and uuid
  (auth.uid()::text = user_id::text) OR 
  (auth.uid() = user_id::uuid)
);

-- Step 6: If RLS is blocking, temporarily allow all deletes (for testing)
-- UNCOMMENT ONLY IF NEEDED FOR TESTING:
/*
CREATE POLICY "Temporary allow all deletes" 
ON public.store_connections
FOR DELETE 
TO authenticated
USING (true);
*/

-- Step 7: Verify policies were created
SELECT 
  policyname,
  cmd as command,
  roles,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'store_connections' 
  AND cmd = 'DELETE'
ORDER BY policyname;

-- Step 8: Test manual delete (replace with actual connection ID)
-- DELETE FROM public.store_connections WHERE id = '174dfad6-f684-4548-90e3-b22702b58ef7';

-- IMPORTANT: Verify your backend is using service_role key
-- Check Vercel environment variable: SUPABASE_SERVICE_ROLE_KEY

