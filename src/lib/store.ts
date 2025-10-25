import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ConnectionService, Connection } from './connectionService'

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
  accessToken?: string // For Shopify
  username?: string // For WordPress
  appPassword?: string // For WordPress
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
  loadConnections: () => Promise<void>
  createConnection: (connectionData: {
    storeType: 'shopify' | 'wordpress'
    storeUrl: string
    accessToken?: string
    username?: string
    appPassword?: string
  }) => Promise<void>
  updateConnection: (id: string, updateData: any) => Promise<void>
  deleteConnection: (id: string) => Promise<void>
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
          id: crypto.randomUUID(),
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
          id: crypto.randomUUID(),
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

      loadConnections: async () => {
        try {
          const connections = await ConnectionService.getConnections()
          const storeConnections = connections.map(conn => ({
            id: conn.id,
            type: conn.storeType,
            url: conn.storeUrl,
            accessToken: conn.accessToken,
            username: conn.username,
            appPassword: conn.appPassword,
            isConnected: conn.isActive,
          }))
          set({ connections: storeConnections })
        } catch (error) {
          console.error('Failed to load connections:', error)
        }
      },

      createConnection: async (connectionData) => {
        try {
          const connection = await ConnectionService.createConnection(connectionData)
          const storeConnection = {
            id: connection.id,
            type: connection.storeType,
            url: connection.storeUrl,
            accessToken: connection.accessToken,
            username: connection.username,
            appPassword: connection.appPassword,
            isConnected: connection.isActive,
          }
          set((state) => ({
            connections: [...state.connections, storeConnection],
          }))
        } catch (error) {
          console.error('Failed to create connection:', error)
          throw error
        }
      },

      updateConnection: async (id, updateData) => {
        try {
          const connection = await ConnectionService.updateConnection(id, updateData)
          const storeConnection = {
            id: connection.id,
            type: connection.storeType,
            url: connection.storeUrl,
            accessToken: connection.accessToken,
            username: connection.username,
            appPassword: connection.appPassword,
            isConnected: connection.isActive,
          }
          set((state) => ({
            connections: state.connections.map(conn => 
              conn.id === id ? storeConnection : conn
            ),
          }))
        } catch (error) {
          console.error('Failed to update connection:', error)
          throw error
        }
      },

      deleteConnection: async (id) => {
        try {
          await ConnectionService.deleteConnection(id)
          set((state) => ({
            connections: state.connections.filter((conn) => conn.id !== id),
          }))
        } catch (error) {
          console.error('Failed to delete connection:', error)
          throw error
        }
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
    }
  )
)
