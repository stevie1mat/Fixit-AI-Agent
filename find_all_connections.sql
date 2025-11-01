-- Find all connections that actually exist
-- Use this to see what's really in the database

-- List all connections
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

-- Count by type
SELECT 
  type,
  COUNT(*) as total,
  COUNT(CASE WHEN is_connected = true THEN 1 END) as active
FROM public.store_connections
GROUP BY type;

-- List by user_id (replace with your actual user_id if needed)
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

