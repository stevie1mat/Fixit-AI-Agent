-- Test what the GET endpoint should return
-- This queries what the backend GET /api/store-connections should return

SELECT 
  id,
  user_id,
  type,
  url,
  username,
  app_password,
  is_connected,
  created_at
FROM public.store_connections
WHERE user_id = '9435b1d0-fb92-4392-81b7-6008ef75a239'
  AND is_connected = true
ORDER BY created_at DESC;

-- Compare with what you're seeing in the app
-- The IDs here should match what the app is trying to delete

