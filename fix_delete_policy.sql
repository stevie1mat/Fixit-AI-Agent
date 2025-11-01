-- Fix DELETE policy for store_connections table
-- This ensures connections can be deleted properly

-- Step 1: Check if DELETE policy exists
SELECT 
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'store_connections' 
  AND cmd = 'DELETE';

-- Step 2: Drop existing DELETE policy if it exists (in case it's incorrect)
DROP POLICY IF EXISTS "Users can delete own connections" ON public.store_connections;
DROP POLICY IF EXISTS "Allow authenticated users to delete own connections" ON public.store_connections;
DROP POLICY IF EXISTS "Service role can delete connections" ON public.store_connections;

-- Step 3: Create DELETE policy that works with service role key
-- The backend uses service role key, so we need a policy that allows deletes
-- Option A: Allow service role to delete (recommended for backend operations)
CREATE POLICY "Service role can delete connections" 
ON public.store_connections
FOR DELETE 
TO service_role
USING (true);

-- Option B: Also allow authenticated users to delete their own connections
-- (Uncomment if you want users to delete directly via frontend)
/*
CREATE POLICY "Users can delete own connections" 
ON public.store_connections
FOR DELETE 
TO authenticated
USING (
  auth.uid()::text = user_id::text OR
  auth.uid() = user_id::uuid
);
*/

-- Step 4: Verify the policy was created
SELECT 
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'store_connections' 
  AND cmd = 'DELETE';

