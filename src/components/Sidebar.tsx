'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { X, Settings, History, Store, Plus, Trash2, Sparkles, Zap, Link, Shield, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface DatabaseConnection {
  id: string
  user_id: string
  type: 'shopify' | 'wordpress'
  url: string
  username?: string
  app_password?: string
  access_token?: string
  is_connected: boolean
  created_at: string
  updated_at: string
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth()
  const [connections, setConnections] = useState<DatabaseConnection[]>([])
  const [loadingConnections, setLoadingConnections] = useState(true)

  // Load connections from database
  useEffect(() => {
    if (user?.id) {
      loadConnections()
    } else {
      setConnections([])
      setLoadingConnections(false)
    }
  }, [user?.id])

  // Reload connections when sidebar opens (in case connections were added elsewhere)
  useEffect(() => {
    if (isOpen && user?.id) {
      loadConnections()
    }
  }, [isOpen, user?.id])

  const loadConnections = async () => {
    if (!user?.id) return
    
    setLoadingConnections(true)
    try {
      const response = await fetch(`/api/store-connections?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setConnections(data.connections || [])
      } else {
        console.error('Failed to load connections:', response.statusText)
        setConnections([])
      }
    } catch (error) {
      console.error('Error loading connections:', error)
      setConnections([])
    } finally {
      setLoadingConnections(false)
    }
  }

  const handleRemoveConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to remove this connection?')) {
      return
    }

    try {
      const response = await fetch(`/api/store-connections?connectionId=${connectionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Reload connections after delete
        await loadConnections()
      } else {
        const error = await response.json()
        alert(`Failed to delete: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to remove connection from database:', error)
      alert('Failed to delete connection')
    }
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-urbanist font-normal text-gray-900">Fix It AI</h2>
                <p className="text-xs font-urbanist font-light text-gray-600">AI Assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Quick Actions */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4 font-urbanist">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full justify-start border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-urbanist font-light"
                  asChild
                >
                  <a href="/settings" onClick={onClose}>
                    <Link className="h-4 w-4 mr-3" />
                    Connect Store
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full justify-start border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-urbanist font-light"
                  asChild
                >
                  <a href="/settings" onClick={onClose}>
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full justify-start border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-urbanist font-light"
                  asChild
                >
                  <a href="/logs" onClick={onClose}>
                    <History className="h-4 w-4 mr-3" />
                    View Logs
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full justify-start border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-urbanist font-light"
                  asChild
                >
                  <a href="/ai-training" onClick={onClose}>
                    <Brain className="h-4 w-4 mr-3" />
                    AI Training
                  </a>
                </Button>
              </div>
            </div>

            {/* Store Connections */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 font-urbanist">Store Connections</h3>
                <Button variant="ghost" size="sm" asChild className="hover:bg-gray-100">
                  <a href="/settings" onClick={onClose}>
                    <Plus className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              
              {loadingConnections ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-urbanist font-light text-gray-600">
                    Loading connections...
                  </p>
                </div>
              ) : connections.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Store className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-urbanist font-light text-gray-600 mb-3">
                    No stores connected yet.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="font-urbanist font-light"
                    asChild
                  >
                    <a href="/settings" onClick={onClose}>
                      Connect Your First Store
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            connection.is_connected ? 'bg-green-500' : 'bg-red-500'
                          )} />
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            {connection.type}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveConnection(connection.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                          title="Remove connection"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-urbanist font-light text-gray-700 truncate">
                        {connection.url}
                      </p>
                      {connection.username && (
                        <p className="text-xs font-urbanist font-light text-gray-500 mt-1">
                          User: {connection.username}
                        </p>
                      )}
                      <div className="flex items-center space-x-1 mt-2">
                        <Shield className="h-3 w-3 text-green-500" />
                        <span className="text-xs font-urbanist font-light text-green-600">
                          {connection.is_connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>


          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Zap className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-urbanist font-light text-gray-500">AI Powered</span>
            </div>
            <div className="text-xs font-urbanist font-light text-gray-500 text-center">
              Fix It AI v1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
