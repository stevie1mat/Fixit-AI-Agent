import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Hook to automatically sync messages between localStorage and backend
 * Similar to the mobile app's ChatContext sync logic
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

  // Load messages from backend when user logs in or changes
  useEffect(() => {
    if (user?.id && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadMessagesFromBackend(user.id)
    } else if (!user?.id) {
      // Reset when user logs out
      hasLoadedRef.current = false
    }
  }, [user?.id, loadMessagesFromBackend])

  // Save messages to backend whenever they change (after initial load)
  useEffect(() => {
    if (!isLoaded || !user?.id || messages.length === 0) {
      return
    }

    // Debounce saves to avoid too many API calls
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveMessagesToBackend(user.id)
    }, 1000) // Wait 1 second after last change before saving

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [messages, isLoaded, user?.id, saveMessagesToBackend])
}

