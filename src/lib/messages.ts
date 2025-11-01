import { Message } from './store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export async function fetchMessagesFromBackend(userId: string): Promise<Message[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/messages?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch messages:', response.status)
      return []
    }

    const data = await response.json()
    
    if (data.messages && Array.isArray(data.messages)) {
      // Convert ConversationMessage format to Message format
      const messages: Message[] = data.messages.map((conv: any, index: number) => ({
        id: `backend_${Date.now()}_${index}`,
        role: conv.role,
        content: conv.content,
        timestamp: new Date(conv.timestamp || Date.now()),
      }))
      return messages
    }

    return []
  } catch (error) {
    console.error('Error fetching messages from backend:', error)
    return []
  }
}

export async function saveMessagesToBackend(userId: string, messages: Message[]): Promise<void> {
  try {
    if (!userId || typeof userId !== 'string') {
      console.error('saveMessagesToBackend called with invalid userId:', userId)
      return
    }

    const requestBody = {
      userId,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    }

    console.log('Saving messages to backend:', { userId, messageCount: messages.length })

    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to save messages:', response.status, errorText)
      throw new Error(`Failed to save: ${response.status} ${errorText}`)
    }
  } catch (error) {
    console.error('Error saving messages to backend:', error)
    throw error
  }
}

