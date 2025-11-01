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

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'User ID is required' })
      }
      // Get messages from Supabase (works on Vercel)
      try {
        const { data: contextData, error } = await supabase
          .from('AIContextWindow')
          .select('recentMessages')
          .eq('userId', userId)
          .maybeSingle()

        if (error) {
          console.error('Error fetching messages:', error)
          // If table doesn't exist, return empty array instead of error
          if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
            return res.status(200).json({ messages: [] })
          }
          return res.status(500).json({ 
            error: 'Failed to fetch messages',
            details: error.message || 'Unknown error',
            code: error.code
          })
        }

        if (contextData && contextData.recentMessages) {
          const messages = JSON.parse(contextData.recentMessages)
          return res.status(200).json({ messages })
        }

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

        const { error: saveError } = await supabase
          .from('AIContextWindow')
          .upsert(upsertData)

        if (saveError) {
          console.error('Error saving messages:', saveError)
          return res.status(500).json({ 
            error: 'Failed to save messages',
            details: saveError.message || 'Unknown error',
            code: saveError.code
          })
        }

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

