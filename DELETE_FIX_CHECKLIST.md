# DELETE Connection Fix Checklist

## ✅ Completed
- [x] `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (verified)
- [x] DELETE policies are created correctly
- [x] Code updated to use service role client for DELETE

## 🔄 Next Steps

### 1. Redeploy Vercel App
**IMPORTANT**: The updated code needs to be deployed to Vercel.

**Option A: Automatic (if connected to Git)**
- Push your latest code to GitHub
- Vercel will auto-deploy

**Option B: Manual Redeploy**
1. Go to Vercel Dashboard → Your Project
2. Click "Deployments" tab
3. Find the latest deployment
4. Click the three dots menu → "Redeploy"

### 2. After Redeploy - Test Delete
1. Try deleting a connection from your app
2. Check Vercel logs immediately after

### 3. Check Vercel Function Logs
Go to: Vercel Dashboard → Your Project → Functions → `/api/store-connections`

Look for these log messages:
- ✅ **"✅ Using SERVICE_ROLE_KEY client for delete (bypasses RLS)"** 
  - This means the service role key was found and is being used
  
- ⚠️ **"⚠️ SERVICE_ROLE_KEY not found, using default client"**
  - This means the env var isn't being picked up (needs redeploy)

### 4. Expected Behavior After Fix

**Success logs:**
```
Attempting to delete connection: [id]
✅ Using SERVICE_ROLE_KEY client for delete (bypasses RLS)
Successfully deleted connection: [id] Rows deleted: 1
```

**If still failing:**
- Check the exact error message in logs
- Verify the connection ID exists in Supabase
- Try manual delete SQL as workaround

### 5. Manual Delete (Temporary Workaround)

If delete still doesn't work via API, use this SQL in Supabase:

```sql
-- Delete connection manually
DELETE FROM public.store_connections 
WHERE id = 'YOUR_CONNECTION_ID_HERE';

-- Verify it's gone
SELECT COUNT(*) FROM public.store_connections 
WHERE id = 'YOUR_CONNECTION_ID_HERE';
```

## Troubleshooting

### Issue: "SERVICE_ROLE_KEY not found" in logs
**Solution**: 
- Verify env var is set: Vercel → Settings → Environment Variables
- Make sure it's set for "All Environments" or your specific environment
- Redeploy after adding/changing env vars

### Issue: "No connection deleted" 
**Possible causes:**
1. Connection doesn't exist with that ID
2. Service role key is wrong/expired
3. Code hasn't been redeployed yet

**Check:**
- Run SQL: `SELECT * FROM store_connections WHERE id = 'your-id';`
- Check Vercel logs for which client is being used
- Verify service role key is correct in Supabase

