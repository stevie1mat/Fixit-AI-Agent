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

  // Load messages from Supabase when user logs in or changes
  useEffect(() => {
    console.log('useMessageSync: User state changed', { 
      userId: user?.id, 
      hasLoaded: hasLoadedRef.current,
      isLoaded 
    })

    if (user?.id && !hasLoadedRef.current) {
      console.log('useMessageSync: Loading messages for user:', user.id)
      hasLoadedRef.current = true
      loadMessagesFromBackend(user.id).catch(err => {
        console.error('useMessageSync: Failed to load messages:', err)
      })
    } else if (!user?.id) {
      // Reset when user logs out
      console.log('useMessageSync: User logged out, resetting')
      hasLoadedRef.current = false
      messagesRef.current = ''
    }
  }, [user?.id, loadMessagesFromBackend])

  // Note: Messages are saved by the chat API (AIContextManager) automatically
  // We only need to save here if messages change outside of the chat API flow
  // (e.g., if user manually edits or deletes messages in the UI)
  
  // For now, we rely on the chat API to save messages, and we only load on mount
  // If you need to save messages from the frontend, uncomment below:
  /*
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

    // Debounce saves to avoid too many API calls
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Save to Supabase (with debounce to avoid race conditions with chat API)
    if (messages.length > 0) {
      saveTimeoutRef.current = setTimeout(() => {
        console.log('Auto-saving messages to Supabase...', { messageCount: messages.length })
        saveMessagesToBackend(user.id).catch(err => {
          console.error('Failed to auto-save messages to Supabase:', err)
        })
      }, 2000) // Longer debounce to let chat API save first
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [messages, isLoaded, user?.id])
  */
}

