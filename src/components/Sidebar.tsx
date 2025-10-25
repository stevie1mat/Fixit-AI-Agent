'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { X, Settings, History, Store, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { connections, messages } = useAppStore()

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
          'fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Fix It AI</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Quick Actions */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
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
                  className="w-full justify-start text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
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
                  className="w-full justify-start text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
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
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800">Store Connections</h3>
                <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
                  <a href="/settings" onClick={onClose}>
                    <Plus className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              
              {connections.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No stores connected yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <Store className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 capitalize">
                            {connection.type}
                          </p>
                          <p className="text-xs text-gray-600">
                            {connection.url}
                          </p>
                        </div>
                      </div>
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          connection.isConnected
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Messages */}
            <div className="px-6 py-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Recent Activity</h3>
              
              {messages.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No recent activity.
                </p>
              ) : (
                <div className="space-y-2">
                  {messages.slice(-5).map((message) => (
                    <div
                      key={message.id}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {message.role === 'user' ? 'You' : 'AI'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {message.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center">
              Fix It AI v1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
