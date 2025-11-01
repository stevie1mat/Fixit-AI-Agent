import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID is required' })
    }

    if (req.method === 'GET') {
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
      const { userId: bodyUserId, messages } = req.body

      // For POST, userId must come from request body (not query)
      if (!bodyUserId || typeof bodyUserId !== 'string') {
        return res.status(400).json({ error: 'User ID is required' })
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

