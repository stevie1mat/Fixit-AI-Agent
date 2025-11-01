# Diagnosing DELETE Connection Issue

## Current Status
- DELETE endpoint is being called
- Connection ID: `174dfad6-f684-4548-90e3-b22702b58ef7`
- Error: "No connection deleted - connection may not exist or RLS blocked"

## Root Cause Analysis

The most likely issues are:

### 1. Service Role Key Not Set in Vercel
**Problem**: If `SUPABASE_SERVICE_ROLE_KEY` is not set, the backend uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`, which is subject to RLS policies.

**Solution**: 
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `SUPABASE_SERVICE_ROLE_KEY` with your service role key from Supabase
3. Get service role key: Supabase Dashboard → Settings → API → `service_role` key (secret)

### 2. RLS Policies Blocking DELETE
**Problem**: Even with service role key, if RLS policies are misconfigured, deletes can fail.

**Solution**: Run this SQL in Supabase:
```sql
-- Drop all DELETE policies
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

-- Create policy for service_role
CREATE POLICY "Service role can delete any connection" 
ON public.store_connections
FOR DELETE 
TO service_role
USING (true);
```

### 3. Connection Doesn't Exist
**Problem**: The connection ID might not exist in the database.

**Solution**: Run this SQL to check:
```sql
SELECT id, user_id, type, url 
FROM public.store_connections 
WHERE id = '174dfad6-f684-4548-90e3-b22702b58ef7';
```

## Immediate Fix Steps

1. **Check Vercel Environment Variables**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` exists
   - If not, add it and redeploy

2. **Run RLS Fix SQL**
   - Use the `fix_rls_complete.sql` file
   - This creates proper DELETE policies

3. **Check Vercel Logs**
   - Look for log: "Supabase client using: SERVICE_ROLE_KEY" or "ANON_KEY"
   - This tells you which key is active

4. **Test Manual Delete in SQL**
   ```sql
   DELETE FROM public.store_connections 
   WHERE id = '174dfad6-f684-4548-90e3-b22702b58ef7';
   ```
   - If this works, the issue is RLS/service role key
   - If this fails, there's a different database issue

## After Fixing

1. Redeploy Vercel app (to pick up new env vars)
2. Try deleting again
3. Check logs to confirm which key is used

