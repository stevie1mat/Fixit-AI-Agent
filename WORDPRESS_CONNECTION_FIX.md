# WordPress Connection Fix Guide

## Problem
WordPress connections work locally but not on Vercel. The chat API can't retrieve WordPress credentials from the database.

## Root Cause
1. **Database Schema Issue**: The `store_connections` table in Supabase was missing `username` and `app_password` columns
2. **Settings Page Bug**: The settings page wasn't sending `username` when saving WordPress connections

## Solution Steps

### Step 1: Run Database Migration on Supabase

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Add username and app_password columns for WordPress
ALTER TABLE public.store_connections 
ADD COLUMN IF NOT EXISTS username TEXT;

ALTER TABLE public.store_connections 
ADD COLUMN IF NOT EXISTS app_password TEXT;

-- Make access_token nullable (WordPress doesn't use it)
ALTER TABLE public.store_connections 
ALTER COLUMN access_token DROP NOT NULL;
```

6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Verify success - you should see "Success. No rows returned"

### Step 2: Reconnect Your WordPress Site

**IMPORTANT**: You must reconnect your WordPress site after running the migration because:
- Old connections don't have `username` and `app_password` stored
- The new code needs these fields to work

1. Go to your app: Settings → Connections
2. Find your WordPress connection
3. **Disconnect** the existing connection (if there's a delete/remove button)
4. **Reconnect** with:
   - WordPress URL
   - Username
   - Application Password

5. Click **Test Connection** to verify it works

### Step 3: Verify the Fix

1. Try asking in chat: "How many posts do I have?"
2. The AI should now be able to:
   - Find your WordPress connection
   - Retrieve username and app_password from database
   - Connect to WordPress
   - Get the post count

### Step 4: Check Vercel Logs (if still not working)

1. Go to Vercel dashboard
2. Your project → **Functions** → `/api/chat`
3. Check recent function logs
4. Look for:
   - `🔑 WordPress credentials check:` - Shows if credentials are found
   - `WordPress connection details:` - Shows connection data
   - Any error messages about missing credentials

## What Was Fixed

### Code Changes:
1. ✅ `src/app/settings/page.tsx` - Now sends `username` and `appPassword` when saving WordPress connections
2. ✅ `src/pages/api/chat.ts` - Better error messages and logging for missing credentials
3. ✅ `src/lib/supabase.ts` - Updated TypeScript types to include `username` and `app_password`

### Database Changes:
- Added `username TEXT` column
- Added `app_password TEXT` column  
- Made `access_token` nullable (WordPress doesn't use it)

## Troubleshooting

### Error: "WordPress credentials incomplete"
- **Cause**: Your existing connection doesn't have username/app_password stored
- **Fix**: Disconnect and reconnect your WordPress site (Step 2)

### Error: "No WordPress connection found"
- **Cause**: No connection exists in database for your user
- **Fix**: Go to Settings and create a new WordPress connection

### Error: Database column doesn't exist
- **Cause**: Migration hasn't been run yet
- **Fix**: Run Step 1 migration SQL

### Works locally but not on Vercel
- **Cause**: Migration was run locally but not on production Supabase
- **Fix**: Run the migration on your production Supabase database (Step 1)

## Testing

After completing all steps, test these commands:
- "How many posts do I have?"
- "List all my posts"
- "How many pages do I have?"
- "Show me my WordPress site info"

All should now work correctly! 🎉

