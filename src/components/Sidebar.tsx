'use client'

import { useAppStore } from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { X, Settings, History, Store, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { connections, messages, removeConnection } = useAppStore()
  const { user } = useAuth()

  const handleRemoveConnection = async (connectionId: string) => {
    // Remove from local store
    removeConnection(connectionId)

    // Remove from database
    if (user?.id) {
      try {
        await fetch(`/api/store-connections?connectionId=${connectionId}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('Failed to remove connection from database:', error)
      }
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
          'fixed inset-y-0 left-0 z-50 w-80 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Fix It AI</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Quick Actions */}
            <div className="p-4 border-b">
              <h3 className="font-medium mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/settings" onClick={onClose}>
                    <Store className="h-4 w-4 mr-2" />
                    Connect Store
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/settings" onClick={onClose}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/logs" onClick={onClose}>
                    <History className="h-4 w-4 mr-2" />
                    View Logs
                  </a>
                </Button>
              </div>
            </div>

            {/* Store Connections */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Store Connections</h3>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/settings" onClick={onClose}>
                    <Plus className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              
              {connections.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No stores connected yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                    >
                      <div className="flex items-center space-x-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {connection.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {connection.url}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            connection.isConnected
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          )}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveConnection(connection.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          title="Remove connection"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Messages */}
            <div className="p-4">
              <h3 className="font-medium mb-3">Recent Activity</h3>
              
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recent activity.
                </p>
              ) : (
                <div className="space-y-2">
                  {messages.slice(-5).map((message) => (
                    <div
                      key={message.id}
                      className="p-2 rounded-md bg-muted/50"
                    >
                      <p className="text-sm font-medium">
                        {message.role === 'user' ? 'You' : 'AI'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {message.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground text-center">
              Fix It AI v1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
