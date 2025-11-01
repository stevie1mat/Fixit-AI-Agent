# Fix Status Summary - WordPress Connection & Delete Issues

## ✅ Issues Fixed

### 1. WordPress Connection Storage
- **Problem**: Settings page wasn't sending `username` and `appPassword` when saving WordPress connections
- **Fix**: Updated `src/app/settings/page.tsx` to send both fields
- **Status**: ✅ Fixed

### 2. Database Schema
- **Problem**: `store_connections` table missing `username` and `app_password` columns
- **Fix**: Created migration SQL (`supabase_store_connections_update.sql`)
- **Status**: ✅ Applied (columns exist)

### 3. Foreign Key Constraint
- **Problem**: Foreign key pointing to `public.users` instead of `auth.users`
- **Fix**: Created SQL to update constraint (`fix_foreign_key_constraint.sql`)
- **Status**: ⚠️ May need to run if connections still fail to save

### 4. DELETE Functionality
- **Problem**: Connections couldn't be deleted - RLS blocking
- **Fixes Applied**:
  - ✅ Created DELETE policies for `service_role` and `authenticated` users
  - ✅ Updated DELETE endpoint to use dedicated service role client
  - ✅ Added logging to identify which client is used
- **Status**: ⚠️ **Awaiting Redeploy**

## 🔄 Current Status

### Environment Variables (Vercel)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Set (added 48m ago)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Set
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Set
- ✅ `GEMINI_API_KEY` - Set

### Database (Supabase)
- ✅ `store_connections` table exists
- ✅ `username` column exists
- ✅ `app_password` column exists
- ✅ DELETE policies exist:
  - "Service role can delete any connection" (service_role)
  - "Users can delete own connections" (authenticated)

### Code Changes
- ✅ `src/app/settings/page.tsx` - Fixed to send username/appPassword
- ✅ `src/pages/api/store-connections.ts` - Updated DELETE to use service role client
- ✅ `src/lib/supabase.ts` - Types updated for new columns

## ⏳ Action Required

### **CRITICAL: Redeploy Vercel**
The updated DELETE code must be deployed for the service role key to work.

**How to Redeploy:**
1. Push code to GitHub (if auto-deploy enabled)
2. OR: Vercel Dashboard → Deployments → Redeploy

### After Redeploy
1. Try deleting a connection from app
2. Check Vercel logs for: `✅ Using SERVICE_ROLE_KEY client for delete`
3. If still failing, check logs for error details

## 🧪 Test Steps

### 1. Test WordPress Connection Save
- Go to Settings → Connections
- Add WordPress connection with username/app password
- Check Supabase table - should show username and app_password populated

### 2. Test DELETE
- Try deleting a connection from app
- Check Vercel logs:
  - Should see: `✅ Using SERVICE_ROLE_KEY client`
  - Should see: `Successfully deleted connection`
- If fails, check error message

### 3. Manual SQL Test (if needed)
```sql
-- Check connections
SELECT id, user_id, type, url FROM store_connections;

-- Test manual delete
DELETE FROM store_connections WHERE id = 'your-id-here';
```

## 📋 Files Created

1. `supabase_store_connections_update.sql` - Add username/app_password columns
2. `fix_foreign_key_constraint.sql` - Fix FK to auth.users
3. `fix_rls_complete.sql` - Create DELETE policies
4. `check_delete_status.sql` - Diagnostic queries
5. `manual_delete_workaround.sql` - Manual delete SQL
6. `DELETE_FIX_CHECKLIST.md` - Step-by-step guide
7. `WORDPRESS_CONNECTION_FIX.md` - WordPress fix guide

## 🎯 Expected Outcome After Redeploy

When you delete a connection:
1. ✅ Log: "Attempting to delete connection: [id]"
2. ✅ Log: "✅ Using SERVICE_ROLE_KEY client for delete (bypasses RLS)"
3. ✅ Log: "Successfully deleted connection: [id] Rows deleted: 1"
4. ✅ Connection removed from Supabase table
5. ✅ Success response to app

## ❓ If Still Not Working

Check Vercel logs for:
- Which Supabase key is being used
- Any error codes or messages
- Whether the connection ID exists

Then we can troubleshoot further based on the logs.

