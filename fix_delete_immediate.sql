-- Immediate fix for DELETE not working
-- Run this to enable DELETE operations

-- Step 1: Check current DELETE policies
SELECT 
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'store_connections' 
  AND cmd = 'DELETE';

-- Step 2: Drop ALL existing DELETE policies
DROP POLICY IF EXISTS "Users can delete own connections" ON public.store_connections;
DROP POLICY IF EXISTS "Allow authenticated users to delete own connections" ON public.store_connections;
DROP POLICY IF EXISTS "Service role can delete connections" ON public.store_connections;
DROP POLICY IF EXISTS "Allow service role to delete" ON public.store_connections;

-- Step 3: Create a policy that allows DELETE for service_role (backend operations)
-- This is what the backend API uses
CREATE POLICY "Service role can delete connections" 
ON public.store_connections
FOR DELETE 
TO service_role
USING (true);

-- Step 4: Also allow authenticated users to delete (for frontend direct access)
CREATE POLICY "Users can delete own connections" 
ON public.store_connections
FOR DELETE 
TO authenticated
USING (
  -- Handle both text and uuid comparison
  (auth.uid()::text = user_id::text) OR 
  (auth.uid() = user_id::uuid)
);

-- Step 5: Verify policies were created
SELECT 
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'store_connections' 
  AND cmd = 'DELETE';

-- Step 6: Test delete manually (replace with actual connection ID)
-- DELETE FROM public.store_connections WHERE id = 'YOUR_CONNECTION_ID_HERE';

