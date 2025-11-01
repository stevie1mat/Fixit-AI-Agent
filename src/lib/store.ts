import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { fetchMessagesFromBackend, saveMessagesToBackend } from './messages'

// Helper function to generate UUID
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChangePreview {
  id: string
  type: 'shopify' | 'wordpress'
  description: string
  beforeState: any
  afterState: any
  diff: string
}

export interface StoreConnection {
  id: string
  type: 'shopify' | 'wordpress'
  url: string
  accessToken?: string
  isConnected: boolean
}

interface AppState {
  // Chat state
  messages: Message[]
  isLoading: boolean
  isLoaded: boolean // Track if messages have been loaded from backend
  
  // Change preview
  currentPreview: ChangePreview | null
  
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
  setMessages: (messages: Message[]) => void
  setLoaded: (loaded: boolean) => void
  loadMessagesFromBackend: (userId: string) => Promise<void>
  saveMessagesToBackend: (userId: string) => Promise<void>
  setCurrentPreview: (preview: ChangePreview | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      isLoaded: false,
      currentPreview: null,

      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: new Date(),
        }
        set((state) => ({
          messages: [...state.messages, newMessage],
        }))
      },

      updateLastMessage: (content) => {
        set((state) => {
          const updatedMessages = [...state.messages]
          if (updatedMessages.length > 0) {
            updatedMessages[updatedMessages.length - 1] = {
              ...updatedMessages[updatedMessages.length - 1],
              content,
            }
          }
          return { messages: updatedMessages }
        })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setMessages: (messages) => {
        set({ messages })
      },

      setLoaded: (loaded) => {
        set({ isLoaded: loaded })
      },

      loadMessagesFromBackend: async (userId: string) => {
        try {
          console.log('Loading messages from Supabase...', { userId })

          // Only load from Supabase - no localStorage
          if (userId) {
            try {
              const backendMessages = await fetchMessagesFromBackend(userId)
              console.log('Fetched messages from Supabase:', { 
                backendMessageCount: backendMessages.length
              })
              
              // Always use Supabase as source of truth
              set({ messages: backendMessages || [] })
            } catch (backendError) {
              console.error('Error loading from Supabase:', backendError)
              // Set empty array if backend fails
              set({ messages: [] })
            }
          } else {
            set({ messages: [] })
          }

          set({ isLoaded: true })
        } catch (error) {
          console.error('Error loading messages:', error)
          set({ messages: [], isLoaded: true })
        }
      },

      saveMessagesToBackend: async (userId: string) => {
        const { messages } = get()
        if (!userId) {
          console.log('Skipping save - no userId', { userId })
          return
        }

        try {
          console.log('Saving messages to Supabase...', { userId, messageCount: messages.length })
          // Always save to Supabase, even if empty (to clear/keep in sync)
          await saveMessagesToBackend(userId, messages)
          console.log('Messages saved successfully to Supabase', { messageCount: messages.length })
        } catch (error) {
          console.error('Error saving to Supabase:', error)
        }
      },

      clearMessages: () => {
        set({ messages: [] })
      },

      setCurrentPreview: (preview) => {
        set({ currentPreview: preview })
      },
    }),
    {
      name: 'fixit-ai-storage',
      partialize: (state) => ({
        // Don't persist messages to localStorage - use Supabase only
      }),
      // Use createJSONStorage with safe localStorage access
      storage: isBrowser 
        ? createJSONStorage(() => localStorage)
        : createJSONStorage(() => ({
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          })),
    }
  )
)
