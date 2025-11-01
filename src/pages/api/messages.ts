import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { AIContextManager } from '@/lib/ai-context'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID is required' })
    }

    if (req.method === 'GET') {
      // Get messages from AIContextWindow
      try {
        const { data: contextData, error } = await supabase
          .from('AIContextWindow')
          .select('recentMessages')
          .eq('userId', userId)
          .single()

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "not found" which is okay
          console.error('Error fetching messages:', error)
          return res.status(500).json({ error: 'Failed to fetch messages' })
        }

        if (contextData && contextData.recentMessages) {
          const messages = JSON.parse(contextData.recentMessages)
          return res.status(200).json({ messages })
        }

        return res.status(200).json({ messages: [] })
      } catch (error) {
        console.error('Error in GET /api/messages:', error)
        return res.status(500).json({ error: 'Internal server error' })
      }
    }

    if (req.method === 'POST') {
      // Save messages to AIContextWindow
      const { messages } = req.body

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

        const contextManager = new AIContextManager(userId)
        await contextManager.loadContext()

        // Update the context manager's conversations
        // Clear existing and add new ones
        const { data: existing } = await supabase
          .from('AIContextWindow')
          .select('*')
          .eq('userId', userId)
          .single()

        // Use upsert to save
        const { error: saveError } = await supabase
          .from('AIContextWindow')
          .upsert({
            userId,
            recentMessages: JSON.stringify(recentMessages),
            storeConnectionId: existing?.storeConnectionId || null,
            currentIssues: existing?.currentIssues || JSON.stringify([]),
            optimizationHistory: existing?.optimizationHistory || JSON.stringify([]),
            storeData: existing?.storeData || null,
            updatedAt: new Date().toISOString(),
          })

        if (saveError) {
          console.error('Error saving messages:', saveError)
          return res.status(500).json({ error: 'Failed to save messages' })
        }

        return res.status(200).json({ success: true, messageCount: recentMessages.length })
      } catch (error) {
        console.error('Error in POST /api/messages:', error)
        return res.status(500).json({ error: 'Internal server error' })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Messages API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

