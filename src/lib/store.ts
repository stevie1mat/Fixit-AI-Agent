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
  
  // Store connections
  connections: StoreConnection[]
  
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
  addConnection: (connection: Omit<StoreConnection, 'id'>) => void
  removeConnection: (id: string) => void
  setCurrentPreview: (preview: ChangePreview | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      isLoaded: false,
      connections: [],
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
          // Get current messages from Zustand state (already loaded from localStorage via persist)
          const currentMessages = get().messages

          // Sync with backend if user is logged in
          if (userId) {
            try {
              const backendMessages = await fetchMessagesFromBackend(userId)
              if (backendMessages.length > 0) {
                // Merge backend messages with local (backend takes precedence if different)
                // Or use backend if local is empty
                if (currentMessages.length === 0 || backendMessages.length > currentMessages.length) {
                  set({ messages: backendMessages })
                  // Zustand persist will automatically save to localStorage
                }
              }
            } catch (backendError) {
              console.error('Error loading from backend:', backendError)
              // Continue with local messages if backend fails
            }
          }

          set({ isLoaded: true })
        } catch (error) {
          console.error('Error loading messages:', error)
          set({ isLoaded: true })
        }
      },

      saveMessagesToBackend: async (userId: string) => {
        const { messages } = get()
        if (!userId || messages.length === 0) {
          return
        }

        try {
          await saveMessagesToBackend(userId, messages)
          console.log('Messages saved successfully to backend')
        } catch (error) {
          console.error('Error saving to backend:', error)
          // Continue - local storage is still saved
        }
      },

      clearMessages: () => {
        set({ messages: [] })
      },

      addConnection: (connection) => {
        const newConnection: StoreConnection = {
          ...connection,
          id: generateId(),
        }
        set((state) => ({
          connections: [...state.connections, newConnection],
        }))
      },

      removeConnection: (id) => {
        set((state) => ({
          connections: state.connections.filter((conn) => conn.id !== id),
        }))
      },

      setCurrentPreview: (preview) => {
        set({ currentPreview: preview })
      },
    }),
    {
      name: 'fixit-ai-storage',
      partialize: (state) => ({
        messages: state.messages.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
        })),
        connections: state.connections,
      }),
      // Use createJSONStorage with safe localStorage access
      storage: isBrowser 
        ? createJSONStorage(() => localStorage)
        : createJSONStorage(() => ({
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          })),
      onRehydrateStorage: () => (state) => {
        // Convert timestamp strings back to Date objects after rehydration
        if (state?.messages && Array.isArray(state.messages)) {
          state.messages = state.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          }))
        }
      },
    }
  )
)
