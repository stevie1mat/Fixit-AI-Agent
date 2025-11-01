import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

// Disable default body parser to handle raw body if needed
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // GET: userId comes from query string
      const { userId } = req.query

      console.log('🔷 GET /api/messages - Request:', { 
        userId, 
        userIdType: typeof userId,
        query: req.query 
      })

      if (!userId || typeof userId !== 'string') {
        console.error('🔷 GET /api/messages - Missing userId')
        return res.status(400).json({ error: 'User ID is required' })
      }
      
      // Get messages from Supabase (works on Vercel)
      try {
        console.log('🔷 GET /api/messages - Querying Supabase AIContextWindow for userId:', userId)
        
        // First check if ANY rows exist for this user
        const { data: allUserData } = await supabase
          .from('AIContextWindow')
          .select('*')
          .eq('userId', userId)
        
        console.log('🔷 GET /api/messages - All rows for userId:', {
          count: allUserData?.length || 0,
          data: allUserData
        })
        
        const { data: contextData, error } = await supabase
          .from('AIContextWindow')
          .select('recentMessages, userId, updatedAt')
          .eq('userId', userId)
          .maybeSingle()

        console.log('🔷 GET /api/messages - Supabase response:', {
          hasData: !!contextData,
          contextData: contextData,
          hasRecentMessages: !!contextData?.recentMessages,
          recentMessagesType: typeof contextData?.recentMessages,
          recentMessagesValue: contextData?.recentMessages,
          error: error ? {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          } : null
        })

        if (error) {
          console.error('🔷 GET /api/messages - Error fetching messages:', error)
          // If table doesn't exist, return empty array instead of error
          if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
            console.log('🔷 GET /api/messages - Table does not exist, returning empty array')
            return res.status(200).json({ messages: [] })
          }
          return res.status(500).json({ 
            error: 'Failed to fetch messages',
            details: error.message || 'Unknown error',
            code: error.code
          })
        }

        if (contextData && contextData.recentMessages) {
          try {
            const messages = JSON.parse(contextData.recentMessages)
            console.log('🔷 GET /api/messages - Returning messages:', messages.length)
            return res.status(200).json({ messages })
          } catch (parseError) {
            console.error('🔷 GET /api/messages - Error parsing recentMessages:', parseError)
            return res.status(200).json({ messages: [] })
          }
        }

        console.log('🔷 GET /api/messages - No messages found, returning empty array')
        return res.status(200).json({ messages: [] })
      } catch (error) {
        console.error('Error in GET /api/messages:', error)
        return res.status(500).json({ 
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    if (req.method === 'POST') {
      // Save messages to Supabase (works on Vercel)
      // Log the raw request to debug
      console.log('POST /api/messages - Raw request:', {
        body: req.body,
        bodyType: typeof req.body,
        bodyKeys: req.body ? Object.keys(req.body) : 'no body',
        contentType: req.headers['content-type'],
      })
      
      // Handle case where body might be a string (shouldn't happen with bodyParser, but just in case)
      let requestBody = req.body
      if (typeof req.body === 'string') {
        try {
          requestBody = JSON.parse(req.body)
        } catch (e) {
          console.error('Failed to parse request body as JSON:', e)
          return res.status(400).json({ error: 'Invalid JSON in request body' })
        }
      }
      
      const { userId: bodyUserId, messages } = requestBody || {}

      // For POST, userId must come from request body (not query)
      if (!bodyUserId || typeof bodyUserId !== 'string') {
        console.error('Missing userId in request body:', { bodyUserId, body: req.body })
        return res.status(400).json({ 
          error: 'User ID is required',
          received: { 
            userId: bodyUserId, 
            hasMessages: Array.isArray(messages),
            bodyKeys: req.body ? Object.keys(req.body) : []
          }
        })
      }

      if (!Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages must be an array' })
      }

      try {
        // Convert mobile app message format to ConversationMessage format
        const conversations = messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date(),
        }))

        // Keep only last 20 messages (matching AIContextManager limit)
        const recentMessages = conversations.slice(-20)

        // Get existing context to preserve other fields
        const { data: existing } = await supabase
          .from('AIContextWindow')
          .select('*')
          .eq('userId', bodyUserId)
          .maybeSingle()

        // Use upsert to save (preserves existing fields if they exist)
        const upsertData: any = {
          userId: bodyUserId,
          recentMessages: JSON.stringify(recentMessages),
          updatedAt: new Date().toISOString(),
        }

        // Preserve existing fields if they exist
        if (existing) {
          upsertData.storeConnectionId = existing.storeConnectionId || null
          upsertData.currentIssues = existing.currentIssues || JSON.stringify([])
          upsertData.optimizationHistory = existing.optimizationHistory || JSON.stringify([])
          upsertData.storeData = existing.storeData || null
        } else {
          upsertData.storeConnectionId = null
          upsertData.currentIssues = JSON.stringify([])
          upsertData.optimizationHistory = JSON.stringify([])
          upsertData.storeData = null
        }

        console.log('🔷 POST /api/messages - Upserting to Supabase:', {
          userId: bodyUserId,
          messageCount: recentMessages.length,
          upsertData: {
            userId: upsertData.userId,
            recentMessagesLength: upsertData.recentMessages?.length,
            hasStoreConnectionId: !!upsertData.storeConnectionId
          }
        })

        const { data: savedData, error: saveError } = await supabase
          .from('AIContextWindow')
          .upsert(upsertData, {
            onConflict: 'userId' // Use userId as the conflict resolution column
          })
          .select()

        console.log('🔷 POST /api/messages - Upsert response:', {
          savedData,
          error: saveError ? {
            message: saveError.message,
            code: saveError.code,
            details: saveError.details
          } : null
        })

        if (saveError) {
          console.error('🔷 POST /api/messages - Error saving messages:', saveError)
          return res.status(500).json({ 
            error: 'Failed to save messages',
            details: saveError.message || 'Unknown error',
            code: saveError.code
          })
        }

        console.log('🔷 POST /api/messages - Successfully saved messages:', { messageCount: recentMessages.length })
        return res.status(200).json({ success: true, messageCount: recentMessages.length })
      } catch (error) {
        console.error('Error in POST /api/messages:', error)
        return res.status(500).json({ 
          error: 'Failed to save messages',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Messages API error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

