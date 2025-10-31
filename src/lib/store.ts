import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
  
  // Store connections
  connections: StoreConnection[]
  
  // Change preview
  currentPreview: ChangePreview | null
  
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
  addConnection: (connection: Omit<StoreConnection, 'id'>) => void
  removeConnection: (id: string) => void
  setCurrentPreview: (preview: ChangePreview | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
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
        messages: state.messages,
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
    }
  )
)
