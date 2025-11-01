-- Migration: Add username and app_password columns to store_connections table
-- This is required for WordPress connections to work properly

-- Add username column (nullable, for WordPress connections)
ALTER TABLE public.store_connections 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Add app_password column (nullable, for WordPress connections)
ALTER TABLE public.store_connections 
ADD COLUMN IF NOT EXISTS app_password TEXT;

-- Make access_token nullable (since WordPress doesn't use it)
-- Note: This might fail if you have constraints, but WordPress connections don't need access_token
ALTER TABLE public.store_connections 
ALTER COLUMN access_token DROP NOT NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN public.store_connections.username IS 'WordPress username (required for WordPress connections)';
COMMENT ON COLUMN public.store_connections.app_password IS 'WordPress application password (required for WordPress connections)';
COMMENT ON COLUMN public.store_connections.access_token IS 'Shopify access token (required for Shopify connections)';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'store_connections'
ORDER BY ordinal_position;

