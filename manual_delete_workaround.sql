-- Manual DELETE workaround
-- Use this if the API delete still doesn't work

-- Step 1: Check if the connection exists
SELECT id, user_id, type, url, username, is_connected, created_at
FROM public.store_connections
WHERE id = '5b4ca314-90e0-4c8e-83b8-a15bcec5dcb3';

-- Step 2: If it exists, delete it manually
DELETE FROM public.store_connections 
WHERE id = '5b4ca314-90e0-4c8e-83b8-a15bcec5dcb3';

-- Step 3: Verify it was deleted
SELECT COUNT(*) as remaining
FROM public.store_connections
WHERE id = '5b4ca314-90e0-4c8e-83b8-a15bcec5dcb3';
-- Should return 0

-- Step 4: List all remaining connections
SELECT id, user_id, type, url, created_at
FROM public.store_connections
ORDER BY created_at DESC;

