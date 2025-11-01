# Testing Messages API

## 🧪 Quick Test Methods

### 1. Test via Mobile App (Recommended)

1. **Open your mobile app**
2. **Make sure you're logged in** (check Settings screen shows your email)
3. **Go to Chat screen**
4. **Send a test message** like "Hello"
5. **Check console logs** - you should see:
   ```
   LOG  Attempting to save messages with userId: [your-user-id]
   LOG  Saving messages to backend: {"userId": "...", "messageCount": 1}
   LOG  Messages saved successfully
   ```
6. **Send another message** - the count should increment
7. **Close and reopen the app** - messages should persist and load

### 2. Test API Directly (curl)

#### Test GET (Fetch Messages)
```bash
# Replace USER_ID with your actual user ID from the mobile app
curl "https://fixit-ai-agent.vercel.app/api/messages?userId=YOUR_USER_ID" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Response...",
      "timestamp": "2024-01-01T00:00:01.000Z"
    }
  ]
}
```

#### Test POST (Save Messages)
```bash
curl -X POST "https://fixit-ai-agent.vercel.app/api/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "messages": [
      {
        "role": "user",
        "content": "Test message",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "messageCount": 1
}
```

### 3. Check Vercel Logs

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `fixit-ai-agent` project
3. Click **"Deployments"** tab
4. Click on the latest deployment
5. Click **"Functions"** tab
6. Find `/api/messages`
7. Click **"View Function Logs"**
8. Look for logs when you send messages:
   ```
   POST /api/messages - Raw request: {
     body: { userId: '...', messages: [...] },
     bodyType: 'object',
     bodyKeys: ['userId', 'messages']
   }
   ```

### 4. Verify Database (Supabase)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **"Table Editor"**
4. Find the `AIContextWindow` table
5. Check for rows with your `userId`
6. Click on a row to see the `recentMessages` JSON

## ✅ Success Indicators

- ✅ Mobile app shows "Messages saved successfully" in logs
- ✅ No "User ID is required" errors
- ✅ Messages persist after app restart
- ✅ API returns `{"success": true}` for POST requests
- ✅ API returns messages array for GET requests
- ✅ Database shows messages in `AIContextWindow.recentMessages`

## ❌ Troubleshooting

### Error: "User ID is required"
- Check that user is logged in (Settings screen)
- Verify `user?.id` exists in ChatContext logs
- Make sure backend is redeployed

### Error: "Failed to fetch messages: 500"
- Check if `AIContextWindow` table exists in Supabase
- Run the SQL script: `supabase_aicontextwindow_setup.sql`
- Check Supabase connection in Vercel environment variables

### Messages not persisting
- Check AsyncStorage is working (local storage)
- Verify backend POST is returning success
- Check Supabase table has data
- Clear app data and try again

### Empty messages after restart
- Check GET endpoint is working
- Verify userId matches between save and fetch
- Check Supabase table for your userId

## 🔍 Debug Commands

### Get your User ID from Mobile App
1. Open app → Settings
2. Your email is displayed (user object)
3. Check console logs for `user.id` value

### Test with Postman/Insomnia
Import this collection:
- **GET**: `https://fixit-ai-agent.vercel.app/api/messages?userId=YOUR_ID`
- **POST**: `https://fixit-ai-agent.vercel.app/api/messages`
  - Body: `{"userId": "YOUR_ID", "messages": [...]}`



