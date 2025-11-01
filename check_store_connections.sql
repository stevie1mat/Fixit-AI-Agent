-- Query to check your WordPress connections in Supabase

-- 1. View all connections (replace 'YOUR_USER_ID' with your actual user ID)
SELECT 
  id,
  user_id,
  type,
  url,
  username,
  app_password,
  access_token,
  is_connected,
  created_at,
  updated_at
FROM public.store_connections
WHERE type = 'wordpress'
ORDER BY created_at DESC;

-- 2. Check if your connection has username and app_password
SELECT 
  id,
  user_id,
  url,
  CASE WHEN username IS NULL THEN '❌ MISSING' ELSE '✅ Present' END as username_status,
  CASE WHEN app_password IS NULL THEN '❌ MISSING' ELSE '✅ Present' END as app_password_status,
  created_at
FROM public.store_connections
WHERE type = 'wordpress'
ORDER BY created_at DESC;

-- 3. Find connections missing WordPress credentials
SELECT 
  id,
  user_id,
  url,
  username,
  app_password,
  is_connected
FROM public.store_connections
WHERE type = 'wordpress' 
  AND (username IS NULL OR app_password IS NULL);

-- 4. Delete old connections missing credentials (be careful - this deletes data!)
-- Uncomment only if you want to delete connections without credentials:
-- DELETE FROM public.store_connections
-- WHERE type = 'wordpress' 
--   AND (username IS NULL OR app_password IS NULL);

