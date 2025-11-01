import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Hook to automatically sync messages with Supabase
 * Messages are only stored in Supabase, not localStorage
 */
export function useMessageSync() {
  const { user } = useAuth()
  const { 
    messages, 
    isLoaded, 
    loadMessagesFromBackend, 
    saveMessagesToBackend 
  } = useAppStore()
  const hasLoadedRef = useRef(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesRef = useRef<string>('')

  // Load messages from backend when user logs in or changes
  useEffect(() => {
    if (user?.id && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadMessagesFromBackend(user.id)
    } else if (!user?.id) {
      // Reset when user logs out
      hasLoadedRef.current = false
      messagesRef.current = ''
    }
  }, [user?.id])

  // Save messages to Supabase immediately when they change (after initial load)
  useEffect(() => {
    if (!isLoaded || !user?.id) {
      return
    }

    // Create a string representation of messages to detect changes
    const messagesString = JSON.stringify(messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
    })))

    // Only save if messages actually changed
    if (messagesString === messagesRef.current) {
      return
    }

    messagesRef.current = messagesString

    // Debounce saves to avoid too many API calls, but save more frequently
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Save to Supabase immediately (with short debounce for streaming updates)
    if (messages.length > 0) {
      saveTimeoutRef.current = setTimeout(() => {
        console.log('Auto-saving messages to Supabase...', { messageCount: messages.length })
        saveMessagesToBackend(user.id).catch(err => {
          console.error('Failed to auto-save messages to Supabase:', err)
        })
      }, 500) // Shorter debounce for faster sync
    } else {
      // If messages are empty, still save to clear Supabase
      saveTimeoutRef.current = setTimeout(() => {
        saveMessagesToBackend(user.id).catch(err => {
          console.error('Failed to clear messages in Supabase:', err)
        })
      }, 500)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [messages, isLoaded, user?.id])
}

